/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export const getExtensionRouteId = (
  extensionId: string,
  registrationId: string,
) => (registrationId ? `${extensionId}/${registrationId}` : extensionId);
