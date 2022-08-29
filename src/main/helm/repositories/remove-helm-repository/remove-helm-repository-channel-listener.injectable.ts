/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRequestChannelListenerInjectable } from "../../../../common/utils/channel/request-channel-listener-injection-token";
import removeHelmRepositoryInjectable from "./remove-helm-repository.injectable";
import { removeHelmRepositoryChannel } from "../../../../common/helm/remove-helm-repository-channel";

const removeHelmRepositoryChannelListenerInjectable = getRequestChannelListenerInjectable({
  channel: removeHelmRepositoryChannel,
  handlerInjectable: removeHelmRepositoryInjectable,
});

export default removeHelmRepositoryChannelListenerInjectable;
