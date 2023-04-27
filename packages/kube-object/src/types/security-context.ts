/**
 * Copyright (c) OpenLens Authors.
 * All rights reserved.
 * Licensed under MIT License.
 * See LICENSE in root directory for more information.
 */

import type { Capabilities } from "./capabilities";
import type { SeLinuxOptions } from "./se-linux-options";
import type { SeccompProfile } from "./seccomp-profile";
import type { WindowsSecurityContextOptions } from "./windows-security-context-options";

/**
 * SecurityContext holds security configuration that will be applied to a container.
 * Some fields are present in both SecurityContext and PodSecurityContext.
 * When both are set, the values in SecurityContext take precedence.
 */
export interface SecurityContext {
  /**
   * AllowPrivilegeEscalation controls whether a process can gain more privileges than its parent process.
   * This bool directly controls if the no_new_privs flag will be set on the container process.
   * AllowPrivilegeEscalation is true always when the container is: 1) run as Privileged 2) has CAP_SYS_ADMIN
   */
  allowPrivilegeEscalation?: boolean;

  capabilities?: Capabilities;

  /**
   * Run container in privileged mode.
   * Processes in privileged containers are essentially equivalent to root on the host.
   *
   * @default false
   */
  privileged?: boolean;

  /**
   * procMount denotes the type of proc mount to use for the containers.
   * The default is DefaultProcMount which uses the container runtime defaults for readonly paths and masked paths.
   * This requires the ProcMountType feature flag to be enabled.
   */
  procMount?: string;

  /**
   * Whether this container has a read-only root filesystem.
   * @default false
   */
  readOnlyRootFilesystem?: boolean;

  /**
   * The GID to run the entrypoint of the container process.
   * Uses runtime default if unset.
   * May also be set in PodSecurityContext.
   *  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence.
   */
  runAsGroup?: number;

  /**
   * Indicates that the container must run as a non-root user.
   * If true, the Kubelet will validate the image at runtime to ensure that it does not run as UID 0 (root)
   * and fail to start the container if it does.
   * If unset or false, no such validation will be performed.
   * May also be set in PodSecurityContext.
   * If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence.
   */
  runAsNonRoot?: boolean;

  /**
   * The UID to run the entrypoint of the container process.
   * Defaults to user specified in image metadata if unspecified.
   * May also be set in PodSecurityContext.
   *  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence.
   */
  runAsUser?: number;

  seLinuxOptions?: SeLinuxOptions;
  seccompProfile?: SeccompProfile;
  windowsOptions?: WindowsSecurityContextOptions;
}
