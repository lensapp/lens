/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { addHelmRepositoryChannel } from "../../../../common/helm/add-helm-repository-channel";
import { getRequestChannelListenerInjectable } from "../../../utils/channel/channel-listeners/listener-tokens";
import addHelmRepositoryInjectable from "./add-helm-repository.injectable";

const addHelmRepositoryChannelListenerInjectable = getRequestChannelListenerInjectable({
  channel: addHelmRepositoryChannel,
  handler: (di) => di.inject(addHelmRepositoryInjectable),
});

export default addHelmRepositoryChannelListenerInjectable;
