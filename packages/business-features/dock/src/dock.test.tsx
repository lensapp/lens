import { createContainer, DiContainer } from "@ogre-tools/injectable";
import { renderFor } from "@k8slens/test-utils";
import { DockHost } from "./dock/dock-host";
import React from "react";
import type { RenderResult } from "@testing-library/react";

describe("dock", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = createContainer("some-container");

    // registerFeature(di, dockFeature);
  });

  describe("when rendered", () => {
    let rendered: RenderResult;

    beforeEach(() => {
      const render = renderFor(di);

      rendered = render(<DockHost />);
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });
  });
});
