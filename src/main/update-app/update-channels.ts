/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export type UpdateChannelId = "alpha" | "beta" | "latest";

export const updateChannels: Record<UpdateChannelId, UpdateChannel> = {
  alpha: {
    id: "alpha",
    label: "Alpha",
  },

  beta: {
    id: "beta",
    label: "Beta",
  },

  latest: {
    id: "latest",
    label: "Stable",
  },
};

export interface UpdateChannel {
  readonly id: UpdateChannelId;
  readonly label: string;
}
