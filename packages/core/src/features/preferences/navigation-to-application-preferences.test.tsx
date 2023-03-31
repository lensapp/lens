/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import navigateToProxyPreferencesInjectable from "./common/navigate-to-proxy-preferences.injectable";
import type { Discover } from "@k8slens/react-testing-library-discovery";
import { discoverFor } from "@k8slens/react-testing-library-discovery";
import type { FakeExtensionOptions } from "../../renderer/components/test-utils/get-extension-fake";

describe("preferences - navigation to application preferences", () => {
  let builder: ApplicationBuilder;

  beforeEach(() => {
    builder = getApplicationBuilder();
  });

  describe("given in preferences, when rendered", () => {
    let rendered: RenderResult;
    let discover: Discover;

    beforeEach(async () => {
      builder.beforeWindowStart(() => {
        builder.preferences.navigate();
      });

      rendered = await builder.render();

      discover = discoverFor(() => rendered);
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("shows application preferences", () => {
      const { discovered } = discover.querySingleElement(
        "preference-page",
        "application-page",
      );

      expect(discovered).not.toBeNull();
    });

    describe("when extension with application preference items gets enabled", () => {
      beforeEach(() => {
        builder.extensions.enable(
          extensionStubWithApplicationPreferenceItems,
        );
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("shows preference items of the extension as last", () => {
        const { attributeValues } =
            discover.queryAllElements("preference-item");

        expect(attributeValues.at(-1)).toBe("preference-item-for-extension-some-test-extension-name-item-some-application-preference-item-id");
      });
    });
  });

  describe("given in some child page of preferences, when rendered", () => {
    let rendered: RenderResult;
    let discover: Discover;

    beforeEach(async () => {
      builder.beforeWindowStart(({ windowDi }) => {
        const navigateToProxyPreferences = windowDi.inject(navigateToProxyPreferencesInjectable);

        navigateToProxyPreferences();
      });

      rendered = await builder.render();

      discover = discoverFor(() => rendered);
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("does not show application preferences yet", () => {
      const { discovered } = discover.querySingleElement(
        "preference-page",
        "application-page",
      );

      expect(discovered).toBeNull();
    });

    describe("when navigating to application preferences using navigation", () => {
      beforeEach(() => {
        builder.preferences.navigation.click("app");
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("shows application preferences", () => {
        const { discovered } = discover.getSingleElement(
          "preference-page",
          "application-page",
        );

        expect(discovered).not.toBeNull();
      });
    });

    describe("when navigating to preferences without specifying the tab", () => {
      beforeEach(() => {
        builder.preferences.navigate();
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("shows tab for application preferences for it being the default", () => {
        const { discovered } = discover.getSingleElement(
          "preference-page",
          "application-page",
        );

        expect(discovered).not.toBeNull();
      });
    });
  });
});

const extensionStubWithApplicationPreferenceItems: FakeExtensionOptions = {
  id: "some-test-extension-id",
  name: "some-test-extension-name",

  rendererOptions: {
    appPreferences: [
      {
        title: "Some application-preference item",
        id: "some-application-preference-item-id",
        showInPreferencesTab: "application",

        components: {
          Hint: () => <div data-testid="some-preference-item-hint" />,
          Input: () => <div data-testid="some-preference-item-input" />,
        },
      },
    ],
  },
};
