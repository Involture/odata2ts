import { runApp } from "../src/app";
import * as Generator from "../src/generator";
import { EmitModes, Modes, RunOptions } from "../src/OptionModel";
import * as ProjectManager from "../src/project/ProjectManager";
import { ODataModelBuilderV4 } from "./data-model/builder/v4/ODataModelBuilderV4";
import { getTestConfig } from "./test.config";

jest.mock("fs-extra");
jest.mock("ts-morph");
jest.mock("../src/generator");

const SERVICE_NAME = "Tester";

describe("App Test", () => {
  let runOptions: RunOptions;
  let odataBuilder: ODataModelBuilderV4;
  let createPmSpy: jest.SpyInstance;
  let pmSpy: ProjectManager.ProjectManager;

  beforeAll(async () => {
    // @ts-ignore
    pmSpy = {
      createModelFile: jest.fn(),
      createQObjectFile: jest.fn(),
      cleanServiceDir: jest.fn(),
      createMainServiceFile: jest.fn(),
      createServiceFile: jest.fn(),
      writeFiles: jest.fn(),
    };
    // @ts-ignore
    createPmSpy = jest.spyOn(ProjectManager, "createProjectManager").mockResolvedValue(pmSpy);
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    odataBuilder = new ODataModelBuilderV4(SERVICE_NAME);
    runOptions = {
      ...getTestConfig(),
      mode: Modes.models,
      emitMode: EmitModes.ts,
      source: "ignore",
      output: "ignore",
      prettier: false,
      debug: false,
    };
  });

  function doRunApp() {
    return runApp(odataBuilder.getModel(), runOptions);
  }

  test("App: generate only models", async () => {
    // given preset runOptions
    // when running the app
    await doRunApp();

    // then project manager was called with our arguments
    expect(createPmSpy.mock.calls[0][0]).toMatchObject({
      model: "TesterModel",
      qObject: "QTester",
      service: "TesterService",
    });
    expect(createPmSpy.mock.calls[0][1]).toBe(runOptions.output);
    expect(createPmSpy.mock.calls[0][2]).toBe(runOptions.emitMode);
    expect(createPmSpy.mock.calls[0][3]).toBe(runOptions.prettier);

    // then only generateModels was called
    expect(Generator.generateModels).toHaveBeenCalled();
    expect(Generator.generateQueryObjects).not.toHaveBeenCalled();
    expect(Generator.generateServices).not.toHaveBeenCalled();

    // then files should have been written
    expect(pmSpy.writeFiles).toHaveBeenCalled();
  });

  test("App: generate also QObjects", async () => {
    // given
    runOptions.mode = Modes.qobjects;
    runOptions.output = "testing";
    runOptions.emitMode = EmitModes.js_dts;
    runOptions.prettier = true;

    // when running the app
    await doRunApp();

    // then project manager was called with our arguments
    expect(createPmSpy.mock.calls[0][1]).toBe("testing");
    expect(createPmSpy.mock.calls[0][2]).toBe(EmitModes.js_dts);
    expect(createPmSpy.mock.calls[0][3]).toBe(true);

    // then generateModels & generateQObjects was called
    expect(Generator.generateModels).toHaveBeenCalled();
    expect(Generator.generateQueryObjects).toHaveBeenCalled();
    expect(Generator.generateServices).not.toHaveBeenCalled();

    // then files should have been written
    expect(pmSpy.writeFiles).toHaveBeenCalled();
  });

  test("App: generate also services", async () => {
    // given
    runOptions.mode = Modes.service;

    // when running the app
    await doRunApp();

    // then all generators have been called
    expect(Generator.generateModels).toHaveBeenCalled();
    expect(Generator.generateQueryObjects).toHaveBeenCalled();
    expect(Generator.generateServices).toHaveBeenCalled();

    // then files should have been written
    expect(pmSpy.writeFiles).toHaveBeenCalled();
  });

  test("App: generate all", async () => {
    // given
    runOptions.mode = Modes.all;

    // when running the app
    await doRunApp();

    // then all generators have been called
    expect(Generator.generateModels).toHaveBeenCalled();
    expect(Generator.generateQueryObjects).toHaveBeenCalled();
    expect(Generator.generateServices).toHaveBeenCalled();

    // then files should have been written
    expect(pmSpy.writeFiles).toHaveBeenCalled();
  });
});
