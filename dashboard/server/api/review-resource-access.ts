// Get resource access review
// Docs: https://kubernetes.io/docs/reference/access-authn-authz/authorization/
import { IKubeRequestParams, kubeRequest } from "./kube-request";

interface IResourceAccess {
  apiVersion: string;
  kind: string;
  status: IResourceAccessStatus;
}

export interface IResourceAccessStatus {
  allowed: boolean;
  denied?: boolean;
  reason?: string;
  evaluationError?: string;
}

interface IResourceAccessAttributes {
  group?: string | "*";
  resource?: string | "*";
  verb?: "get" | "list" | "create" | "update" | "patch" | "watch" | "proxy" | "redirect" | "delete" | "deletecollection" | "*";
  namespace?: string | "*";
}

export async function reviewResourceAccess(
  params: Partial<IKubeRequestParams> = {},
  attrs: IResourceAccessAttributes
): Promise<IResourceAccessStatus> {
  try {
    const accessReview = await kubeRequest<IResourceAccess>({
      ...params,
      method: "POST",
      path: "/apis/authorization.k8s.io/v1/selfsubjectaccessreviews",
      data: {
        spec: {
          resourceAttributes: attrs
        }
      }
    });
    return accessReview.status;
  } catch (err) {
    return {
      allowed: false,
      reason: err.toString(),
    }
  }
}
