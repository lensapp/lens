/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { PageParamInit } from "../../renderer/navigation";
import { navigation, PageParam } from "../../renderer/navigation";

export type { PageParamInit, PageParam } from "../../renderer/navigation/page-param";
export { navigate, isActiveRoute } from "../../renderer/navigation/helpers";
export { hideDetails, showDetails, getDetailsUrl } from "../../renderer/components/kube-detail-params";
export type { URLParams } from "../../common/utils/buildUrl";

export function createPageParam<V>(init: PageParamInit<V>) {
  return new PageParam<V>(init, navigation);
}
