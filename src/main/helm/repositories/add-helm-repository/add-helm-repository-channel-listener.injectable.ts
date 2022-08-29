/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { addHelmRepositoryChannel } from "../../../../common/helm/add-helm-repository-channel";
import addHelmRepositoryInjectable from "./add-helm-repository.injectable";
import { getRequestChannelListenerInjectable } from "../../../../common/utils/channel/request-channel-listener-injection-token";

const addHelmRepositoryChannelListenerInjectable = getRequestChannelListenerInjectable({
  channel: addHelmRepositoryChannel,
  handlerInjectable: addHelmRepositoryInjectable,
});

export default addHelmRepositoryChannelListenerInjectable;
