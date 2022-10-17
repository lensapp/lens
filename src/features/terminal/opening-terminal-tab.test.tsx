/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { FindByTextWithMarkup } from "../../test-utils/findByTextWithMarkup";
import { findByTextWithMarkupFor } from "../../test-utils/findByTextWithMarkup";

describe("test for opening terminal tab within cluster frame", () => {
  let builder: ApplicationBuilder;
  let result: RenderResult;
  let findByTextWithMarkup: FindByTextWithMarkup;

  beforeEach(async () => {
    builder = getApplicationBuilder();
    builder.setEnvironmentToClusterFrame();

    result = await builder.render();
    findByTextWithMarkup = findByTextWithMarkupFor(result);
  });

  afterEach(() => {
    builder.quit();
  });

  describe("when new terminal tab is opened", () => {
    beforeEach(() => {
      result.getByTestId("dock-tab-for-terminal").click();
    });

    it("renders", () => {
      expect(result.baseElement).toMatchSnapshot();
    });

    it("opens tab", () => {
      const terminalTabContents = result.queryByTestId("dock-tab-content-for-terminal");

      expect(terminalTabContents).toBeInTheDocument();
    });

    it("shows connecting message", async () => {
      await findByTextWithMarkup("Connecting ...");
    });

    it.skip("connects websocket to main", () => {

    });

    it.skip("displays the values on screen", () => {

    });
  });
});
