/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import assert from "assert";
import { TypedRegEx } from "typed-regex";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

const pngBase64Matcher = TypedRegEx("data:image/png;base64,(?<ENCODED>.+)");

function convertCanvasToPngBuffer(canvas: { toDataURL: () => string }): Buffer {
  const content = canvas.toDataURL();
  const match = pngBase64Matcher.captures(content);

  assert(match);

  return Buffer.from(match.ENCODED, "base64");
}

describe("test for opening terminal tab within cluster frame", () => {
  let builder: ApplicationBuilder;
  let result: RenderResult;
  let textCanvas: HTMLCanvasElement;

  beforeEach(async () => {
    builder = getApplicationBuilder();
    builder.setEnvironmentToClusterFrame();

    result = await builder.render();
  });

  afterEach(() => {
    builder.quit();
  });

  describe("when new terminal tab is opened", () => {
    beforeEach(() => {
      result.getByTestId("dock-tab-for-terminal").click();
      textCanvas = result.baseElement.querySelector("canvas.xterm-text-layer") as HTMLCanvasElement;
    });

    it("renders", () => {
      expect(result.baseElement).toMatchSnapshot();
    });

    it("opens tab", () => {
      const terminalTabContents = result.queryByTestId("dock-tab-content-for-terminal");

      expect(terminalTabContents).toBeInTheDocument();
    });

    it("shows connecting message", async () => {
      expect(convertCanvasToPngBuffer(textCanvas)).toMatchImageSnapshot();
    });

    it.skip("connects websocket to main", () => {

    });

    it.skip("displays the values on screen", () => {

    });
  });
});
