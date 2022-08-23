/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import getDetailsUrlInjectable from "../../renderer/components/kube-detail-params/get-details-url.injectable";
import hideDetailsInjectable from "../../renderer/components/kube-detail-params/hide-details.injectable";
import showDetailsInjectable from "../../renderer/components/kube-detail-params/show-details.injectable";
import createPageParamInjectable from "../../renderer/navigation/create-page-param.injectable";
import isActiveRouteInjectable from "../../renderer/navigation/is-route-active.injectable";
import navigateInjectable from "../../renderer/navigation/navigate.injectable";
import { asLegacyGlobalFunctionForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";

export type { PageParamInit, PageParam } from "../../renderer/navigation";
export type { URLParams } from "../../common/utils/buildUrl";

export const getDetailsUrl = asLegacyGlobalFunctionForExtensionApi(getDetailsUrlInjectable);
export const showDetails = asLegacyGlobalFunctionForExtensionApi(showDetailsInjectable);
export const hideDetails = asLegacyGlobalFunctionForExtensionApi(hideDetailsInjectable);
export const createPageParam = asLegacyGlobalFunctionForExtensionApi(createPageParamInjectable);
export const isActiveRoute = asLegacyGlobalFunctionForExtensionApi(isActiveRouteInjectable);
export const navigate = asLegacyGlobalFunctionForExtensionApi(navigateInjectable);
