/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import React from "react";
import "@testing-library/jest-dom/extend-expect";
import type { FakeExtensionOptions } from "../../renderer/components/test-utils/get-extension-fake";
import type { Discover } from "@k8slens/react-testing-library-discovery";
import { discoverFor } from "@k8slens/react-testing-library-discovery";
import logErrorInjectable from "../../common/log-error.injectable";

describe("preferences - navigation to extension specific preferences", () => {
  let builder: ApplicationBuilder;

  beforeEach(() => {
    builder = getApplicationBuilder();
  });

  describe("given in preferences, when rendered", () => {
    let rendered: RenderResult;
    let logErrorMock: jest.Mock;
    let discover: Discover;

    beforeEach(async () => {
      logErrorMock = jest.fn();

      builder.beforeWindowStart(({ windowDi }) => {
        windowDi.override(logErrorInjectable, () => logErrorMock);

        builder.preferences.navigate();
      });

      rendered = await builder.render();

      discover = discoverFor(() => rendered);
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("does not show extension preferences yet", () => {
      // Todo: check if query is correct.
      const { discovered } = discover.querySingleElement(
        "preference-page",
        "extension",
      );

      expect(discovered).toBeNull();
    });

    it("does not show link for extension preferences", () => {
      const actual = rendered.queryByTestId("tab-link-for-extensions");

      expect(actual).toBeNull();
    });

    describe("given multiple extensions with specific preferences, when navigating to extension specific preferences page", () => {
      beforeEach(() => {
        builder.extensions.enable(
          extensionStubWithExtensionSpecificPreferenceItems,
          someOtherExtensionStubWithExtensionSpecificPreferenceItems,
        );

        builder.preferences.navigation.click(
          "some-test-extension-id",
        );
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("doesn't show preferences from unrelated extension", () => {
        const { discovered } = discover.querySingleElement(
          "preference-page",
          "preference-item-for-extension-some-other-test-extension-id-page",
        );

        expect(discovered).toBeNull();
      });

      it("shows preferences from related extension", () => {
        const { discovered } = discover.getSingleElement(
          "preference-page",
          "preference-item-for-extension-some-test-extension-id-page",
        );

        expect(discovered).not.toBeNull();
      });
    });

    describe("given multiple extensions with and without specific preferences", () => {
      beforeEach(() => {
        builder.extensions.enable(
          extensionStubWithExtensionSpecificPreferenceItems,
          extensionStubWithoutPreferences,
          extensionStubWithShowInPreferencesTab,
        );
      });

      it("doesn't show link for extension without preferences", () => {
        const actual = rendered.queryByTestId("tab-link-for-extension-without-preferences-id");

        expect(actual).toBeNull();
      });

      it("doesn't show link for preferences intended for a specific tab", () => {
        const actual = rendered.queryByTestId("tab-link-for-extension-specified-preferences-page-id");

        expect(actual).toBeNull();
      });
    });

    describe("when extension with specific preferences is enabled", () => {
      beforeEach(() => {
        builder.extensions.enable(extensionStubWithExtensionSpecificPreferenceItems);
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("link should not be active", () => {
        const { discovered } = discover.getSingleElement(
          "preference-tab-link",
          "some-test-extension-id",
        );

        expect(discovered).not.toHaveClass("active");
      });

      describe("when navigating to extension preferences using navigation", () => {
        beforeEach(() => {
          builder.preferences.navigation.click("some-test-extension-id");
        });

        it("renders", () => {
          expect(rendered.container).toMatchSnapshot();
        });

        it("shows proper page title", () => {
          const { discovered } = discover.getSingleElement("preference-page-title");

          expect(discovered).toHaveTextContent("some-test-extension-id preferences");
        });

        it("shows only extension specific preference items", () => {
          const { attributeValues } =
            discover.queryAllElements("preference-item");

          expect(attributeValues).toEqual([
            "preference-item-for-extension-some-test-extension-id-item-some-preference-item-id",
          ]);
        });

        it("link is active", () => {
          const { discovered } = discover.getSingleElement(
            "preference-tab-link",
            "some-test-extension-id",
          );

          expect(discovered).toHaveClass("active");
        });

        describe("when extension is disabled", () => {
          beforeEach(() => {
            builder.extensions.disable(extensionStubWithExtensionSpecificPreferenceItems);
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          it("does not show any preference page", () => {
            const { discovered } = discover.querySingleElement("preference-page");

            expect(discovered).toBeNull();
          });

          it("when extension is enabled again, shows the preference page", () => {
            builder.extensions.enable(extensionStubWithExtensionSpecificPreferenceItems);

            const { discovered } = discover.getSingleElement(
              "preference-page",
              "preference-item-for-extension-some-test-extension-id-page",
            );

            expect(discovered).not.toBeNull();
          });
        });
      });
    });

    describe("given extension with registered tab", () => {
      beforeEach(() => {
        builder.extensions.enable(extensionStubWithRegisteredTab);
      });

      it("logs error", () => {
        expect(
          logErrorMock.mock.calls[0][0].startsWith(
            "Tried to create preferences, but encountered references to unknown ids",
          ),
        ).toBe(true);
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("shows extension tab in general area", () => {
        const { discovered } = discover
          .getSingleElement("preference-tab-group", "general-tab-group")
          .getSingleElement(
            "preference-tab-link",
            "extension-registered-tab-page-id-metrics-extension-tab",
          );

        expect(discovered).not.toBeNull();
      });

      it("does not show tab group for extensions for there being no content", () => {
        const { discovered } = discover.querySingleElement(
          "preference-tab-group",
          "extensions-tab-group",
        );

        expect(discovered).toBeNull();
      });

      describe("when navigating to specific extension tab", () => {
        beforeEach(() => {
          builder.preferences.navigation.click("extension-registered-tab-page-id-metrics-extension-tab");
        });

        it("renders", () => {
          expect(rendered.container).toMatchSnapshot();
        });

        it("shows related preferences for this tab", () => {
          const actual = rendered.getByTestId("metrics-preference-item-hint");

          expect(actual).toBeInTheDocument();
        });

        it("does not show unrelated preferences for this tab", () => {
          const actual = rendered.queryByTestId("survey-preference-item-hint");

          expect(actual).not.toBeInTheDocument();
        });

        it("shows correct page title", () => {
          const { discovered } = discover.getSingleElement(
            "preference-page-title",
          );

          expect(discovered).toHaveTextContent("Metrics tab");
        });
      });
    });

    describe("given extensions with tabs having same id", () => {
      beforeEach(() => {
        builder.extensions.enable(
          extensionStubWithRegisteredTab,
          extensionStubWithSameRegisteredTab,
        );
      });

      it("shows tab from the first extension", () => {
        const { discovered } = discover.getSingleElement(
          "preference-tab-link",
          "extension-registered-tab-page-id-metrics-extension-tab",
        );

        expect(discovered).toBeInTheDocument();
      });

      it("shows tab from the second extension", () => {
        const { discovered } = discover.getSingleElement(
          "preference-tab-link",
          "extension-duplicated-tab-page-id-metrics-extension-tab",
        );

        expect(discovered).toBeInTheDocument();
      });

      describe("when navigating to first extension tab", () => {
        beforeEach(() => {
          builder.preferences.navigation.click(
            "extension-registered-tab-page-id-metrics-extension-tab",
          );
        });

        it("renders", () => {
          expect(rendered.container).toMatchSnapshot();
        });

        it("shows related preferences for this tab", () => {
          const { attributeValues } = discover.queryAllElements("preference-item");

          expect(attributeValues).toEqual([
            "preference-item-for-extension-registered-tab-page-id-item-metrics-preference-item-id",
          ]);
        });
      });

      describe("when navigating to second extension tab", () => {
        beforeEach(() => {
          builder.preferences.navigation.click(
            "extension-duplicated-tab-page-id-metrics-extension-tab",
          );
        });

        it("renders", () => {
          expect(rendered.container).toMatchSnapshot();
        });

        it("shows related preferences for this tab", () => {
          const { attributeValues } =
            discover.queryAllElements("preference-item");

          expect(attributeValues).toEqual([
            "preference-item-for-extension-duplicated-tab-page-id-item-another-metrics-preference-item-id",
          ]);
        });
      });
    });
  });
});

const extensionStubWithExtensionSpecificPreferenceItems: FakeExtensionOptions = {
  id: "some-test-extension-id",
  name: "some-test-extension-id",

  rendererOptions: {
    appPreferences: [
      {
        title: "Some preference item",
        id: "some-preference-item-id",

        components: {
          Hint: () => <div data-testid="some-preference-item-hint" />,
          Input: () => <div data-testid="some-preference-item-input" />,
        },
      },

      {
        title: "irrelevant",
        id: "some-unrelated-preference-item-id",
        showInPreferencesTab: "some-tab",

        components: {
          Hint: () => <div />,
          Input: () => <div />,
        },
      },
    ],
  },
};

const someOtherExtensionStubWithExtensionSpecificPreferenceItems: FakeExtensionOptions = {
  id: "some-other-test-extension-id",
  name: "some-other-test-extension-id",

  rendererOptions: {
    appPreferences: [
      {
        title: "Test preference item",
        id: "some-other-preference-item-id",

        components: {
          Hint: () => <div data-testid="some-other-preference-item-hint" />,
          Input: () => <div data-testid="some-other-preference-item-input" />,
        },
      },
    ],
  },
};

const extensionStubWithoutPreferences: FakeExtensionOptions = {
  id: "without-preferences-id",
  name: "without-preferences-id",
};

const extensionStubWithShowInPreferencesTab: FakeExtensionOptions = {
  id: "specified-preferences-page-id",
  name: "specified-preferences-page-name",

  rendererOptions: {
    appPreferences: [
      {
        title: "Test preference item",
        id: "very-other-preference-item-id",
        showInPreferencesTab: "some-tab",

        components: {
          Hint: () => <div data-testid="very-other-preference-item-hint" />,
          Input: () => <div data-testid="very-other-preference-item-input" />,
        },
      },
    ],
  },
};

const extensionStubWithRegisteredTab: FakeExtensionOptions = {
  id: "registered-tab-page-id",
  name: "registered-tab-page-id",

  rendererOptions: {
    appPreferences: [
      {
        title: "License item",
        id: "metrics-preference-item-id",
        showInPreferencesTab: "metrics-extension-tab",

        components: {
          Hint: () => <div data-testid="metrics-preference-item-hint" />,
          Input: () => <div data-testid="metrics-preference-item-input" />,
        },
      },
      {
        title: "Menu item",
        id: "menu-preference-item-id",
        showInPreferencesTab: "menu-extension-tab",

        components: {
          Hint: () => <div data-testid="menu-preference-item-hint" />,
          Input: () => <div data-testid="menu-preference-item-input" />,
        },
      },
      {
        title: "Survey item",
        id: "survey-preference-item-id",
        showInPreferencesTab: "survey-extension-tab",

        components: {
          Hint: () => <div data-testid="survey-preference-item-hint" />,
          Input: () => <div data-testid="survey-preference-item-input" />,
        },
      },
    ],

    appPreferenceTabs: [{
      title: "Metrics tab",
      id: "metrics-extension-tab",
      orderNumber: 100,
    }],
  },
};

const extensionStubWithSameRegisteredTab: FakeExtensionOptions = {
  id: "duplicated-tab-page-id",
  name: "duplicated-tab-page-id",

  rendererOptions: {
    appPreferences: [
      {
        title: "Another metrics",
        id: "another-metrics-preference-item-id",
        showInPreferencesTab: "metrics-extension-tab",

        components: {
          Hint: () => <div data-testid="another-metrics-preference-item-hint" />,
          Input: () => <div data-testid="another-metrics-preference-item-input" />,
        },
      },
    ],

    appPreferenceTabs: [{
      title: "Metrics tab",
      id: "metrics-extension-tab",
      orderNumber: 100,
    }],
  },
};
