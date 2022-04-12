/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { fireEvent, RenderResult } from "@testing-library/react";
import { SidebarItemRegistration, sidebarItemsInjectionToken } from "../../renderer/components/layout/sidebar-items.injectable";
import { computed } from "mobx";
import { get, includes, noop } from "lodash/fp";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("cluster - order of sidebar items", () => {
  let rendered: RenderResult;
  let applicationBuilder: ApplicationBuilder;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder().setEnvironmentToClusterFrame();

    applicationBuilder.beforeSetups(({ rendererDi }) => {
      rendererDi.register(testSidebarItemsInjectable);
    });
  });

  describe("when rendered", () => {
    beforeEach(async () => {
      rendered = await applicationBuilder.render();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("has parent items in order", () => {
      const actual = rendered
        .queryAllByTestId("sidebar-item")

        .filter((element) =>
          includes(element.dataset.idTest)([
            "some-parent-id",
            "some-other-parent-id",
            "some-another-parent-id",
          ]),
        )

        .map(get("dataset.idTest"));

      expect(actual).toEqual([
        "some-parent-id",
        "some-another-parent-id",
        "some-other-parent-id",
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
          .queryAllByTestId("sidebar-item")
          .filter(
            (element) => element.dataset.parentIdTest === "some-parent-id",
          )
          .map(get("dataset.idTest"));

        expect(actual).toEqual([
          "some-child-id",
          "some-another-child-id",
          "some-other-child-id",
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
