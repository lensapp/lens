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
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import { LensMainExtension } from "../../extensions/lens-main-extension";
import electronMenuItemsInjectable from "./electron-menu-items.injectable";
import type { IComputedValue } from "mobx";
import { computed, ObservableMap, runInAction } from "mobx";
import type { MenuRegistration } from "./menu-registration";
import extensionsInjectable from "../../extensions/extensions.injectable";
import { getDiForUnitTesting } from "../getDiForUnitTesting";

describe("electron-menu-items", () => {
  let di: ConfigurableDependencyInjectionContainer;
  let electronMenuItems: IComputedValue<MenuRegistration[]>;
  let extensionsStub: ObservableMap<string, LensMainExtension>;

  beforeEach(() => {
    di = getDiForUnitTesting();

    extensionsStub = new ObservableMap();

    di.override(
      extensionsInjectable,
      computed(() => [...extensionsStub.values()]),
    );

    electronMenuItems = di.inject(electronMenuItemsInjectable);
  });

  it("does not have any items yet", () => {
    expect(electronMenuItems.get()).toHaveLength(0);
  });

  describe("when extension is enabled", () => {
    beforeEach(() => {
      const someExtension = new SomeTestExtension({
        id: "some-extension-id",
        appMenus: [{ parentId: "some-parent-id-from-first-extension" }],
      });

      runInAction(() => {
        extensionsStub.set("some-extension-id", someExtension);
      });
    });

    it("has menu items", () => {
      expect(electronMenuItems.get()).toEqual([
        {
          parentId: "some-parent-id-from-first-extension",
        },
      ]);
    });

    it("when disabling extension, does not have menu items", () => {
      extensionsStub.delete("some-extension-id");

      expect(electronMenuItems.get()).toHaveLength(0);
    });

    describe("when other extension is enabled", () => {
      beforeEach(() => {
        const someOtherExtension = new SomeTestExtension({
          id: "some-extension-id",
          appMenus: [{ parentId: "some-parent-id-from-second-extension" }],
        });

        extensionsStub.set("some-other-extension-id", someOtherExtension);
      });

      it("has menu items for both extensions", () => {
        expect(electronMenuItems.get()).toEqual([
          {
            parentId: "some-parent-id-from-first-extension",
          },

          {
            parentId: "some-parent-id-from-second-extension",
          },
        ]);
      });

      it("when extension is disabled, still returns menu items for extensions that are enabled", () => {
        runInAction(() => {
          extensionsStub.delete("some-other-extension-id");
        });

        expect(electronMenuItems.get()).toEqual([
          {
            parentId: "some-parent-id-from-first-extension",
          },
        ]);
      });
    });
  });
});

class SomeTestExtension extends LensMainExtension {
  constructor({ id, appMenus }: {
    id: string;
    appMenus: MenuRegistration[];
  }) {
    super({
      id,
      absolutePath: "irrelevant",
      isBundled: false,
      isCompatible: false,
      isEnabled: false,
      manifest: { name: id, version: "some-version" },
      manifestPath: "irrelevant",
    });

    this.appMenus = appMenus;
  }
}
