/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { DiContainer } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { RenderResult } from "@testing-library/react";
import { runInAction } from "mobx";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { preferenceItemInjectionToken } from "./renderer/preference-items/preference-item-injection-token";

describe("preferences - hiding-of-empty-branches, given in preferences page", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;
  let windowDi: DiContainer;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    rendered = await builder.render();

    builder.preferences.navigate();

    windowDi = builder.applicationWindow.only.di;
  });

  describe("given tab group and empty tabs", () => {
    beforeEach(() => {
      const someTabGroupInjectable = getInjectable({
        id: "some-tab-group",

        instantiate: () => ({
          kind: "tab-group" as const,
          id: "some-tab-group",
          testId: "some-tab-group-test-id",
          parentId: "preference-tabs" as const,
          label: "Some tab group label",
          orderNumber: 10,
        }),

        injectionToken: preferenceItemInjectionToken,
      });

      const tabWithItemsInjectable = getInjectable({
        id: "some-tab",

        instantiate: () => ({
          kind: "tab" as const,
          id: "some-tab-with-items-id",
          parentId: "some-tab-group" as const,
          testId: "some-tab-with-items",
          pathId: "irrelevant",
          label: "Some label for tab with items",
          orderNumber: 10,
        }),

        injectionToken: preferenceItemInjectionToken,
      });

      const tabWithoutItemsInjectable = getInjectable({
        id: "some-empty-tab",

        instantiate: () => ({
          kind: "tab" as const,
          id: "some-tab-without-items-id",
          parentId: "some-tab-group" as const,
          testId: "some-tab-without-items",
          pathId: "irrelevant",
          label: "Some label for tab without items",
          orderNumber: 10,
        }),

        injectionToken: preferenceItemInjectionToken,
      });

      runInAction(() => {
        windowDi.register(
          someTabGroupInjectable,
          tabWithItemsInjectable,
          tabWithoutItemsInjectable,
        );
      });
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("does not render the empty tab group", () => {
      const someTabGroup = rendered.queryByTestId("some-tab-group-test-id");

      expect(someTabGroup).toBeNull();
    });

    it("does not render the empty tabs", () => {
      const someTab = rendered.queryByTestId("some-tab-with-items");
      const someOtherTab = rendered.queryByTestId("some-tab-without-items");

      expect([someTab, someOtherTab]).toEqual([null, null]);
    });

    describe("when an item appears for one of the tabs", () => {
      beforeEach(() => {
        const itemForTabInjectable = getInjectable({
          id: "some-preference-item",

          instantiate: () => ({
            kind: "item" as const,
            id: "some-preference-item-id",
            parentId: "some-tab-with-items-id" as const,
            testId: "some-preference-item",
            Component: () => <div>Irrelevant</div>,
            orderNumber: 10,
          }),

          injectionToken: preferenceItemInjectionToken,
        });

        runInAction(() => {
          windowDi.register(itemForTabInjectable);
        });
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("renders the tab group that is no longer empty", () => {
        const someTabGroup = rendered.queryByTestId("some-tab-group-test-id");

        expect(someTabGroup).not.toBeNull();
      });

      it("renders the tab that is no longer empty", () => {
        const someTab = rendered.queryByTestId("some-tab-with-items");

        expect(someTab).not.toBeNull();
      });

      it("does not render the tab that is still empty", () => {
        const someTab = rendered.queryByTestId("some-tab-without-items");

        expect(someTab).toBeNull();
      });

      describe("when an item appears for the remaining tab", () => {
        beforeEach(() => {
          const itemForTabInjectable = getInjectable({
            id: "some-other-preference-item",

            instantiate: () => ({
              kind: "item" as const,
              id: "some-other-preference-item-id",
              parentId: "some-tab-without-items-id" as const,
              testId: "some-other-preference-item",
              Component: () => <div>Irrelevant</div>,
              orderNumber: 10,
            }),

            injectionToken: preferenceItemInjectionToken,
          });

          runInAction(() => {
            windowDi.register(itemForTabInjectable);
          });
        });

        it("renders", () => {
          expect(rendered.container).toMatchSnapshot();
        });

        it("still renders the tab group that is not empty", () => {
          const someTabGroup = rendered.queryByTestId("some-tab-group-test-id");

          expect(someTabGroup).not.toBeNull();
        });

        it("still renders the tab that is not empty", () => {
          const someTab = rendered.queryByTestId("some-tab-with-items");

          expect(someTab).not.toBeNull();
        });

        it("now renders the other tab that is no longer empty", () => {
          const someTab = rendered.queryByTestId("some-tab-without-items");

          expect(someTab).not.toBeNull();
        });
      });
    });
  });
});
