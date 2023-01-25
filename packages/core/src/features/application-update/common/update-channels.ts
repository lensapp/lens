/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


export type ReleaseChannel = "alpha" | "beta" | "latest";

const latestChannel: UpdateChannel = {
  id: "latest",
  label: "Stable",
  moreStableUpdateChannel: null,
};

const betaChannel: UpdateChannel = {
  id: "beta",
  label: "Beta",
  moreStableUpdateChannel: latestChannel,
};

const alphaChannel: UpdateChannel = {
  id: "alpha",
  label: "Alpha",
  moreStableUpdateChannel: betaChannel,
};

export const updateChannels = {
  latest: latestChannel,
  beta: betaChannel,
  alpha: alphaChannel,
};

export interface UpdateChannel {
  readonly id: ReleaseChannel;
  readonly label: string;
  readonly moreStableUpdateChannel: UpdateChannel | null;
}
