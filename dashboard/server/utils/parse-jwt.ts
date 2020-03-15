// Parse payload from jwt token
// Format: https://github.com/kontena/kube-oidc#openid-connect-and-kubernetes
import { base64 } from "../../client/utils/base64";

interface JwtPayload {
  "azp": string;// "1077841816959-kkdh0lvq1au80qv4gtubotvgs9am4a95.apps.googleusercontent.com",
  "aud": string;// "1077841816959-kkdh0lvq1au80qv4gtubotvgs9am4a95.apps.googleusercontent.com",
  "sub": string;// "103613003764490648449",
  "hd": string;// "redhat.com",
  "email": string;// "echiang@redhat.com",
  "email_verified": boolean; // true,
  "at_hash": string;// "OGDOjIJ92FkatDBoCm8ydg",
  "exp": number;// 1527203940,
  "iss": string;// "https://accounts.google.com",
  "iat": number;// 1527200340,
  "name": string; // "Eric Chiang",
  "picture": string; // "https://lh5.googleusercontent.com/-Cs2iHTXiETs/AAAAAAAAAAI/AAAAAAAAACM/0Q85UhZizjg/s96-c/photo.jpg",
  "given_name": string; // "Eric",
  "family_name": string; //"Chiang",
  "locale": string; // "en"
}

export function parseJwt(token: string): Partial<JwtPayload> {
  try {
    const [header, payload, signature] = token.split(".");
    return base64.decode(payload);
  } catch (e) {
    return {}
  }
}
