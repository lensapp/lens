// Parse kube-api path and get api-version, group, etc.
import { splitArray } from "../../common/utils";

export interface IKubeApiLinkRef {
  apiPrefix?: string;
  apiVersion: string;
  resource: string;
  name: string;
  namespace?: string;
}

export interface IKubeApiLinkBase extends IKubeApiLinkRef {
  apiBase: string;
  apiGroup: string;
  apiVersionWithGroup: string;
}

export function parseApi(path: string): IKubeApiLinkBase {
  path = new URL(path, location.origin).pathname;
  const [, prefix, ...parts] = path.split("/");
  const apiPrefix = `/${prefix}`;

  const [left, right, namespaced] = splitArray(parts, "namespaces");
  let apiGroup, apiVersion, namespace, resource, name;

  if (namespaced) {
    switch (right.length) {
    case 1:
      name = right[0];
      // fallthrough
    case 0:
      resource = "namespaces"; // special case this due to `split` removing namespaces
      break;
    default:
      [namespace, resource, name] = right;
      break;
    }

    apiVersion = left.pop();
    apiGroup = left.join("/");
  } else {
    switch (left.length) {
    case 4:
      [apiGroup, apiVersion, resource, name] = left
      break;
    case 2:
      resource = left.pop();
      // fallthrough
    case 1:
      apiVersion = left.pop();
      apiGroup = "";
      break;
    default:
      /**
       * Given that
       *  - `apiVersion` is `GROUP/VERSION` and
       *  - `VERSION` is `DNS_LABEL` which is /^[a-z0-9]((-[a-z0-9])|[a-z0-9])*$/i
       *     where length <= 63
       *  - `GROUP` is /^D(\.D)*$/ where D is `DNS_LABEL` and length <= 253
       *
       * There is no well defined selection from an array of items that were
       * separated by '/'
       *
       * Solution is to create a huristic. Namely:
       * 1. if '.' in left[0] then apiGroup <- left[0]
       * 2. if left[1] matches /^v[0-9]/ then apiGroup, apiVersion <- left[0], left[1]
       * 3. otherwise assume apiVersion <- left[0]
       * 4. always resource, name <- left[(0 or 1)+1..]
       */
      if (left[0].includes('.') || left[1].match(/^v[0-9]/)) {
        [apiGroup, apiVersion] = left;
        resource = left.slice(2).join("/")
      } else {
        apiGroup = "";
        apiVersion = left[0];
        [resource, name] = left.slice(1)
      }
      break;
    }
  }

  const apiVersionWithGroup = [apiGroup, apiVersion].filter(v => v).join("/");
  const apiBase = [apiPrefix, apiGroup, apiVersion, resource].filter(v => v).join("/");

  if (!apiBase) {
    throw new Error(`invalid apiPath: ${path}`)
  }

  return {
    apiBase,
    apiPrefix, apiGroup,
    apiVersion, apiVersionWithGroup,
    namespace, resource, name,
  };
}

export function createApiLink(ref: IKubeApiLinkRef): string {
  const { apiPrefix = "/apis", resource, apiVersion, name } = ref;
  let { namespace } = ref;
  if (namespace) {
    namespace = `namespaces/${namespace}`
  }
  return [apiPrefix, apiVersion, namespace, resource, name]
    .filter(v => v)
    .join("/")
}
