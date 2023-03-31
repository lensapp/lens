/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { Discover } from "@k8slens/react-testing-library-discovery";
import { discoverFor } from "@k8slens/react-testing-library-discovery";
import React from "react";
import type { Navigate } from "../../renderer/navigation/navigate.injectable";
import navigateInjectable from "../../renderer/navigation/navigate.injectable";

describe("preferences: URLs of legacy extensions", () => {
  let builder: ApplicationBuilder;

  beforeEach(() => {
    builder = getApplicationBuilder();
  });

  describe("given extension with custom preferences and a custom preference tab", () => {
    let rendered: RenderResult;
    let discover: Discover;
    let navigate: Navigate;

    beforeEach(async () => {
      rendered = await builder.render();

      discover = discoverFor(() => rendered);

      const testExtension = {
        id: "some-extension-id",
        name: "some-extension",

        rendererOptions: {
          appPreferenceTabs: [
            {
              title: "Some title",
              id: "some-preference-tab-id",
              orderNumber: 1,
            },

            {
              title: "Some other title",
              id: "some-other-preference-tab-id",
              orderNumber: 2,
            },
          ],

          appPreferences: [
            {
              title: "some-title",
              id: "some-preference-item-id",
              showInPreferencesTab: "some-preference-tab-id",

              components: {
                Hint: () => <div />,
                Input: () => <div data-some-preference-test="some-preference" />,
              },
            },

            {
              title: "some-other-title",
              id: "some-other-preference-item-id",
              showInPreferencesTab: "some-other-preference-tab-id",

              components: {
                Hint: () => <div />,
                Input: () => <div data-some-preference-test="some-other-preference" />,
              },
            },
          ],
        },
      };

      builder.extensions.enable(testExtension);

      navigate = builder.applicationWindow.only.di.inject(navigateInjectable);
    });

    describe("when navigating to specific custom preference tab using magic string URL", () => {
      beforeEach(() => {
        navigate("/preferences/extension/some-extension/some-preference-tab-id");
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("shows the custom preference page for the custom preference tab", () => {
        const { discovered } = discover.getSingleElement(
          "preference-page",
          "preference-item-for-extension-some-extension-additional-page-some-preference-tab-id",
        );

        expect(discovered).not.toBeNull();
      });

      it("shows the custom preferences", () => {
        const { discovered } = discover.getSingleElement(
          "some-preference",
        );

        expect(discovered).not.toBeNull();
      });
    });

    describe("when navigating to unspecified custom preferences tab using magic string URL", () => {
      beforeEach(() => {
        navigate("/preferences/extension/some-extension");
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("cannot find contents of the arbitrary custom preference tabs", () => {
        const { discovered } = discover.querySingleElement(
          "some-preference",
        );

        expect(discovered).toBeNull();
      });

      it("shows the empty default preference page for the extension", () => {
        const { discovered } = discover.getSingleElement(
          "preference-page",
          "preference-item-for-extension-some-extension-page",
        );

        expect(discovered).not.toBeNull();
      });
    });
  });

  describe("given extension with custom preferences but without a custom preference tab", () => {
    let rendered: RenderResult;
    let discover: Discover;
    let navigate: Navigate;

    beforeEach(async () => {
      rendered = await builder.render();

      discover = discoverFor(() => rendered);

      const testExtension = {
        id: "some-extension-id",
        name: "some-extension",

        rendererOptions: {
          appPreferences: [
            {
              title: "some-title",
              id: "some-preference-item-id",

              components: {
                Hint: () => <div />,
                Input: () => <div data-some-preference-test />,
              },
            },
          ],
        },
      };

      builder.extensions.enable(testExtension);

      navigate = builder.applicationWindow.only.di.inject(navigateInjectable);
    });

    describe("when navigating to the default preference tab using magic string URL", () => {
      beforeEach(() => {
        navigate("/preferences/extension/some-extension");
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("shows the preference page for the custom preferences", () => {
        const { discovered } = discover.getSingleElement(
          "preference-page",
          "preference-item-for-extension-some-extension-page",
        );

        expect(discovered).not.toBeNull();
      });

      it("shows the custom preferences", () => {
        const { discovered } = discover.getSingleElement("some-preference");

        expect(discovered).not.toBeNull();
      });
    });
  });

  describe("given extension with both custom preference tabs and content for the default tab", () => {
    let rendered: RenderResult;
    let discover: Discover;
    let navigate: Navigate;

    beforeEach(async () => {
      rendered = await builder.render();

      discover = discoverFor(() => rendered);

      const testExtension = {
        id: "some-extension-id",
        name: "some-extension",

        rendererOptions: {
          appPreferenceTabs: [
            {
              title: "Some title",
              id: "some-preference-tab-id",
              orderNumber: 1,
            },

            {
              title: "Some other title",
              id: "some-other-preference-tab-id",
              orderNumber: 2,
            },
          ],

          appPreferences: [
            {
              title: "some-title",
              id: "some-preference-item-id",
              showInPreferencesTab: "some-preference-tab-id",

              components: {
                Hint: () => <div />,
                Input: () => <div data-some-preference-test="some-preference-in-custom-tab" />,
              },
            },

            {
              title: "some-other-title",
              id: "some-other-preference-item-id",
              showInPreferencesTab: "some-other-preference-tab-id",

              components: {
                Hint: () => <div />,
                Input: () => <div data-some-preference-test="some-preference-in-custom-tab" />,
              },
            },

            {
              title: "some-title-in-default-tab",
              id: "some-preference-item-id-in-default-tab",

              components: {
                Hint: () => <div />,
                Input: () => <div data-some-preference-test="some-preference-in-default-tab" />,
              },
            },
          ],
        },
      };

      builder.extensions.enable(testExtension);

      navigate = builder.applicationWindow.only.di.inject(navigateInjectable);
    });

    describe("when navigating to specific custom preference tab using magic string URL", () => {
      beforeEach(() => {
        navigate("/preferences/extension/some-extension/some-preference-tab-id");
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("shows the custom preference page for the custom preference tab", () => {
        const { discovered } = discover.getSingleElement(
          "preference-page",
          "preference-item-for-extension-some-extension-additional-page-some-preference-tab-id",
        );

        expect(discovered).not.toBeNull();
      });

      it("shows the custom preferences", () => {
        const { discovered } = discover.getSingleElement(
          "some-preference",
        );

        expect(discovered).not.toBeNull();
      });
    });

    describe("when navigating to unspecified custom preferences tab using magic string URL", () => {
      beforeEach(() => {
        navigate("/preferences/extension/some-extension");
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("cannot find contents of the arbitrary custom preference tabs", () => {
        const { discovered } = discover.querySingleElement(
          "some-preference",
          "some-preference-in-custom-tab",
        );

        expect(discovered).toBeNull();
      });

      it("shows the default preference page for the extension", () => {
        const { discovered } = discover.getSingleElement(
          "preference-page",
          "preference-item-for-extension-some-extension-page",
        );

        expect(discovered).not.toBeNull();
      });

      it("shows preferences of default preference page of the extension", () => {
        const { discovered } = discover.getSingleElement(
          "some-preference",
          "some-preference-in-default-tab",
        );

        expect(discovered).not.toBeNull();
      });
    });
  });
});
