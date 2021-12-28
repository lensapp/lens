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

import {
  createContainer,
  ConfigurableDependencyInjectionContainer,
} from "@ogre-tools/injectable";
import { setLegacyGlobalDiForExtensionApi } from "../../extensions/as-legacy-global-function-for-extension-api/legacy-global-di-for-extension-api";
import getValueFromRegisteredChannelInjectable from "./app-paths/get-value-from-registered-channel/get-value-from-registered-channel.injectable";
import writeJsonFileInjectable from "../../common/fs/write-json-file/write-json-file.injectable";
import readJsonFileInjectable from "../../common/fs/read-json-file/read-json-file.injectable";

export const getDiForUnitTesting = ({ doGeneralOverrides } = { doGeneralOverrides: false }) => {
  const di: ConfigurableDependencyInjectionContainer = createContainer();

  setLegacyGlobalDiForExtensionApi(di);

  getInjectableFilePaths()
    .map(key => {
      const injectable = require(key).default;

      return {
        id: key,
        ...injectable,
        aliases: [injectable, ...(injectable.aliases || [])],
      };
    })

    .forEach(injectable => di.register(injectable));

  di.preventSideEffects();
  
  if (doGeneralOverrides) {
    di.override(getValueFromRegisteredChannelInjectable, () => () => undefined);

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
  ...glob.sync("../**/*.injectable.{ts,tsx}", { cwd: __dirname }),
  ...glob.sync("../../extensions/**/*.injectable.{ts,tsx}", { cwd: __dirname }),
  ...glob.sync("../../common/**/*.injectable.{ts,tsx}", { cwd: __dirname }),
]);
