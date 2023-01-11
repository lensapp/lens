/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getActiveHelmRepositoriesChannel } from "../../../../common/helm/get-active-helm-repositories-channel";
import { getRequestChannelListenerInjectable } from "../../../utils/channel/channel-listeners/listener-tokens";
import getActiveHelmRepositoriesInjectable from "./get-active-helm-repositories.injectable";

const getActiveHelmRepositoriesChannelListenerInjectable = getRequestChannelListenerInjectable({
  channel: getActiveHelmRepositoriesChannel,
  handler: (di) => di.inject(getActiveHelmRepositoriesInjectable),
});

export default getActiveHelmRepositoriesChannelListenerInjectable;
