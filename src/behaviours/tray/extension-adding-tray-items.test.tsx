/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IObservableValue } from "mobx";
import { computed, runInAction, observable } from "mobx";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getExtensionFakeFor } from "../../renderer/components/test-utils/get-extension-fake";

describe("preferences: extension adding tray items", () => {
  describe("when extension with tray items is enabled", () => {
    let builder: ApplicationBuilder;
    let someObservableForVisibility: IObservableValue<boolean>;
    let someObservableForEnabled: IObservableValue<boolean>;

    beforeEach(async () => {
      builder = getApplicationBuilder();

      await builder.render();

      builder.preferences.navigate();

      const getExtensionFake = getExtensionFakeFor(builder);

      someObservableForVisibility = observable.box(false);
      someObservableForEnabled = observable.box(false);

      const testExtension = getExtensionFake({
        id: "some-extension-id",
        name: "some-extension",

        mainOptions: {
          trayMenus: [
            {
              label: "some-controlled-visibility",
              click: () => {},
              visible: computed(() => someObservableForVisibility.get()),
            },

            {
              label: "some-uncontrolled-visibility",
              click: () => {},
            },

            {
              label: "some-controlled-enabled",
              click: () => {},
              enabled: computed(() => someObservableForEnabled.get()),
            },

            {
              label: "some-uncontrolled-enabled",
              click: () => {},
            },

            {
              label: "some-statically-enabled",
              click: () => {},
              enabled: true,
            },

            {
              label: "some-statically-disabled",
              click: () => {},
              enabled: false,
            },
          ],
        },
      });

      builder.extensions.enable(testExtension);
    });

    it("shows item which doesn't control the visibility", () => {
      expect(
        builder.tray.get(
          "some-uncontrolled-visibility-tray-menu-item-for-extension-some-extension",
        ),
      ).not.toBeNull();
    });

    it("does not show hidden item", () => {
      expect(
        builder.tray.get(
          "some-controlled-visibility-tray-menu-item-for-extension-some-extension",
        ),
      ).toBeNull();
    });

    it("when item becomes visible, shows the item", () => {
      runInAction(() => {
        someObservableForVisibility.set(true);
      });

      expect(
        builder.tray.get(
          "some-controlled-visibility-tray-menu-item-for-extension-some-extension",
        ),
      ).not.toBeNull();
    });


    it("given item does not have enabled status, item is enabled by default", () => {
      const item = builder.tray.get(
        "some-uncontrolled-enabled-tray-menu-item-for-extension-some-extension",
      );

      expect(item?.enabled).toBe(true);
    });

    describe("given item has controlled enabled status and is disabled", () => {
      it("is disabled", () => {
        const item = builder.tray.get(
          "some-controlled-enabled-tray-menu-item-for-extension-some-extension",
        );

        expect(item?.enabled).toBe(false);
      });

      it("when item becomes enabled, items is enabled", () => {
        runInAction(() => {
          someObservableForEnabled.set(true);
        });

        const item = builder.tray.get(
          "some-controlled-enabled-tray-menu-item-for-extension-some-extension",
        );

        expect(item?.enabled).toBe(true);
      });
    });

    it("given item is statically enabled, item is enabled", () => {
      const item = builder.tray.get(
        "some-statically-enabled-tray-menu-item-for-extension-some-extension",
      );

      expect(item?.enabled).toBe(true);
    });

    it("given item is statically disabled, item is disabled", () => {
      const item = builder.tray.get(
        "some-statically-disabled-tray-menu-item-for-extension-some-extension",
      );

      expect(item?.enabled).toBe(false);
    });
  });
});
