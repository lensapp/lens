/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import type { RenderResult } from "@testing-library/react";
import type { IComputedValue, IObservableValue } from "mobx";
import { computed, observable, runInAction } from "mobx";
import React from "react";
import type { ClusterModalRegistration } from "../../extensions/registries";
import { clusterModalsInjectionToken } from "../../renderer/cluster-modals/cluster-modals-injection-token";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("<body/> elements originated from cluster modal registration", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;

  beforeEach(() => {
    builder = getApplicationBuilder();
    builder.setEnvironmentToClusterFrame();
  });

  describe("given custom components for cluster view available", () => {
    let someObservable: IObservableValue<boolean>;
    let clusterModalInjectable: Injectable<IComputedValue<ClusterModalRegistration[]>, any, any>;
    let clusterDialogInjectable: Injectable<IComputedValue<ClusterModalRegistration[]>, any, any>;
  
    beforeEach(async () => {
      someObservable = observable.box(false);

      clusterModalInjectable = getInjectable({
        id: "some-cluster-modal-injectable",
      
        instantiate: () => {
          return computed((): ClusterModalRegistration[] => [{
            id: "test-modal-id",
            Component: () => <div data-testid="test-modal">test modal</div>,
            visible: computed(() => true),
          }]);
        },
      
        injectionToken: clusterModalsInjectionToken,
      });

      clusterDialogInjectable = getInjectable({
        id: "dialog-with-observable-visibility-injectable",
      
        instantiate: () => {
          return computed((): ClusterModalRegistration[] => [{
            id: "dialog-with-observable-visibility-id",
            Component: () => <div data-testid="dialog-with-observable-visibility">dialog contents</div>,
            visible: computed(() => someObservable.get()),
          }]);
        },
      
        injectionToken: clusterModalsInjectionToken,
      });

      builder.beforeWindowStart((windowDi) => {
        runInAction(() => {
          windowDi.register(clusterModalInjectable);
          windowDi.register(clusterDialogInjectable);
        });
      });

      rendered = await builder.render();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("renders provided component html", () => {
      const modal = rendered.getByTestId("test-modal");

      expect(modal).toBeInTheDocument();
    });

    it("doesn't render component which should be invisible", () => {
      const dialog = rendered.queryByTestId("dialog-with-observable-visibility");

      expect(dialog).not.toBeInTheDocument();
    });

    it("when injectable component becomes visible, shows it", () => {
      runInAction(() => {
        someObservable.set(true);
      });

      const dialog = rendered.getByTestId("dialog-with-observable-visibility");

      expect(dialog).toBeInTheDocument();
    });
  });

  describe("given custom component for cluster view not available", () => {
    beforeEach(async () => {
      rendered = await builder.render();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("doesn't render any custom html", () => {
      const modal = rendered.queryByTestId("test-modal");

      expect(modal).not.toBeInTheDocument();
    });
  });
});
