import { JsonApi, JsonApiData, JsonApiError } from "./json-api";

export interface KubeJsonApiDataList<T = KubeJsonApiData> {
  kind: string;
  apiVersion: string;
  items: T[];
  metadata: {
    resourceVersion: string;
    selfLink: string;
  };
}

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
    selfLink: string;
    labels?: {
      [label: string]: string;
    };
    annotations?: {
      [annotation: string]: string;
    };
  };
}

export interface IKubeObjectRef {
  kind: string;
  apiVersion: string;
  name: string;
  namespace?: string;
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

export interface IKubeJsonApiQuery {
  watch?: any;
  resourceVersion?: string;
  timeoutSeconds?: number;
  limit?: number; // doesn't work with ?watch
  continue?: string; // might be used with ?limit from second request
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
