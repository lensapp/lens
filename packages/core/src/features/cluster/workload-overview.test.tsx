/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import navigateToWorkloadsOverviewInjectable from "../../common/front-end-routing/routes/cluster/workloads/overview/navigate-to-workloads-overview.injectable";
import { type ApplicationBuilder, getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("workload overview", () => {
  let rendered: RenderResult;
  let builder: ApplicationBuilder;

  beforeEach(async () => {
    builder = getApplicationBuilder().setEnvironmentToClusterFrame();

    builder.afterWindowStart(() => {
      builder.allowKubeResource({
        apiName: "pods",
        group: "",
      });
    });

    rendered = await builder.render();
  });

  describe("when navigating to workload overview", () => {
    beforeEach(() => {
      builder.navigateWith(navigateToWorkloadsOverviewInjectable);
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("shows workload overview", () => {
      expect(rendered.queryByTestId("page-for-workloads-overview")).toBeInTheDocument();
    });

    it("shows pods pie chart", () => {
      expect(rendered.queryByTestId("workload-overview-status-chart-pods")).toBeInTheDocument();
    });
  });
});
