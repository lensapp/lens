/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import glob from "glob";
import { memoize } from "lodash/fp";
import { kebabCase } from "lodash/fp";

import {
  createContainer,
  ConfigurableDependencyInjectionContainer,
} from "@ogre-tools/injectable";

import { setLegacyGlobalDiForExtensionApi } from "../extensions/as-legacy-global-function-for-extension-api/legacy-global-di-for-extension-api";
import getElectronAppPathInjectable from "./app-paths/get-electron-app-path/get-electron-app-path.injectable";
import setElectronAppPathInjectable from "./app-paths/set-electron-app-path/set-electron-app-path.injectable";
import appNameInjectable from "./app-paths/app-name/app-name.injectable";
import registerChannelInjectable from "./app-paths/register-channel/register-channel.injectable";
import writeJsonFileInjectable
  from "../common/fs/write-json-file/write-json-file.injectable";
import readJsonFileInjectable
  from "../common/fs/read-json-file/read-json-file.injectable";

export const getDiForUnitTesting = (
  { doGeneralOverrides } = { doGeneralOverrides: false },
) => {
  const di: ConfigurableDependencyInjectionContainer = createContainer();

  setLegacyGlobalDiForExtensionApi(di);

  getInjectableFilePaths()
    .map((key) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const injectable = require(key).default;

      return {
        id: key,
        ...injectable,
        aliases: [injectable, ...(injectable.aliases || [])],
      };
    })

    .forEach((injectable) => di.register(injectable));

  di.preventSideEffects();

  if (doGeneralOverrides) {
    di.override(
      getElectronAppPathInjectable,
      () => (name: string) => `some-electron-app-path-for-${kebabCase(name)}`,
    );

    di.override(setElectronAppPathInjectable, () => () => undefined);
    di.override(appNameInjectable, () => "some-electron-app-name");
    di.override(registerChannelInjectable, () => () => undefined);

    di.override(writeJsonFileInjectable, () => () => {
      throw new Error("Tried to write JSON file to file system without specifying explicit override.");
    });
    
    di.override(readJsonFileInjectable, () => () => {
      throw new Error("Tried to read JSON file from file system without specifying explicit override.");
    });
  }

  return di;
};

const getInjectableFilePaths = memoize(() => [
  ...glob.sync("./**/*.injectable.{ts,tsx}", { cwd: __dirname }),
  ...glob.sync("../extensions/**/*.injectable.{ts,tsx}", { cwd: __dirname }),
  ...glob.sync("../common/**/*.injectable.{ts,tsx}", { cwd: __dirname }),
]);
