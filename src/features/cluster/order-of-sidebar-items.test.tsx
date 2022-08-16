/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RenderResult } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import type { SidebarItemRegistration } from "../../renderer/components/layout/sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../../renderer/components/layout/sidebar-items.injectable";
import { computed } from "mobx";
import { noop } from "lodash/fp";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("cluster - order of sidebar items", () => {
  let rendered: RenderResult;
  let builder: ApplicationBuilder;

  beforeEach(() => {
    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();

    builder.beforeWindowStart((windowDi) => {
      windowDi.register(testSidebarItemsInjectable);
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

const testSidebarItemsInjectable = getInjectable({
  id: "some-sidebar-item-injectable",

  instantiate: () =>
    computed((): SidebarItemRegistration[] => [
      {
        id: "some-parent-id",
        parentId: null,
        title: "Some parent",
        onClick: noop,
        orderNumber: 42,
      },
      {
        id: "some-other-parent-id",
        parentId: null,
        title: "Some other parent",
        onClick: noop,
        orderNumber: 126,
      },
      {
        id: "some-another-parent-id",
        parentId: null,
        title: "Some another parent",
        onClick: noop,
        orderNumber: 84,
      },
      {
        id: "some-child-id",
        parentId: "some-parent-id",
        title: "Some child",
        onClick: noop,
        orderNumber: 168,
      },
      {
        id: "some-other-child-id",
        parentId: "some-parent-id",
        title: "Some other child",
        onClick: noop,
        orderNumber: 252,
      },
      {
        id: "some-another-child-id",
        parentId: "some-parent-id",
        title: "Some another child",
        onClick: noop,
        orderNumber: 210,
      },
    ]),

  injectionToken: sidebarItemsInjectionToken,
});
