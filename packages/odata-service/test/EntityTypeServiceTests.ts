import { ODataClient } from "@odata2ts/odata-client-api";

import { EditablePersonModel, Feature, PersonModel, PersonModelServiceVersion } from "./fixture/PersonModel";
import { MockODataClient } from "./mock/MockODataClient";

export function commonEntityTypeServiceTests(
  odataClient: MockODataClient,
  serviceConstructor: new (odataClient: ODataClient, basePath: string, name: string) => PersonModelServiceVersion
) {
  const BASE_URL = "/test";
  const NAME = "EntityXY('tester')";
  const EXPECTED_PATH = `${BASE_URL}/${NAME}`;
  const REQUEST_CONFIG = { test: "Test" };

  let testService: PersonModelServiceVersion;

  beforeEach(() => {
    testService = new serviceConstructor(odataClient, BASE_URL, NAME);
  });

  test("entitySet: setup", async () => {
    expect(testService.getPath()).toBe(EXPECTED_PATH);
  });

  test("entityType: query", async () => {
    const expected = `${EXPECTED_PATH}`;
    const expectedData = {
      userName: "tester",
      Age: "14",
      FavFeature: Feature.Feature1,
    };

    odataClient.setModelResponse({
      UserName: "tester",
      Age: 14,
      FavFeature: Feature.Feature1,
    });
    let result = await testService.query();
    // @ts-ignore
    const resultData = result.data.d || result.data;

    await testService.query();

    expect(odataClient.lastUrl).toBe(expected);
    expect(odataClient.lastData).toBeUndefined();
    expect(odataClient.lastOperation).toBe("GET");
    expect(odataClient.lastRequestConfig).toBeUndefined();
    expect(resultData).toStrictEqual(expectedData);

    await testService.query(undefined, REQUEST_CONFIG);
    expect(odataClient.lastRequestConfig).toMatchObject(REQUEST_CONFIG);
  });

  test("entityType: query with select", async () => {
    const expected = `${EXPECTED_PATH}?${encodeURIComponent("$select")}=${encodeURIComponent("UserName,Age")}`;

    await testService.query((queryBuilder) => queryBuilder.select("userName", "Age"));

    expect(odataClient.lastUrl).toBe(expected);
    expect(odataClient.lastData).toBeUndefined();
    expect(odataClient.lastOperation).toBe("GET");
  });

  test("entityType: query with qObject", async () => {
    const expected = `${EXPECTED_PATH}?${encodeURIComponent("$filter")}=${encodeURIComponent("Age gt 18")}`;

    await testService.query((queryBuilder, qObj) => queryBuilder.filter(qObj.Age.gt("18")));

    expect(odataClient.lastUrl).toBe(expected);
    expect(odataClient.lastData).toBeUndefined();
    expect(odataClient.lastOperation).toBe("GET");
  });

  test("entityType: no create", async () => {
    // @ts-expect-error: expected, because the create method shouldn't exist
    expect(testService.create).toBeUndefined();
  });

  test("entityType: update", async () => {
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
    let result = await testService.patch(model);
    // @ts-ignore
    const resultData = result.data.d || result.data;

    expect(odataClient.lastUrl).toBe(EXPECTED_PATH);
    expect(odataClient.lastOperation).toBe("PATCH");
    expect(odataClient.lastData).toEqual(odataModel);
    expect(odataClient.lastRequestConfig).toBeUndefined();
    if (!odataClient.isV2) {
      expect(resultData).toStrictEqual(model);
    }

    result = await testService.patch(model, REQUEST_CONFIG);
    expect(odataClient.lastRequestConfig).toMatchObject(REQUEST_CONFIG);
    expect(result.data).toBeNull();
  });

  test("entityType: patch", async () => {
    const model: Partial<PersonModel> = { Age: "45" };
    const odataModel = { Age: 45 };

    odataClient.setModelResponse(odataModel);
    let result = await testService.patch(model);
    // @ts-ignore
    const resultData = result.data.d || result.data;

    expect(odataClient.lastUrl).toBe(EXPECTED_PATH);
    expect(odataClient.lastOperation).toBe("PATCH");
    expect(odataClient.lastData).toEqual({ Age: 45 });
    expect(odataClient.lastRequestConfig).toBeUndefined();
    if (!odataClient.isV2) {
      expect(resultData).toStrictEqual(model);
    }

    result = await testService.patch(model, REQUEST_CONFIG);
    expect(odataClient.lastRequestConfig).toMatchObject(REQUEST_CONFIG);
    expect(result.data).toBeNull();
  });

  test("entityType: delete", async () => {
    await testService.delete();

    expect(odataClient.lastUrl).toBe(EXPECTED_PATH);
    expect(odataClient.lastOperation).toBe("DELETE");
    expect(odataClient.lastData).toBeUndefined();
    expect(odataClient.lastRequestConfig).toBeUndefined();

    await testService.delete(REQUEST_CONFIG);
    expect(odataClient.lastRequestConfig).toMatchObject(REQUEST_CONFIG);
  });
}
