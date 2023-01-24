/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import askUserForFilePathsInjectable from "../../../main/ipc/ask-user-for-file-paths.injectable";
import { getRequestChannelListenerInjectable } from "../../../main/utils/channel/channel-listeners/listener-tokens";
import { openPathPickingDialogChannel } from "../common/channel";

const openPathPickingDialogListener = getRequestChannelListenerInjectable({
  channel: openPathPickingDialogChannel,
  handler: (di) => di.inject(askUserForFilePathsInjectable),
});

export default openPathPickingDialogListener;
