/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createChannel } from "../ipc-channel/create-channel/create-channel";

export const notificationChannel = createChannel<string>("notification:message");
