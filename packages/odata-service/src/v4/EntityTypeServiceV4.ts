import { ODataClient, ODataClientConfig, ODataResponse } from "@odata2ts/odata-client-api";
import { ODataModelResponseV4 } from "@odata2ts/odata-core";
import { ODataQueryBuilderV4 } from "@odata2ts/odata-query-builder";
import { QueryObject, convertV4ModelResponse } from "@odata2ts/odata-query-objects";

import { ServiceBaseV4 } from "./ServiceBaseV4";

export class EntityTypeServiceV4<
  ClientType extends ODataClient,
  T,
  EditableT,
  Q extends QueryObject
> extends ServiceBaseV4<T, Q> {
  public async patch(
    model: Partial<EditableT>,
    requestConfig?: ODataClientConfig<ClientType>
  ): ODataResponse<void | ODataModelResponseV4<T>> {
    const result = await this.doPatch<void | ODataModelResponseV4<T>>(this.qModel.convertToOData(model), requestConfig);
    return convertV4ModelResponse(result, this.qResponseType);
  }

  public async update(
    model: EditableT,
    requestConfig?: ODataClientConfig<ClientType>
  ): ODataResponse<void | ODataModelResponseV4<T>> {
    const result = await this.doPut<void | ODataModelResponseV4<T>>(this.qModel.convertToOData(model), requestConfig);
    return convertV4ModelResponse(result, this.qResponseType);
  }

  public delete: (requestConfig?: ODataClientConfig<ClientType>) => ODataResponse<void> = this.doDelete;

  public async query<ReturnType extends Partial<T> = T>(
    queryFn?: (builder: ODataQueryBuilderV4<Q>, qObject: Q) => void,
    requestConfig?: ODataClientConfig<ClientType>
  ): ODataResponse<ODataModelResponseV4<ReturnType>> {
    const response = await this.doQuery<ODataModelResponseV4<any>>(queryFn, requestConfig);
    return convertV4ModelResponse(response, this.qResponseType);
  }
}
