/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import "@testing-library/jest-dom/extend-expect";
import type { DiContainer } from "@ogre-tools/injectable";
import { getDiForUnitTesting } from "../../../../getDiForUnitTesting";
import { type DiRender, renderFor } from "../../../test-utils/renderFor";
import { PreferencesNavigation } from "../preferences-navigation";
import type { PreferenceNavigationItem } from "../preference-navigation-items.injectable";
import { computed } from "mobx";
import { noop } from "../../../../utils";
import type { IComputedValue } from "mobx/dist/internal";
import generalPreferenceNavigationItemsInjectable from "../general-preference-navigation-items.injectable";
import extensionsPreferenceNavigationItemsInjectable from "../extension-preference-navigation-items.injectable";

describe("<PreferencesNavigation />", () => {
  let di: DiContainer;
  let render: DiRender;

  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });
    render = renderFor(di);
  });

  it("renders", () => {
    const { container } = render(<PreferencesNavigation />);

    expect(container).toBeInTheDocument();
  });

  describe("when general navigation items passed", () => {
    beforeEach(() => {
      const generalNavItems: IComputedValue<PreferenceNavigationItem[]> = computed(() => [
        {
          id: "general",
          label: "General",
          isActive: computed(() => false),
          isVisible: computed(() => true),
          navigate: () => noop,
          orderNumber: 0,
          parent: "",
        },
        {
          id: "proxy",
          label: "Proxy",
          isActive: computed(() => false),
          isVisible: computed(() => true),
          navigate: () => noop,
          orderNumber: 1,
          parent: "",
        },
      ]);

      di.override(generalPreferenceNavigationItemsInjectable, () => generalNavItems);
    });

    it("renders them", () => {
      const { container } = render(
        <PreferencesNavigation/>,
      );

      expect(container).toHaveTextContent("General");
      expect(container).toHaveTextContent("Proxy");
    });

    it("does not show custom settings block", () => {
      const { queryByTestId } = render(
        <PreferencesNavigation/>,
      );

      expect(queryByTestId("extension-settings")).not.toBeInTheDocument();
    });
  });

  describe("when general + extension navigation items passed", () => {
    beforeEach(() => {
      const generalNavItems: IComputedValue<PreferenceNavigationItem[]> = computed(() => [
        {
          id: "general",
          label: "General",
          isActive: computed(() => false),
          isVisible: computed(() => true),
          navigate: () => noop,
          orderNumber: 0,
        },
        {
          id: "proxy",
          label: "Proxy",
          isActive: computed(() => false),
          isVisible: computed(() => true),
          navigate: () => noop,
          orderNumber: 1,
        },
      ]);

      const extensionNavItems: IComputedValue<PreferenceNavigationItem[]> = computed(() => [
        {
          id: "extension-preferences-navigation-item-lensapp-node-menu",
          label: "lensapp-node-menu",
          isActive: computed(() => false),
          isVisible: computed(() => true),
          navigate: () => noop,
          orderNumber: 0,
          parent: "extensions",
        },
        {
          id: "extension-preferences-navigation-item-lensapp-pod-menu",
          label: "lensapp-pod-menu",
          isActive: computed(() => false),
          isVisible: computed(() => true),
          navigate: () => noop,
          orderNumber: 0,
          parent: "extensions",
        },
        {
          id: "extension-preferences-navigation-item-metrics-plugin",
          label: "metrics-plugin",
          isActive: computed(() => false),
          isVisible: computed(() => false),
          navigate: () => noop,
          orderNumber: 0,
          parent: "extensions",
        },
      ]);

      di.override(generalPreferenceNavigationItemsInjectable, () => generalNavItems);
      di.override(extensionsPreferenceNavigationItemsInjectable, () => extensionNavItems);
    });

    it("renders general navigation items", () => {
      const { container } = render(
        <PreferencesNavigation/>,
      );

      expect(container).toHaveTextContent("General");
      expect(container).toHaveTextContent("Proxy");
    });

    it("shows custom settings block", () => {
      const { getByTestId } = render(
        <PreferencesNavigation/>,
      );

      expect(getByTestId("extension-settings")).toBeInTheDocument();
    });

    it("renders extension navigation items", () => {
      const { getByTestId } = render(
        <PreferencesNavigation/>,
      );

      const nodeAppMenuItem = getByTestId("tab-link-for-extension-preferences-navigation-item-lensapp-node-menu");
      const podMenuItem = getByTestId("tab-link-for-extension-preferences-navigation-item-lensapp-pod-menu");

      expect([nodeAppMenuItem, podMenuItem]).toBeTruthy();
    });

    it("renders extension navigation items inside custom settings block", () => {
      const { getByTestId } = render(
        <PreferencesNavigation/>,
      );
      const settingsBlock = getByTestId("extension-settings");

      expect(settingsBlock).toHaveTextContent("lensapp-node-menu");
    });
  });
});
