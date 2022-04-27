/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import isAutoUpdateEnabledInjectable from "../../main/is-auto-update-enabled.injectable";

// TODO: Make components free of side effects by making them deterministic
jest.mock("../../renderer/components/tooltip/tooltip");
jest.mock("../../renderer/components/tooltip/withTooltip", () => ({
  withTooltip: (target: any) => target,
}));
jest.mock("../../renderer/components/monaco-editor/monaco-editor");

describe("add-cluster - navigation using application menu", () => {
  let applicationBuilder: ApplicationBuilder;
  let rendered: RenderResult;

  beforeEach(async () => {
    applicationBuilder = getApplicationBuilder().beforeSetups(({ mainDi }) => {
      mainDi.override(isAutoUpdateEnabledInjectable, () => () => false);
    });

    rendered = await applicationBuilder.render();
  });

  it("renders", () => {
    expect(rendered.container).toMatchSnapshot();
  });

  it("does not show add cluster page yet", () => {
    const actual = rendered.queryByTestId("add-cluster-page");

    expect(actual).toBeNull();
  });

  describe("when navigating to add cluster using application menu", () => {
    beforeEach(() => {
      applicationBuilder.applicationMenu.click("file.add-cluster");
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("shows add cluster page", () => {
      const actual = rendered.getByTestId("add-cluster-page");

      expect(actual).not.toBeNull();
    });
  });
});
