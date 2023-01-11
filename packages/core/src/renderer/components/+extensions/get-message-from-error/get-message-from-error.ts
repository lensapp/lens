/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { hasTypedProperty, isDefined } from "../../../utils";

export function getMessageFromError(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "an error has occurred";
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (hasTypedProperty(error, "err", isDefined)) {
    return String(error.err);
  }

  const rawMessage = String(error);

  if (rawMessage === String({})) {
    return "an error has occurred";
  }

  return rawMessage;
}
