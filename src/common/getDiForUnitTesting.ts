/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import glob from "glob";
import { memoize } from "lodash/fp";

import {
  createContainer,
  ConfigurableDependencyInjectionContainer,
} from "@ogre-tools/injectable";

export const getDiForUnitTesting = () => {
  const di: ConfigurableDependencyInjectionContainer = createContainer();

  getInjectableFilePaths()
    .map(key => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const injectable = require(key).default;

      return {
        id: key,
        ...injectable,
        aliases: [injectable, ...(injectable.aliases || [])],
      };
    })

    .forEach(injectable => di.register(injectable));

  di.preventSideEffects();

  return di;
};

const getInjectableFilePaths = memoize(() => [
  ...glob.sync("./**/*.injectable.{ts,tsx}", { cwd: __dirname }),
  ...glob.sync("../extensions/**/*.injectable.{ts,tsx}", { cwd: __dirname }),
]);
