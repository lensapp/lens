/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { DiContainer } from "@ogre-tools/injectable";
import React from "react";
import fetchInjectable, { Fetch } from "../../../../common/fetch/fetch.injectable";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import storesAndApisCanBeCreatedInjectable from "../../../stores-apis-can-be-created.injectable";
import { DiRender, renderFor } from "../../test-utils/renderFor";
import { PodDetailsList } from "../pod-details-list";
import type { PodStore } from "../store";
import podStoreInjectable from "../store.injectable";

describe("<PodDetailsList />", () => {
  let di: DiContainer;
  let podStore: PodStore;
  let render: DiRender;
  let fetchMock: AsyncFnMock<Fetch>;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });
    di.override(storesAndApisCanBeCreatedInjectable, () => true);

    fetchMock = asyncFn();
    podStore = di.inject(podStoreInjectable);

    di.override(fetchInjectable, () => fetchMock);

    render = renderFor(di);
  });
  
  describe("when no pods passed and podStore is loaded", () => {
    beforeEach(() => {
      podStore.isLoaded = true;
    });

    it("renders", () => {
      const result = render(
        <PodDetailsList
          pods={[]}
        />
      );

      expect(result.container).toMatchSnapshot();
    });

    it("shows empty message", () => {
      const result = render(
        <PodDetailsList
          pods={[]}
        />
      );

      expect(result.getByText("No items found")).toBeInTheDocument();
    });
  });
});