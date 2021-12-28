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
import electronAppInjectable from "./electron-app/electron-app.injectable";
import getElectronAppPathInjectable from "./get-electron-app-path.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import type { App } from "electron";

describe("get-electron-app-path", () => {
  let getElectronAppPath: (name: string) => string | null;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    const appStub = {
      getPath: (name: string) => {
        if (name !== "some-existing-name") {
          throw new Error("irrelevant");
        }

        return "some-existing-app-path";

      },
    } as App;

    di.override(electronAppInjectable, () => appStub);

    getElectronAppPath = di.inject(getElectronAppPathInjectable);
  });

  it("given app path exists, when called, returns app path", () => {
    const actual = getElectronAppPath("some-existing-name");

    expect(actual).toBe("some-existing-app-path");
  });

  it("given app path does not exist, when called, returns null", () => {
    const actual = getElectronAppPath("some-non-existing-name");

    expect(actual).toBe(null);
  });
});
