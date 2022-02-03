/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { computed, IComputedValue } from "mobx";
import type { LensMainExtension } from "../../../extensions/lens-main-extension";
 
interface Dependencies {
  extensions: IComputedValue<LensMainExtension[]>;
}
 
export const shellEnvModifiers = ({ extensions }: Dependencies) => {
  return computed(() => (
    extensions.get()
      .map((extension) => extension.shellEnvModifier)
      .filter(Boolean)
  ));
};
