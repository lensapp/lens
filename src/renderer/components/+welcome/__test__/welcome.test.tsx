/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { defaultWidth, Welcome } from "../welcome";
import { computed } from "mobx";
import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import type { DiRender } from "../../test-utils/renderFor";
import { renderFor } from "../../test-utils/renderFor";
import type { DiContainer } from "@ogre-tools/injectable";
import rendererExtensionsInjectable from "../../../../extensions/renderer-extensions.injectable";
import { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import type { WelcomeBannerRegistration } from "../welcome-banner-items/welcome-banner-registration";
import createStoresAndApisInjectable from "../../../create-stores-apis.injectable";

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
  let di: DiContainer;
  let welcomeBannersStub: WelcomeBannerRegistration[];

  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });
    render = renderFor(di);
    welcomeBannersStub = [];

    di.override(createStoresAndApisInjectable, () => true);
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
