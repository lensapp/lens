/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import apiManagerInjectable from "../../../../../common/k8s-api/api-manager/manager.injectable";
import getDetailsUrlInjectable from "../../../kube-detail-params/get-details-url.injectable";

export type GetResourceDetailsUrl = (
  kind: string,
  apiVersion: string,
  namespace: string | undefined,
  name: string
) => string;

const getResourceDetailsUrlInjectable = getInjectable({
  id: "get-resource-details-url",

  instantiate: (di): GetResourceDetailsUrl => {
    const apiManager = di.inject(apiManagerInjectable);
    const getDetailsUrl = di.inject(getDetailsUrlInjectable);

    const getKubeApi = (kind: string, apiVersion: string) =>
      apiManager.getApi(
        (api) => api.kind === kind && api.apiVersionWithGroup == apiVersion,
      );

    return (kind, apiVersion, namespace, name) => {
      const kubeApi = getKubeApi(kind, apiVersion);

      if (!kubeApi) {
        return "";
      }

      const resourceUrl = kubeApi.getUrl({
        name,
        namespace,
      });

      return getDetailsUrl(resourceUrl);
    };
  },
});

export default getResourceDetailsUrlInjectable;
