/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export interface PlatformSpecific<T> {
  instantiate: () => T;
  readonly platform: NodeJS.Platform | "<default>";
}

export const getPlatformSpecificFor = (targetPlatform: NodeJS.Platform, id: string) => <T>(specificImplementations: PlatformSpecific<T>[]): T => {
  const impl = specificImplementations.find(impl => impl.platform === targetPlatform)
    ?? specificImplementations.find(impl => impl.platform === "<default>");

  if (!impl) {
    throw new Error(`No platform specific implementation of "${id}" found`);
  }

  return impl.instantiate();
}
