/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";

interface Dependencies {
  extensions: IComputedValue<LensRendererExtension[]>;
}

export const getAppPreferenceTabs = ({ extensions }: Dependencies) => {
  return computed(() => (
    extensions.get().flatMap((extension) => extension.appPreferenceTabs)
  ));
};
