/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * ResourceRequirements describes the compute resource requirements.
 */
export interface ResourceRequirements {
  /**
    * Limits describes the maximum amount of compute resources allowed.
    *
    * More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
    */
  limits?: Partial<Record<string, string>>;

  /**
   * Requests describes the minimum amount of compute resources required. If Requests is omitted
   * for a container, it defaults to Limits if that is explicitly specified, otherwise to an
   * implementation-defined value.
   *
   * More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
   */
  requests?: Partial<Record<string, string>>;
}
