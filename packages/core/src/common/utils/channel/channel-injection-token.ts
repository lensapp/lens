/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


export interface Channel<MessageTemplate = void, ReturnTemplate = void> {
  id: string;
  _messageTemplate?: MessageTemplate;
  _returnTemplate?: ReturnTemplate;
}

