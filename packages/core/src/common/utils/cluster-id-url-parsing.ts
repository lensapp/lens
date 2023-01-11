/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterId } from "../cluster-types";

/**
 * Grab the `ClusterId` out of a host that was generated by `getClusterFrameUrl`, or nothing
 * @param host The host section of a URL
 * @returns The `ClusterId` part of the host, or `undefined`
 */
export function getClusterIdFromHost(host: string): ClusterId | undefined {
  // e.g host == "%clusterId.localhost:45345"
  const subDomains = host.split(":")[0].split(".");

  return subDomains.slice(-3, -2)[0]; // ClusterId or undefined
}

/**
 * Get the OpenLens backend routing host for a given `ClusterId`
 * @param clusterId The ID to put in front of the current host
 * @returns a new URL host section
 */
export function getClusterFrameUrl(clusterId: ClusterId) {
  return `//${clusterId}.${location.host}`;
}
