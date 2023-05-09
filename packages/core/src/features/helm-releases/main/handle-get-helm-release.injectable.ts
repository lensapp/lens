/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRequestChannelListenerInjectable } from "@k8slens/messaging";
import { result } from "@k8slens/utilities";
import getHelmReleaseInjectable from "../../../main/helm/helm-service/get-helm-release.injectable";
import getClusterByIdInjectable from "../../cluster/storage/common/get-by-id.injectable";
import { getHelmReleaseChannel } from "../common/channels";

const handleGetHelmReleaseInjectable = getRequestChannelListenerInjectable({
  channel: getHelmReleaseChannel,
  getHandler: (di) => {
    const getHelmRelease = di.inject(getHelmReleaseInjectable);
    const getClusterById = di.inject(getClusterByIdInjectable);

    return async ({ clusterId, ...args }) => {
      const cluster = getClusterById(clusterId);

      if (!cluster) {
        return result.error(`Cluster with id "${clusterId}" not found`);
      }

      const helmResult = await getHelmRelease({
        cluster,
        ...args,
      });

      if (helmResult.isOk) {
        return helmResult;
      }

      return result.error(helmResult.error.message);
    };
  },
  id: "handle-get-helm-release",
});

export default handleGetHelmReleaseInjectable;
