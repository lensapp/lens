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
import type { Discover } from "@k8slens/react-testing-library-discovery";
import { discoverFor } from "@k8slens/react-testing-library-discovery";

describe("preferences - hiding-of-empty-branches, given in preferences page", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;
  let windowDi: DiContainer;
  let discover: Discover;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    rendered = await builder.render();

    discover = discoverFor(() => rendered);

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
          parentId: "preference-tabs" as const,
          label: "Some tab group label",
          orderNumber: 10,
        }),

        injectionToken: preferenceItemInjectionToken,
      });

      const someTabInjectable = getInjectable({
        id: "some-tab",

        instantiate: () => ({
          kind: "tab" as const,
          id: "some-tab-id",
          parentId: "some-tab-group" as const,
          pathId: "some-path-id-for-some-tab-id",
          label: "Some tab label",
          orderNumber: 10,
        }),

        injectionToken: preferenceItemInjectionToken,
      });

      const someOtherTabInjectable = getInjectable({
        id: "some-other-tab",

        instantiate: () => ({
          kind: "tab" as const,
          id: "some-other-tab-id",
          parentId: "some-tab-group" as const,
          pathId: "some-path-id-for-some-other-tab-id",
          label: "Some other tab label",
          orderNumber: 10,
        }),

        injectionToken: preferenceItemInjectionToken,
      });

      runInAction(() => {
        windowDi.register(
          someTabGroupInjectable,
          someTabInjectable,
          someOtherTabInjectable,
        );
      });
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("does not render the empty tab group", () => {
      const { discovered } = discover.querySingleElement(
        "preference-tab-group",
        "some-tab-group",
      );

      expect(discovered).toBeNull();
    });

    it("does not render the empty tabs", () => {
      const { discovered: someTab } = discover.querySingleElement(
        "preference-tab-link",
        "some-path-id-for-some-tab-id",
      );

      const { discovered: someOtherTab } = discover.querySingleElement(
        "preference-tab-link",
        "some-path-id-for-some-other-tab-id",
      );

      expect([someTab, someOtherTab]).toEqual([null, null]);
    });

    describe("when an item appears for one of the tabs", () => {
      beforeEach(() => {
        const itemForTabInjectable = getInjectable({
          id: "some-preference-item",

          instantiate: () => ({
            kind: "block" as const,
            id: "some-preference-item-id",
            parentId: "some-tab-id" as const,
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
        const { discovered } = discover.querySingleElement(
          "preference-tab-group",
          "some-tab-group",
        );

        expect(discovered).not.toBeNull();
      });

      it("renders the tab that is no longer empty", () => {
        const { discovered } = discover.getSingleElement(
          "preference-tab-link",
          "some-path-id-for-some-tab-id",
        );

        expect(discovered).not.toBeNull();
      });

      it("does not render the tab that is still empty", () => {
        const { discovered } = discover.querySingleElement(
          "preference-tab-link",
          "some-path-id-for-some-other-tab-id",
        );

        expect(discovered).toBeNull();
      });

      describe("when an item appears for the remaining tab", () => {
        beforeEach(() => {
          const itemForTabInjectable = getInjectable({
            id: "some-other-preference-item",

            instantiate: () => ({
              kind: "block" as const,
              id: "some-other-preference-item-id",
              parentId: "some-other-tab-id" as const,
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
          const { discovered } = discover.getSingleElement(
            "preference-tab-group",
            "some-tab-group",
          );

          expect(discovered).not.toBeNull();
        });

        it("still renders the tab that is not empty", () => {
          const { discovered } = discover.getSingleElement(
            "preference-tab-link",
            "some-path-id-for-some-tab-id",
          );

          expect(discovered).not.toBeNull();
        });

        it("now renders the other tab that is no longer empty", () => {
          const { discovered } = discover.getSingleElement(
            "preference-tab-link",
            "some-path-id-for-some-other-tab-id",
          );

          expect(discovered).not.toBeNull();
        });
      });
    });
  });
});
