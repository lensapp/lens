/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { FakeExtensionData, TestExtension } from "../renderer/components/test-utils/get-renderer-extension-fake";
import { getRendererExtensionFakeFor } from "../renderer/components/test-utils/get-renderer-extension-fake";
import React from "react";
import type { RenderResult } from "@testing-library/react";
import currentPathInjectable from "../renderer/routes/current-path.injectable";
import type { ApplicationBuilder } from "../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../renderer/components/test-utils/get-application-builder";

describe("extension special characters in page registrations", () => {
  let applicationBuilder: ApplicationBuilder;
  let rendered: RenderResult;
  let testExtension: TestExtension;

  beforeEach(async () => {
    applicationBuilder = getApplicationBuilder();
    const getRendererExtensionFake = getRendererExtensionFakeFor(applicationBuilder);

    testExtension = getRendererExtensionFake(
      extensionWithPagesHavingSpecialCharacters,
    );

    await applicationBuilder.addExtensions(testExtension);

    rendered = await applicationBuilder.render();
  });

  it("renders", () => {
    expect(rendered.container).toMatchSnapshot();
  });

  describe("when navigating to route with ID having special characters", () => {
    beforeEach(() => {
      testExtension.navigate("/some-page-id/");
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("knows URL", () => {
      const currentPath = applicationBuilder.dis.rendererDi.inject(currentPathInjectable);

      expect(currentPath.get()).toBe("/extension/some-extension-name--/some-page-id");
    });
  });
});

const extensionWithPagesHavingSpecialCharacters: FakeExtensionData = {
  id: "some-extension-id",
  name: "@some-extension-name/",
  globalPages: [
    {
      id: "/some-page-id/",
      components: {
        Page: () => <div>Some page</div>,
      },
    },
  ],
};
