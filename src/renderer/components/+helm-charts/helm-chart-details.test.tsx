/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { DiContainer } from "@ogre-tools/injectable";
import type { RenderResult } from "@testing-library/react";
import React from "react";
import directoryForLensLocalStorageInjectable from "../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import { HelmChart } from "../../../common/k8s-api/endpoints/helm-charts.api";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import { noop } from "../../utils";
import type { CreateInstallChartTab } from "../dock/install-chart/create-install-chart-tab.injectable";
import createInstallChartTabInjectable from "../dock/install-chart/create-install-chart-tab.injectable";
import { Notifications } from "../notifications";
import type { DiRender } from "../test-utils/renderFor";
import { renderFor } from "../test-utils/renderFor";
import type { GetChartDetails } from "./get-char-details.injectable";
import getChartDetailsInjectable from "./get-char-details.injectable";
import { HelmChartDetails } from "./helm-chart-details";

describe("<HelmChartDetails />", () => {
  let di: DiContainer;
  let getChartDetails: AsyncFnMock<GetChartDetails>;
  let chart: HelmChart;
  let render: DiRender;
  let result: RenderResult;
  let createInstallChartTab: jest.MockedFunction<CreateInstallChartTab>;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });
    getChartDetails = asyncFn<GetChartDetails>();
    createInstallChartTab = jest.fn();
    chart = HelmChart.create({
      apiVersion: "some-api-version",
      created: "a long time ago",
      name: "a name",
      repo: "a galaxy far far away",
      version: "1",
    });

    di.override(directoryForLensLocalStorageInjectable, () => "some-directory-for-lens-local-storage");
    di.override(getChartDetailsInjectable, () => getChartDetails);
    di.override(createInstallChartTabInjectable, () => createInstallChartTab);
    render = renderFor(di);
    result = render((
      <>
        <HelmChartDetails chart={chart} hideDetails={noop} />
        <Notifications />
      </>
    ));
  });

  describe("before getChartDetails resolves", () => {
    it("renders", () => {
      expect(result.baseElement).toMatchSnapshot();
    });

    describe("when getChartDetails resolves with one version", () => {
      beforeEach(async () => {
        await getChartDetails.resolve({
          readme: "I am a readme",
          versions: [chart],
        });
      });

      it("renders", () => {
        expect(result.baseElement).toMatchSnapshot();
      });

      it("shows the readme", () => {
        expect(result.queryByTestId("helmchart-readme")).not.toBeNull();
      });

      it("shows the selected chart", () => {
        expect(result.queryByTestId("selected-chart-description")).not.toBeNull();
      });
    });

    describe("with getChartDetails rejects", () => {
      beforeEach(async () => {
        await getChartDetails.reject(new Error("some error"));
      });

      it("renders", () => {
        expect(result.baseElement).toMatchSnapshot();
      });
    });
  });
});
