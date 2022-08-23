/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { RenderResult } from "@testing-library/react";
import currentPathInjectable from "../renderer/routes/current-path.injectable";
import type { ApplicationBuilder } from "../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../renderer/components/test-utils/get-application-builder";
import type { DiContainer } from "@ogre-tools/injectable";
import type { FakeExtensionOptions } from "../renderer/components/test-utils/get-extension-fake";

describe("extension special characters in page registrations", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;
  let windowDi: DiContainer;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    rendered = await builder.render();

    builder.extensions.enable(extensionWithPagesHavingSpecialCharacters);

    windowDi = builder.applicationWindow.only.di;
  });

  it("renders", () => {
    expect(rendered.container).toMatchSnapshot();
  });

  describe("when navigating to route with ID having special characters", () => {
    beforeEach(() => {
      const testExtension =
        builder.extensions.get("some-extension-id").applicationWindows.only;

      testExtension.navigate("/some-page-id/");
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("knows URL", () => {
      const currentPath = windowDi.inject(currentPathInjectable);

      expect(currentPath.get()).toBe("/extension/some-extension-name--/some-page-id");
    });
  });
});

const extensionWithPagesHavingSpecialCharacters: FakeExtensionOptions = {
  id: "some-extension-id",
  name: "@some-extension-name/",

  rendererOptions: {
    globalPages: [
      {
        id: "/some-page-id/",
        components: {
          Page: () => <div>Some page</div>,
        },
      },
    ],
  },
};
