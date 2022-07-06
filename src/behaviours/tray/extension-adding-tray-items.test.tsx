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
    let someObservable: IObservableValue<boolean>;

    beforeEach(async () => {
      builder = getApplicationBuilder();

      await builder.render();

      builder.preferences.navigate();

      const getExtensionFake = getExtensionFakeFor(builder);

      someObservable = observable.box(false);

      const testExtension = getExtensionFake({
        id: "some-extension-id",
        name: "some-extension",

        mainOptions: {
          trayMenus: [
            {
              label: "some-controlled-visibility",
              click: () => {},
              visible: computed(() => someObservable.get()),
            },

            {
              label: "some-uncontrolled-visibility",
              click: () => {},
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
        someObservable.set(true);
      });

      expect(
        builder.tray.get(
          "some-controlled-visibility-tray-menu-item-for-extension-some-extension",
        ),
      ).not.toBeNull();
    });
  });
});
