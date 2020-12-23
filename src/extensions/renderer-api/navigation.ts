import { PageParam, PageParamInit } from "../../renderer/navigation/page-param";
import { navigation } from "../../renderer/navigation";

export type { PageParamInit, PageParam } from "../../renderer/navigation/page-param";
export { navigate, isActiveRoute } from "../../renderer/navigation/helpers";
export { hideDetails, showDetails, getDetailsUrl } from "../../renderer/components/kube-object/kube-object-details";
export { IURLParams } from "../../common/utils/buildUrl";

// exporting to extensions-api version of helper without `isSystem` flag
export function createPageParam<V = string>(init: PageParamInit<V>) {
  return new PageParam<V>(init, navigation);
}
