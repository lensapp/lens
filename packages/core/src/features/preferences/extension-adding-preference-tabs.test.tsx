/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { IObservableValue } from "mobx";
import { runInAction, computed, observable } from "mobx";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { Discover } from "@k8slens/react-testing-library-discovery";
import { discoverFor } from "@k8slens/react-testing-library-discovery";
import React from "react";

describe("preferences: extension adding preference tabs", () => {
  let builder: ApplicationBuilder;

  beforeEach(() => {
    builder = getApplicationBuilder();
  });

  describe("given in preferences, when extension with preference tabs is enabled", () => {
    let rendered: RenderResult;
    let someObservable: IObservableValue<boolean>;
    let discover: Discover;

    beforeEach(async () => {
      rendered = await builder.render();

      discover = discoverFor(() => rendered);

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

          appPreferences: [
            {
              title: "some-title",
              id: "some-preference-item-id",
              showInPreferencesTab: "some-preference-tab-id",

              components: {
                Hint: () => <div />,
                Input: () => <div />,
              },
            },
            {
              title: "some-other-title",
              id: "some-other-preference-item-id",
              showInPreferencesTab: "some-other-preference-tab-id",

              components: {
                Hint: () => <div />,
                Input: () => <div />,
              },
            },
            {
              title: "some-another-title",
              id: "some-another-preference-item-id",
              showInPreferencesTab: "some-preference-tab-id-with-controlled-visibility",

              components: {
                Hint: () => <div />,
                Input: () => <div />,
              },
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
      const actual = discover
        .queryAllElements("preference-tab-link")
        .attributeValues.filter((value) =>
          value?.startsWith("extension-some-extension"),
        );

      expect(actual).toEqual([
        "extension-some-extension-some-other-preference-tab-id",
        "extension-some-extension-some-preference-tab-id",
      ]);
    });

    it("does not show hidden tab", () => {
      const { discovered } = discover.querySingleElement(
        "preference-tab-link",
        "extension-some-extension-some-preference-tab-id-with-controlled-visibility",
      );

      expect(discovered).toBeNull();
    });

    it("when item becomes visible, shows the tab", () => {
      runInAction(() => {
        someObservable.set(true);
      });

      const { discovered } = discover.getSingleElement(
        "preference-tab-link",
        "extension-some-extension-some-preference-tab-id-with-controlled-visibility",
      );

      expect(discovered).not.toBeNull();
    });
  });
});
