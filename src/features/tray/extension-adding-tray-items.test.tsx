/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IObservableValue } from "mobx";
import { computed, runInAction, observable } from "mobx";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("preferences: extension adding tray items", () => {
  describe("when extension with tray items is enabled", () => {
    let builder: ApplicationBuilder;
    let someObservableForVisibility: IObservableValue<boolean>;
    let someObservableForEnabled: IObservableValue<boolean>;
    let someObservableLabel: IObservableValue<string>;

    beforeEach(async () => {
      builder = getApplicationBuilder();

      await builder.render();

      builder.preferences.navigate();

      someObservableForVisibility = observable.box(false);
      someObservableForEnabled = observable.box(false);
      someObservableLabel = observable.box("Some label");

      const testExtension = {
        id: "some-extension-id",
        name: "some-extension",

        mainOptions: {
          trayMenus: [
            {
              id: "some-controlled-visibility",
              label: "some-controlled-visibility",
              click: () => {},
              visible: computed(() => someObservableForVisibility.get()),
            },

            {
              id: "some-uncontrolled-visibility",
              label: "some-uncontrolled-visibility",
              click: () => {},
            },

            {
              id: "some-controlled-enabled",
              label: "some-controlled-enabled",
              click: () => {},
              enabled: computed(() => someObservableForEnabled.get()),
            },

            {
              id: "some-uncontrolled-enabled",
              label: "some-uncontrolled-enabled",
              click: () => {},
            },

            {
              id: "some-statically-enabled",
              label: "some-statically-enabled",
              click: () => {},
              enabled: true,
            },

            {
              id: "some-statically-disabled",
              label: "some-statically-disabled",
              click: () => {},
              enabled: false,
            },

            {
              id: "some-item-with-controlled-label",
              label: computed(() => someObservableLabel.get()),
              click: () => {},
              enabled: true,
            },
          ],
        },
      };

      builder.extensions.enable(testExtension);
    });

    describe("given controlled label", () => {
      it("has the label", () => {
        const item = builder.tray.get(
          "some-item-with-controlled-label-tray-menu-item-for-extension-some-extension",
        );

        expect(item?.label).toBe("Some label");
      });

      it("when label changes, updates the label", () => {
        runInAction(() => {
          someObservableLabel.set("Some new label");
        });

        const item = builder.tray.get(
          "some-item-with-controlled-label-tray-menu-item-for-extension-some-extension",
        );

        expect(item?.label).toBe("Some new label");

      });
    });

    it("given item is statically disabled, item is disabled", () => {
      const item = builder.tray.get(
        "some-statically-disabled-tray-menu-item-for-extension-some-extension",
      );

      expect(item?.enabled).toBe(false);
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
