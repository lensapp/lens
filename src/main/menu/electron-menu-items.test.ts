/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import { LensMainExtension } from "../../extensions/lens-main-extension";
import electronMenuItemsInjectable from "./electron-menu-items.injectable";
import type { IComputedValue } from "mobx";
import { computed, ObservableMap, runInAction } from "mobx";
import type { MenuRegistration } from "./menu-registration";
import { getDiForUnitTesting } from "../getDiForUnitTesting";
import mainExtensionsInjectable from "../../extensions/main-extensions.injectable";

describe("electron-menu-items", () => {
  let di: ConfigurableDependencyInjectionContainer;
  let electronMenuItems: IComputedValue<MenuRegistration[]>;
  let extensionsStub: ObservableMap<string, LensMainExtension>;

  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    extensionsStub = new ObservableMap();

    di.override(
      mainExtensionsInjectable,
      () => computed(() => [...extensionsStub.values()]),
    );

    await di.runSetups();

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
