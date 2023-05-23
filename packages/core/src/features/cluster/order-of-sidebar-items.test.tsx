/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RenderResult } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import { runInAction } from "mobx";
import { noop } from "lodash/fp";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("cluster - order of sidebar items", () => {
  let rendered: RenderResult;
  let builder: ApplicationBuilder;

  beforeEach(() => {
    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();

    builder.beforeWindowStart(({ windowDi }) => {
      runInAction(() => {
        windowDi.register(
          someParentSidebarItemInjectable,
          someOtherParentSidebarItemInjectable,
          someAnotherParentSidebarItemInjectable,
          someChildSidebarItemInjectable,
          someOtherChildSidebarItemInjectable,
          someAnotherChildSidebarItemInjectable,
        );
      });
    });
  });

  describe("when rendered", () => {
    beforeEach(async () => {
      rendered = await builder.render();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("has parent items in order", () => {
      const actual = rendered
        .queryAllByTestId(/^sidebar-item-(some-parent-id|some-other-parent-id|some-another-parent-id)/)
        .map(elem => elem.dataset.testid);

      expect(actual).toEqual([
        "sidebar-item-some-parent-id",
        "sidebar-item-some-another-parent-id",
        "sidebar-item-some-other-parent-id",
      ]);
    });

    describe("when parent is expanded", () => {
      beforeEach(() => {
        const parentLink = rendered.getByTestId(
          "sidebar-item-link-for-some-parent-id",
        );

        fireEvent.click(parentLink);
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("has child items in order", () => {
        const actual = rendered
          .queryAllByTestId(/^sidebar-item-*/)
          .filter((element) => element.dataset.parentIdTest === "some-parent-id")
          .map(elem => elem.dataset.testid);

        expect(actual).toEqual([
          "sidebar-item-some-child-id",
          "sidebar-item-some-another-child-id",
          "sidebar-item-some-other-child-id",
        ]);
      });
    });
  });
});

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
