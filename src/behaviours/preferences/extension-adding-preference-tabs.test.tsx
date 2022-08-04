/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { IObservableValue } from "mobx";
import { runInAction, computed, observable } from "mobx";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("preferences: extension adding preference tabs", () => {
  let builder: ApplicationBuilder;

  beforeEach(() => {
    builder = getApplicationBuilder();
  });

  describe("given in preferences, when extension with preference tabs is enabled", () => {
    let rendered: RenderResult;
    let someObservable: IObservableValue<boolean>;

    beforeEach(async () => {
      rendered = await builder.render();

      builder.preferences.navigate();

      someObservable = observable.box(false);

      const testExtension = {
        id: "some-extension-id",
        name: "some-extension",

        rendererOptions: {
          appPreferenceTabs: [
            {
              title: "Some title",
              id: "some-preference-tab-id",
              orderNumber: 2,
            },
            {
              title: "Some other title",
              id: "some-other-preference-tab-id",
              orderNumber: 1,
            },
            {
              title: "Some title for item with controlled visibility",
              id: "some-preference-tab-id-with-controlled-visibility",
              orderNumber: 3,
              visible: computed(() => someObservable.get()),
            },
          ],
        },
      };

      builder.extensions.enable(testExtension);

    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("shows tabs in order", () => {
      const actual = rendered.queryAllByTestId(/tab-link-for-extension-some-extension-nav-item-(.*)/).map(x => x.dataset.testid);

      expect(actual).toEqual([
        "tab-link-for-extension-some-extension-nav-item-some-other-preference-tab-id",
        "tab-link-for-extension-some-extension-nav-item-some-preference-tab-id",
      ]);
    });

    it("does not show hidden tab", () => {
      const actual = rendered.queryByTestId(
        "tab-link-for-extension-some-extension-nav-item-some-preference-tab-id-with-controlled-visibility",
      );

      expect(actual).not.toBeInTheDocument();
    });

    it("when item becomes visible, shows the tab", () => {
      runInAction(() => {
        someObservable.set(true);
      });

      const actual = rendered.queryByTestId(
        "tab-link-for-extension-some-extension-nav-item-some-preference-tab-id-with-controlled-visibility",
      );

      expect(actual).toBeInTheDocument();
    });
  });
});
