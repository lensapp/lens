import { JsonApi, JsonApiData, JsonApiError } from "./json-api";

export type KubeJsonApiResponse = KubeJsonApiData | KubeJsonApiData[] | KubeJsonApiDataList;

export interface KubeJsonApiDataList<T = KubeJsonApiData> {
  kind: string;
  apiVersion: string;
  items: T[];
  metadata: KubeJsonApiListMetadata;
}

export interface KubeJsonApiListMetadata {
  resourceVersion: string;
  selfLink: string;
  continue?: string; // hash-token, ?limit=N is required to use for request
  remainingItemCount?: number; // remained items count from list request with ?limit=
}

export type KubeJsonApiListMetadataParsed = Omit<KubeJsonApiListMetadata, "remainingItemCount"> & {
  itemsCount?: number;
};

export interface KubeJsonApiData extends JsonApiData {
  kind: string;
  apiVersion: string;
  metadata: {
    uid: string;
    name: string;
    namespace?: string;
    creationTimestamp?: string;
    resourceVersion: string;
    continue?: string;
    finalizers?: string[];
    selfLink?: string;
    labels?: {
      [label: string]: string;
    };
    annotations?: {
      [annotation: string]: string;
    };
  };
}

export interface KubeJsonApiError extends JsonApiError {
  code: number;
  status: string;
  message?: string;
  reason: string;
  details: {
    name: string;
    kind: string;
  };
}

export class KubeJsonApi extends JsonApi<KubeJsonApiData> {
  protected parseError(error: KubeJsonApiError | any, res: Response): string[] {
    const { status, reason, message } = error;

    if (status && reason) {
      return [message || `${status}: ${reason}`];
    }

    return super.parseError(error, res);
  }
}
