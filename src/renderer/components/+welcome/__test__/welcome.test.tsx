/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from "react";
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { defaultWidth, Welcome } from "../welcome";
import { computed } from "mobx";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import type { DiRender } from "../../test-utils/renderFor";
import { renderFor } from "../../test-utils/renderFor";
import type { ConfigurableDependencyInjectionContainer } from "@ogre-tools/injectable";
import rendererExtensionsInjectable from "../../../../extensions/renderer-extensions.injectable";
import { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import type { WelcomeBannerRegistration } from "../welcome-banner-items/welcome-banner-registration";

jest.mock("electron", () => ({
  ipcRenderer: {
    on: jest.fn(),
  },
  app: {
    getPath: () => "tmp",
  },
}));

describe("<Welcome/>", () => {
  let render: DiRender;
  let di: ConfigurableDependencyInjectionContainer;
  let welcomeBannersStub: WelcomeBannerRegistration[];

  beforeEach(() => {
    di = getDiForUnitTesting();

    render = renderFor(di);

    welcomeBannersStub = [];

    di.override(rendererExtensionsInjectable, () =>
      computed(() => [
        new TestExtension({
          id: "some-id",
          welcomeBanners: welcomeBannersStub,
        }),
      ]),
    );
  });

  it("renders <Banner /> registered in WelcomeBannerRegistry and hide logo", async () => {
    const testId = "testId";

    welcomeBannersStub.push({
      Banner: () => <div data-testid={testId} />,
    });

    const { container } = render(<Welcome />);

    expect(screen.queryByTestId(testId)).toBeInTheDocument();
    expect(container.getElementsByClassName("logo").length).toBe(0);
  });

  it("calculates max width from WelcomeBanner.width registered in WelcomeBannerRegistry", async () => {
    welcomeBannersStub.push({
      width: 100,
      Banner: () => <div />,
    });

    welcomeBannersStub.push({
      width: 800,
      Banner: () => <div />,
    });

    render(<Welcome />);

    expect(screen.queryByTestId("welcome-banner-container")).toHaveStyle({
      // should take the max width of the banners (if > defaultWidth)
      width: `800px`,
    });
    expect(screen.queryByTestId("welcome-text-container")).toHaveStyle({
      width: `${defaultWidth}px`,
    });
    expect(screen.queryByTestId("welcome-menu-container")).toHaveStyle({
      width: `${defaultWidth}px`,
    });
  });
});

class TestExtension extends LensRendererExtension {
  constructor({
    id,
    welcomeBanners,
  }: {
    id: string;
    welcomeBanners: WelcomeBannerRegistration[];
  }) {
    super({
      id,
      absolutePath: "irrelevant",
      isBundled: false,
      isCompatible: false,
      isEnabled: false,
      manifest: { name: id, version: "some-version" },
      manifestPath: "irrelevant",
    });

    this.welcomeBanners = welcomeBanners;
  }
}
