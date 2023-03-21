/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { MessageChannel } from "@k8slens/messaging";

export interface NavigateForExtensionArgs {
  extId: string;
  pageId: string | undefined;
  params: Record<string, any> | undefined;
}

export const navigateForExtensionChannel: MessageChannel<NavigateForExtensionArgs> = {
  id: "navigate-for-extension",
};
