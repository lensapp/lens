/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { LensMainExtension } from "../../extensions/lens-main-extension";
import extensionTrayItemsInjectable from "./tray-menu-items.injectable";
import type { IComputedValue } from "mobx";
import { computed, ObservableMap, runInAction } from "mobx";
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import mainExtensionsInjectable from "../../extensions/main-extensions.injectable";
import type { TrayMenuRegistration } from "./tray-menu-registration";

describe("tray-menu-items", () => {
  let di: DiContainer;
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

    trayMenuItems = di.inject(extensionTrayItemsInjectable);
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
