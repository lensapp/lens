/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import React from "react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import navigateToTelemetryPreferencesInjectable from "../../common/front-end-routing/routes/preferences/telemetry/navigate-to-telemetry-preferences.injectable";
import sentryDnsUrlInjectable from "../../renderer/components/+preferences/sentry-dns-url.injectable";
import type { FakeExtensionOptions } from "../../renderer/components/test-utils/get-extension-fake";

describe("preferences - navigation to telemetry preferences", () => {
  let builder: ApplicationBuilder;

  beforeEach(() => {
    builder = getApplicationBuilder();
  });

  describe("given in preferences, when rendered", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      builder.beforeWindowStart(() => {
        builder.preferences.navigate();
      });

      rendered = await builder.render();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("does not show telemetry preferences yet", () => {
      const page = rendered.queryByTestId("telemetry-preferences-page");

      expect(page).toBeNull();
    });

    it("does not show link for telemetry preferences", () => {
      const actual = rendered.queryByTestId("tab-link-for-telemetry");

      expect(actual).toBeNull();
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
        const actual = rendered.getByTestId("tab-link-for-telemetry");

        expect(actual).not.toBeNull();
      });

      describe("when clicking link to telemetry preferences from navigation", () => {
        beforeEach(() => {
          builder.preferences.navigation.click("telemetry");
        });

        it("renders", () => {
          expect(rendered.container).toMatchSnapshot();
        });

        it("shows telemetry preferences", () => {
          const page = rendered.getByTestId("telemetry-preferences-page");

          expect(page).not.toBeNull();
        });

        it("shows extension telemetry preference items", () => {
          const actual = rendered.getByTestId(
            "telemetry-preference-item-for-some-telemetry-preference-item-id",
          );

          expect(actual).not.toBeNull();
        });
      });
    });

    it("given extensions but no telemetry preference items, does not show link for telemetry preferences", () => {
      builder.extensions.enable({
        id: "some-test-extension-id",
        name: "some-test-extension-name",

        rendererOptions: {
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

      const actual = rendered.queryByTestId("tab-link-for-telemetry");

      expect(actual).toBeNull();
    });
  });

  describe("given URL for Sentry DNS, when navigating to preferences", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      builder.beforeWindowStart((windowDi) => {
        windowDi.override(sentryDnsUrlInjectable, () => "some-sentry-dns-url");
      });

      rendered = await builder.render();

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
        const actual = rendered.getByTestId("telemetry-preferences-for-automatic-error-reporting");

        expect(actual).not.toBeNull();
      });
    });
  });

  describe("given no URL for Sentry DNS, when navigating to telemetry preferences", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      builder.beforeWindowStart((windowDi) => {
        windowDi.override(sentryDnsUrlInjectable, () => null);
      });

      rendered = await builder.render();

      const windowDi = builder.applicationWindow.only.di;

      const navigateToTelemetryPreferences = windowDi.inject(navigateToTelemetryPreferencesInjectable);

      navigateToTelemetryPreferences();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("does not allow configuration of automatic error reporting", () => {
      const actual = rendered.queryByTestId("telemetry-preferences-for-automatic-error-reporting");

      expect(actual).toBeNull();
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
