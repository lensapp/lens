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
import trayItemsInjectable from "./tray-menu-items.injectable";
import type { IComputedValue } from "mobx";
import { computed, ObservableMap, runInAction } from "mobx";
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import mainExtensionsInjectable from "../../extensions/main-extensions.injectable";
import type { TrayMenuRegistration } from "./tray-menu-registration";

describe("tray-menu-items", () => {
  let di: ConfigurableDependencyInjectionContainer;
  let trayMenuItems: IComputedValue<TrayMenuRegistration[]>;
  let extensionsStub: ObservableMap<string, LensMainExtension>;

  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    await di.runSetups();

    extensionsStub = new ObservableMap();

    di.override(
      mainExtensionsInjectable,
      () => computed(() => [...extensionsStub.values()]),
    );

    trayMenuItems = di.inject(trayItemsInjectable);
  });

  it("does not have any items yet", () => {
    expect(trayMenuItems.get()).toHaveLength(0);
  });

  describe("when extension is enabled", () => {
    beforeEach(() => {
      const someExtension = new SomeTestExtension({
        id: "some-extension-id",
        trayMenus: [{ label: "tray-menu-from-some-extension" }],
      });

      runInAction(() => {
        extensionsStub.set("some-extension-id", someExtension);
      });
    });

    it("has tray menu items", () => {
      expect(trayMenuItems.get()).toEqual([
        {
          label: "tray-menu-from-some-extension",
        },
      ]);
    });

    it("when disabling extension, does not have tray menu items", () => {
      runInAction(() => {
        extensionsStub.delete("some-extension-id");
      });

      expect(trayMenuItems.get()).toHaveLength(0);
    });

    describe("when other extension is enabled", () => {
      beforeEach(() => {
        const someOtherExtension = new SomeTestExtension({
          id: "some-extension-id",
          trayMenus: [{ label: "some-label-from-second-extension" }],
        });

        runInAction(() => {
          extensionsStub.set("some-other-extension-id", someOtherExtension);
        });
      });

      it("has tray menu items for both extensions", () => {
        expect(trayMenuItems.get()).toEqual([
          {
            label: "tray-menu-from-some-extension",
          },

          {
            label: "some-label-from-second-extension",
          },
        ]);
      });

      it("when extension is disabled, still returns tray menu items for extensions that are enabled", () => {
        runInAction(() => {
          extensionsStub.delete("some-other-extension-id");
        });

        expect(trayMenuItems.get()).toEqual([
          {
            label: "tray-menu-from-some-extension",
          },
        ]);
      });
    });
  });
});

class SomeTestExtension extends LensMainExtension {
  constructor({ id, trayMenus }: {
     id: string;
     trayMenus: TrayMenuRegistration[];
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

    this.trayMenus = trayMenus;
  }
}
