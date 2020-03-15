// Check validity of auth-token
import { kubeRequest } from "./kube-request";

export interface ITokenReview {
  apiVersion: string;
  kind: string;
  status: ITokenReviewStatus;
}

export interface ITokenReviewStatus {
  authenticated: boolean;
  user: {
    username?: string;
    uid?: string;
    groups?: string[];
  };
  error?: string[];
}

export async function reviewToken(authToken: string): Promise<ITokenReviewStatus> {
  try {
    const tokenReview = await kubeRequest<ITokenReview>({
      path: "/apis/authentication.k8s.io/v1/tokenreviews",
      method: "POST",
      data: {
        spec: {
          token: authToken
        }
      }
    });
    return tokenReview.status;
  } catch (err) {
    return {
      authenticated: false,
      user: {},
      error: [err.toString()],
    }
  }
}
