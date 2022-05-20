/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";

export interface Channel<MessageTemplate, ReturnTemplate> {
  id: string;
  _messageTemplate?: MessageTemplate;
  _returnTemplate?: ReturnTemplate;
}

export const channelInjectionToken = getInjectionToken<Channel<any, any>>({
  id: "channel",
});
