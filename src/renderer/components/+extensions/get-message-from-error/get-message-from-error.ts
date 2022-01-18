/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
export function getMessageFromError(error: any): string {
  if (!error || typeof error !== "object") {
    return "an error has occurred";
  }

  if (error.message) {
    return String(error.message);
  }

  if (error.err) {
    return String(error.err);
  }

  const rawMessage = String(error);

  if (rawMessage === String({})) {
    return "an error has occurred";
  }

  return rawMessage;
}
