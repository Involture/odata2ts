import { HttpResponseModel } from "@odata2ts/odata-client-api";
import { ODataCollectionResponseV4 } from "@odata2ts/odata-core";
import { ODataQueryBuilderV4 } from "@odata2ts/odata-query-builder";

import { commonEntitySetTests } from "../EntitySetServiceTests";
import { EditablePersonModel, Feature, PersonModel } from "../fixture/PersonModel";
import { PersonModelCollectionService, PersonModelService } from "../fixture/v4/PersonModelService";
import { QPersonV4, qPersonV4 } from "../fixture/v4/QPersonV4";
import { TestCollectionService, TestService } from "../fixture/v4/TypingModelService";
import { MockODataClient } from "../mock/MockODataClient";

describe("V4 EntitySetService Test", () => {
  const odataClient = new MockODataClient(false);
  const BASE_URL = "/base";
  const NAME = "test";
  const EXPECTED_PATH = `${BASE_URL}/${NAME}`;
  const REQUEST_CONFIG = { test: "Test" };

  let testService: PersonModelCollectionService<MockODataClient>;

  commonEntitySetTests(odataClient, PersonModelCollectionService);

  beforeEach(() => {
    testService = new PersonModelCollectionService(odataClient, BASE_URL, NAME);
  });

  test("entitySet V2: QObject", async () => {
    expect(testService.getQObject()).toBe(qPersonV4);
  });

  test("entitySet: create", async () => {
    const model: EditablePersonModel = {
      userName: "tester",
      Age: "14",
      FavFeature: Feature.Feature1,
      Features: [Feature.Feature1],
    };
    const odataModel = {
      UserName: "tester",
      Age: 14,
      FavFeature: "Feature1",
      Features: ["Feature1"],
    };

    odataClient.setModelResponse(odataModel);
    let result = await testService.create(model);
    // @ts-ignore
    const resultData = result.data.d || result.data;

    expect(odataClient.lastUrl).toBe(EXPECTED_PATH);
    expect(odataClient.lastOperation).toBe("POST");
    expect(odataClient.lastData).toStrictEqual(odataModel);
    expect(odataClient.lastRequestConfig).toBeUndefined();
    expect(resultData).toStrictEqual(model);

    result = await testService.create(model, REQUEST_CONFIG);
    expect(odataClient.lastRequestConfig).toMatchObject(REQUEST_CONFIG);
    expect(result.data).toBeNull();
  });

  test("entitySet: ensure query typings", async () => {
    // just a typing test: this only needs to compile
    const result: HttpResponseModel<ODataCollectionResponseV4<PersonModel>> = await testService.query((builder) => {
      const bResult: ODataQueryBuilderV4<QPersonV4> = builder;
    });

    // manual typings provided
    const result2: HttpResponseModel<ODataCollectionResponseV4<{ userName: string }>> = await testService.query<
      Pick<PersonModel, "userName">
    >((builder) => {
      const bResult: ODataQueryBuilderV4<QPersonV4> = builder;
    });
  });

  test("entitySet: ensure typing of EntityTypeService", async () => {
    // just a typing test: this only needs to compile
    const result: PersonModelService<MockODataClient> = testService.get({ userName: "heinz" });
  });

  test("entitySet: createKey & parseKey with conversions", async () => {
    const toTest = new TestCollectionService(odataClient, "", NAME);
    expect(toTest.createKey("123")).toBe(`${NAME}(123)`);
    expect(toTest.createKey({ id: "456" })).toBe(`${NAME}(ID=456)`);

    expect(toTest.parseKey(`${NAME}(123)`)).toBe("123");
    expect(toTest.parseKey(`${NAME}(ID=456)`)).toStrictEqual({ id: "456" });
  });
});
