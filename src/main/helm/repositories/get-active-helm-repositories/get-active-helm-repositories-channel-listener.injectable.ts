/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRequestChannelListenerInjectable } from "../../../../common/utils/channel/request-channel-listener-injection-token";
import { getActiveHelmRepositoriesChannel } from "../../../../common/helm/get-active-helm-repositories-channel";
import getActiveHelmRepositoriesInjectable from "./get-active-helm-repositories.injectable";

const getActiveHelmRepositoriesChannelListenerInjectable = getRequestChannelListenerInjectable({
  channel: getActiveHelmRepositoriesChannel,
  handlerInjectable: getActiveHelmRepositoriesInjectable,
});

export default getActiveHelmRepositoriesChannelListenerInjectable;
