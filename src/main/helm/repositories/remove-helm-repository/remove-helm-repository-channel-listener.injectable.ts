/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import removeHelmRepositoryInjectable from "./remove-helm-repository.injectable";
import { removeHelmRepositoryChannel } from "../../../../common/helm/remove-helm-repository-channel";
import { getRequestChannelListenerInjectable } from "../../../utils/channel/channel-listeners/listener-tokens";

const removeHelmRepositoryChannelListenerInjectable = getRequestChannelListenerInjectable({
  channel: removeHelmRepositoryChannel,
  handler: (di) => di.inject(removeHelmRepositoryInjectable),
});

export default removeHelmRepositoryChannelListenerInjectable;
