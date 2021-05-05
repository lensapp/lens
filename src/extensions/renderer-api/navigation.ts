import { navigation, PageParam, PageParamInit } from "../../renderer/navigation";

export { PageParamInit, PageParam } from "../../renderer/navigation/page-param";
export { navigate, isActiveRoute } from "../../renderer/navigation/helpers";
export { hideDetails, showDetails, getDetailsUrl } from "../../renderer/components/kube-object/kube-object-details";
export { IURLParams } from "../../common/utils/buildUrl";

export function createPageParam<V>(init: PageParamInit<V>) {
  return new PageParam<V>(init, navigation);
}
