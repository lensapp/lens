/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * A mapping of a raw block device within a container.
 */
export interface VolumeDevice {
  /**
   * The path inside of the container that the device will be mapped to.
   */
  devicePath: string;

  /**
   * Must match the name of a persistentVolumeClaim in the pod
   */
  name: string;
}
