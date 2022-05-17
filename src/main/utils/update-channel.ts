/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * Compute the next update channel from the current updating channel
 * @param defaultChannel The default (initial) channel to check
 * @param channel The current channel that did not have a new version associated with it
 * @returns The channel name of the next release version
 */
export function nextUpdateChannel(defaultChannel: string, channel: string | null): string {
  switch (channel) {
    case "alpha":
      return "beta";
    case "beta":
      return "latest"; // there is no RC currently
    default:
      return defaultChannel;
  }
}
