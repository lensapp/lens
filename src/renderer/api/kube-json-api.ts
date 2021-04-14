import { JsonApi, JsonApiData, JsonApiError } from "./json-api";
import { IKubeObjectMetadata } from "./kube-object";

export interface KubeJsonApiDataList<T = KubeJsonApiData<any, any>> {
  kind: string;
  apiVersion: string;
  items: T[];
  metadata: {
    resourceVersion: string;
    selfLink: string;
  };
}

export interface KubeJsonApiData<Spec, Status> extends JsonApiData {
  kind: string;
  apiVersion: string;
  metadata: IKubeObjectMetadata;
  spec?: Spec;
  status?: Status;
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

export class KubeJsonApi<Spec, Status> extends JsonApi<KubeJsonApiData<Spec, Status>> {
  protected parseError(error: KubeJsonApiError | any, res: Response): string[] {
    const { status, reason, message } = error;

    if (status && reason) {
      return [message || `${status}: ${reason}`];
    }

    return super.parseError(error, res);
  }
}
