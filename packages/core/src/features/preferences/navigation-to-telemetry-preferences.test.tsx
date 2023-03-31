/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import React from "react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import navigateToTelemetryPreferencesInjectable from "./common/navigate-to-telemetry-preferences.injectable";
import sentryDataSourceNameInjectable from "../../common/vars/sentry-dsn-url.injectable";
import type { FakeExtensionOptions } from "../../renderer/components/test-utils/get-extension-fake";
import type { Discover } from "@k8slens/react-testing-library-discovery";
import { discoverFor } from "@k8slens/react-testing-library-discovery";

describe("preferences - navigation to telemetry preferences", () => {
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

    it("does not show telemetry preferences yet", () => {
      const { discovered } = discover.querySingleElement(
        "preference-page",
        "telemetry-page",
      );

      expect(discovered).toBeNull();
    });

    it("does not show link for telemetry preferences", () => {
      const { discovered } = discover.querySingleElement(
        "preference-tab-link",
        "telemetry",
      );

      expect(discovered).toBeNull();
    });

    describe("when extension with telemetry preference items gets enabled", () => {
      beforeEach(() => {
        builder.extensions.enable(
          extensionStubWithTelemetryPreferenceItems,
        );
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("shows link for telemetry preferences", () => {
        const { discovered } = discover.getSingleElement(
          "preference-tab-link",
          "telemetry",
        );

        expect(discovered).not.toBeNull();
      });

      describe("when clicking link to telemetry preferences from navigation", () => {
        beforeEach(() => {
          builder.preferences.navigation.click("telemetry");
        });

        it("renders", () => {
          expect(rendered.container).toMatchSnapshot();
        });

        it("shows telemetry preferences", () => {
          const { discovered } = discover.getSingleElement(
            "preference-page",
            "telemetry-page",
          );

          expect(discovered).not.toBeNull();
        });

        it("shows extension telemetry preference items", () => {
          const { attributeValues } =
            discover.queryAllElements("preference-item");

          expect(attributeValues).toEqual([
            "preference-item-for-extension-some-test-extension-name-item-some-telemetry-preference-item-id",
          ]);
        });
      });
    });

    it("given extensions but no telemetry preference items, does not show link for telemetry preferences", () => {
      builder.extensions.enable({
        id: "some-test-extension-id",
        name: "some-test-extension-name",

        rendererOptions: {
          appPreferenceTabs: [
            {
              title: "irrelevant",
              id: "not-telemetry",
            },
          ],

          appPreferences: [
            {
              title: "irrelevant",
              id: "irrelevant",
              showInPreferencesTab: "not-telemetry",
              components: { Hint: () => <div />, Input: () => <div /> },
            },
          ],
        },
      });

      const { discovered } = discover.querySingleElement(
        "preference-tab-link",
        "telemetry",
      );

      expect(discovered).toBeNull();
    });
  });

  describe("given URL for Sentry DNS, when navigating to preferences", () => {
    let rendered: RenderResult;
    let discover: Discover;

    beforeEach(async () => {
      builder.beforeWindowStart(({ windowDi }) => {
        windowDi.override(sentryDataSourceNameInjectable, () => "some-sentry-dns-url");
      });

      rendered = await builder.render();

      discover = discoverFor(() => rendered);

      builder.preferences.navigate();
    });

    describe("when navigating to telemetry preferences", () => {
      beforeEach(() => {
        builder.preferences.navigation.click("telemetry");
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("allows configuration of automatic error reporting", () => {
        const { attributeValues } = discover.queryAllElements(
          "preference-item",
        );

        expect(attributeValues).toEqual(["automatic-error-reporting"]);
      });
    });
  });

  describe("given no URL for Sentry DNS, when navigating to telemetry preferences", () => {
    let rendered: RenderResult;
    let discover: Discover;

    beforeEach(async () => {
      builder.beforeWindowStart(({ windowDi }) => {
        windowDi.override(sentryDataSourceNameInjectable, () => null);
      });

      rendered = await builder.render();

      discover = discoverFor(() => rendered);

      const windowDi = builder.applicationWindow.only.di;

      const navigateToTelemetryPreferences = windowDi.inject(navigateToTelemetryPreferencesInjectable);

      navigateToTelemetryPreferences();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("does not allow configuration of automatic error reporting", () => {
      const { attributeValues } = discover.queryAllElements(
        "preference-item",
      );

      expect(attributeValues).toEqual([]);
    });
  });
});

const extensionStubWithTelemetryPreferenceItems: FakeExtensionOptions = {
  id: "some-test-extension-id",
  name: "some-test-extension-name",

  rendererOptions: {
    appPreferences: [
      {
        title: "Some telemetry-preference item",
        id: "some-telemetry-preference-item-id",
        showInPreferencesTab: "telemetry",

        components: {
          Hint: () => <div data-testid="some-preference-item-hint" />,
          Input: () => <div data-testid="some-preference-item-input" />,
        },
      },
    ],
  },
};
