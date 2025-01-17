import { QBooleanParam, QBooleanPath, QFunction, QStringParam, QueryObject } from "@odata2ts/odata-query-objects";
import { booleanToNumberConverter } from "@odata2ts/test-converters";

// @ts-ignore
import { MinFunctionParams } from "./TesterModel";

export class QBook extends QueryObject {
  public readonly id = new QBooleanPath(this.withPrefix("id"), booleanToNumberConverter);
}

export const qBook = new QBook();

export class QMinFunction extends QFunction<MinFunctionParams> {
  private readonly params = [
    new QStringParam("test"),
    new QBooleanParam("optTest", undefined, booleanToNumberConverter),
  ];

  constructor() {
    super("MinFunction");
  }

  getParams() {
    return this.params;
  }
}
