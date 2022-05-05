/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import type { DiContainer } from "@ogre-tools/injectable";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import { type DiRender, renderFor } from "../../test-utils/renderFor";
import { Extensions } from "../extensions";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import rendererExtensionsInjectable from "../../../../extensions/renderer-extensions.injectable";
import { computed } from "mobx";
import currentPathParametersInjectable from "../../../routes/current-path-parameters.injectable";
import { getRendererExtensionFake } from "../../test-utils/get-renderer-extension-fake";

describe("<Extensions/>", () => {
  let di: DiContainer;
  let render: DiRender;

  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });
    render = renderFor(di);

    di.override(rendererExtensionsInjectable, () => computed(() => [getRendererExtensionFake(extensionWithSpecificPreferenceItems)]));
    di.override(currentPathParametersInjectable, () => computed(() => ({ extensionId: "some-test-extension-id" })));
  });

  it("renders", () => {
    const { container } = render(<Extensions />);

    expect(container).toBeInTheDocument();
  });

  it("renders proper page title", () => {
    const { getByText } = render(<Extensions />);

    expect(getByText("some-test-extension-id preferences")).toBeInTheDocument();
  });

  it("renders relevant preference items", () => {
    const { getByTestId } = render(<Extensions />);

    expect(getByTestId(`extension-preference-item-for-some-preference-item-id`)).toBeInTheDocument();
  });

  it("does not render irrelevant preference items", () => {
    const { queryByTestId } = render(<Extensions />);

    expect(queryByTestId(`extension-preference-item-for-some-unrelated-preference-item-id`)).not.toBeInTheDocument();
  });

  describe("when tabId param is passed and extension has same showInPreferencesTab param", () => {
    beforeEach(() => {
      di.override(currentPathParametersInjectable, () => computed(() => ({ extensionId: "some-test-extension-id", tabId: "metircs-extension-tab" })));
    });

    it("does render related preferences for specific tab", () => {
      const { getByTestId } = render(<Extensions />);

      expect(getByTestId(`extension-preference-item-for-preference-for-tab-item-id`)).toBeInTheDocument();
    });

    it("does not render irrelevant preference items", () => {
      const { queryByTestId } = render(<Extensions />);

      expect(queryByTestId(`extension-preference-item-for-some-unrelated-preference-item-id`)).not.toBeInTheDocument();
    });
  });
});

const extensionWithSpecificPreferenceItems: Partial<LensRendererExtension> = {
  id: "some-test-extension-id",
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
      title: "Switch on when app starts",
      id: "some-other-preference-item-id",

      components: {
        Hint: () => <div data-testid="some-other-preference-item-hint" />,
        Input: () => <div data-testid="some-other-preference-item-input" />,
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

    {
      title: "preference for specific tab",
      id: "preference-for-tab-item-id",
      showInPreferencesTab: "metircs-extension-tab",

      components: {
        Hint: () => <div />,
        Input: () => <div />,
      },
    },
  ],

  appPreferenceTabs: [{
    title: "Metrics tab",
    id: "metircs-extension-tab",
    orderNumber: 100,
  }],
};
