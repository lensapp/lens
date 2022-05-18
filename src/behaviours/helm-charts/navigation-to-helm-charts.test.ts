/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("helm-charts - navigation to Helm charts", () => {
  let applicationBuilder: ApplicationBuilder;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();
  });

  describe("when navigating to Helm charts", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      applicationBuilder.setEnvironmentToClusterFrame();

      rendered = await applicationBuilder.render();

      applicationBuilder.helmCharts.navigate();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("shows page for Helm charts", () => {
      const page = rendered.getByTestId("page-for-helm-charts");

      expect(page).not.toBeNull();
    });
  });
});
