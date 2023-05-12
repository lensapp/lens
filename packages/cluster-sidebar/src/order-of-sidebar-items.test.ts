/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createContainer, DiContainer, getInjectable } from "@ogre-tools/injectable";
import { computed, IComputedValue } from "mobx";
import { noop } from "lodash/fp";
import sidebarItemsInjectable from "./sidebar-items.injectable";
import { SidebarItemDeclaration, sidebarItemInjectionToken } from "./tokens";
import { registerMobX } from "@ogre-tools/injectable-extension-for-mobx";
import { clusterSidebarFeature } from "./feature";

const someParentSidebarItemInjectable = getInjectable({
  id: "sidebar-item-some-parent",
  instantiate: () => ({
    parentId: null,
    title: "Some parent",
    onClick: noop,
    orderNumber: 42,
  }),
  injectionToken: sidebarItemInjectionToken,
});

const someOtherParentSidebarItemInjectable = getInjectable({
  id: "sidebar-item-some-other-parent",
  instantiate: () => ({
    parentId: null,
    title: "Some other parent",
    onClick: noop,
    orderNumber: 126,
  }),
  injectionToken: sidebarItemInjectionToken,
});

const someAnotherParentSidebarItemInjectable = getInjectable({
  id: "sidebar-item-some-another-parent",
  instantiate: () => ({
    parentId: null,
    title: "Some another parent",
    onClick: noop,
    orderNumber: 84,
  }),
  injectionToken: sidebarItemInjectionToken,
});

const someForthParentSidebarItemInjectable = getInjectable({
  id: "sidebar-item-some-forth-parent",
  instantiate: () => ({
    parentId: null,
    title: "Some another parent",
    onClick: noop,
    orderNumber: 84,
    isVisible: computed(() => false),
    isActive: computed(() => true),
  }),
  injectionToken: sidebarItemInjectionToken,
});

const someChildSidebarItemInjectable = getInjectable({
  id: "sidebar-item-some-child",
  instantiate: () => ({
    parentId: someParentSidebarItemInjectable.id,
    title: "Some child",
    onClick: noop,
    orderNumber: 168,
  }),
  injectionToken: sidebarItemInjectionToken,
});

const someOtherChildSidebarItemInjectable = getInjectable({
  id: "sidebar-item-some-other-child",
  instantiate: () => ({
    parentId: someParentSidebarItemInjectable.id,
    title: "Some other child",
    onClick: noop,
    orderNumber: 252,
  }),
  injectionToken: sidebarItemInjectionToken,
});

const someAnotherChildSidebarItemInjectable = getInjectable({
  id: "sidebar-item-some-another-child",
  instantiate: () => ({
    parentId: someParentSidebarItemInjectable.id,
    title: "Some another child",
    onClick: noop,
    orderNumber: 210,
  }),
  injectionToken: sidebarItemInjectionToken,
});

describe("order of sidebar items", () => {
  let di: DiContainer;
  let sidebarItems: IComputedValue<SidebarItemDeclaration[]>;

  beforeEach(() => {
    di = createContainer("test");

    di.register(
      someParentSidebarItemInjectable,
      someOtherParentSidebarItemInjectable,
      someAnotherParentSidebarItemInjectable,
      someChildSidebarItemInjectable,
      someOtherChildSidebarItemInjectable,
      someAnotherChildSidebarItemInjectable,
      someForthParentSidebarItemInjectable,
    );

    clusterSidebarFeature.register(di);
    registerMobX(di);

    sidebarItems = di.inject(sidebarItemsInjectable);
  });

  it("has parent items in order", () => {
    const actual = sidebarItems.get().map((item) => item.id);

    expect(actual).toEqual([
      "sidebar-item-some-parent",
      "sidebar-item-some-another-parent",
      "sidebar-item-some-forth-parent",
      "sidebar-item-some-other-parent",
    ]);
  });

  it("an item with no children and no isVisible configuration by default is visible", () => {
    const item = sidebarItems.get().find((item) => item.id === someAnotherParentSidebarItemInjectable.id);

    expect(item?.isVisible.get()).toBe(true);
  });

  it("an item with no children and an isVisible configuration is whatever the configuration specifies", () => {
    const item = sidebarItems.get().find((item) => item.id === someForthParentSidebarItemInjectable.id);

    expect(item?.isVisible.get()).toBe(false);
  });

  it("an item with children is visible if at least one of the children is visible", () => {
    const item = sidebarItems.get().find((item) => item.id === "sidebar-item-some-parent");

    expect(item?.isVisible.get()).toBe(true);
  });

  it("an item with no children and no isActive configuration by default is not active", () => {
    const item = sidebarItems.get().find((item) => item.id === someAnotherParentSidebarItemInjectable.id);

    expect(item?.isActive.get()).toBe(false);
  });

  it("an item with no children and an isActive configuration is whatever the configuration specifies", () => {
    const item = sidebarItems.get().find((item) => item.id === someForthParentSidebarItemInjectable.id);

    expect(item?.isActive.get()).toBe(true);
  });

  it("an item with children is active if at least one of the children is active", () => {
    const item = sidebarItems.get().find((item) => item.id === "sidebar-item-some-parent");

    expect(item?.isActive.get()).toBe(false);
  });

  it("has child items in order", () => {
    const actual = sidebarItems
      .get()
      .find((item) => item.id === "sidebar-item-some-parent")
      ?.children.map((item) => item.id);

    expect(actual).toEqual([
      "sidebar-item-some-child",
      "sidebar-item-some-another-child",
      "sidebar-item-some-other-child",
    ]);
  });
});
