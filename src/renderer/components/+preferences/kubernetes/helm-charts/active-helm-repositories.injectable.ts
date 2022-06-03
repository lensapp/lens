/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { asyncComputed } from "@ogre-tools/injectable-react";
import requestFromChannelInjectable from "../../../../utils/channel/request-from-channel.injectable";
import getActiveHelmRepositoriesChannelInjectable from "../../../../../common/helm/get-active-helm-repositories-channel.injectable";

const activeHelmRepositoriesInjectable = getInjectable({
  id: "active-helm-repositories",

  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectable);
    const getHelmRepositoriesChannel = di.inject(getActiveHelmRepositoriesChannelInjectable);

    return asyncComputed(
      async () => await requestFromChannel(getHelmRepositoriesChannel),
      [],
    );
  },
});

export default activeHelmRepositoriesInjectable;
