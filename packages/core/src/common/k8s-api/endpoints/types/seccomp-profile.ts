/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * Defines a pod's or a container's seccomp profile settings. Only one profile source may be set.
 */
export interface SeccompProfile {
  /**
   * Indicates a profile defined in a file on the node should be used. The profile must be
   * preconfigured on the node to work. Must be a descending path, relative to the kubelet's
   * configured seccomp profile location. Must only be set if type is "Localhost".
   */
  localhostProfile?: string;

  /**
   * Indicates which kind of seccomp profile will be applied.
   *
   * Options:
   *
   * | Value | Description |
   * |--|--|
   * | `Localhost` | A profile defined in a file on the node should be used. |
   * | `RuntimeDefault` | The container runtime default profile should be used. |
   * | `Unconfined` | No profile should be applied. |
   */
  type: "Localhost" | "RuntimeDefault" | "Unconfined";
}
