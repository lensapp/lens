/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { MessageChannel } from "../../../../common/utils/channel/message-channel-listener-injection-token";
import type { LensExtensionId } from "../../../../extensions/lens-extension";

export interface ExtensionInstallPhaseData {
  id: LensExtensionId;
  phase: "installing" | "clear-installing";
}

export const setExtensionInstallPhaseChannel: MessageChannel<ExtensionInstallPhaseData> = {
  id: "set-extension-install-phase",
};
