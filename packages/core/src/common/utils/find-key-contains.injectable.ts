/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

export type FindKeyContains = <T>(map: Map<string, T>, text: string) => T | undefined;

const findKeyContainsInjectable = getInjectable({
  id: "find-key-contains",

  instantiate: (): FindKeyContains => {
    return <T>(map: Map<string, T>, text: string) => {
      const entries = map.entries();

      for (const [key, value] of entries) {
        if (key.includes(text)) {
          return value;
        }
      }

      return undefined;
    };
  },
});

export default findKeyContainsInjectable;
