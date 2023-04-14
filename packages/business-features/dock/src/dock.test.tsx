import { runInAction } from "mobx";
import { createContainer, DiContainer, getInjectable } from "@ogre-tools/injectable";
import { renderFor } from "@k8slens/test-utils";
import { DockHost } from "./dock/dock-host";
import React from "react";
import type { RenderResult } from "@testing-library/react";
import { dockTabInjectionToken } from "./dock-tab";
import { Discover, discoverFor } from "@k8slens/react-testing-library-discovery";
import { registerFeature } from "@k8slens/feature-core";
import { dockFeature } from "./feature";

describe("DockHost, given rendered", () => {
  let di: DiContainer;
  let rendered: RenderResult;
  let discover: Discover;

  beforeEach(() => {
    di = createContainer("some-container");

    registerFeature(di, dockFeature);

    const render = renderFor(di);

    rendered = render(<DockHost />);
    discover = discoverFor(() => rendered);
  });

  it("given no implementations of dock tabs, renders", () => {
    expect(rendered.baseElement).toMatchSnapshot();
  });

  describe("given implementations of dock tabs emerge", () => {
    beforeEach(() => {
      const dockTabInjectable = getInjectable({
        id: "some-dock-tab",

        instantiate: () => ({
          id: "some-dock-tab",
          TitleComponent: () => <div data-some-dock-tab-title-test>Some title</div>,
          ContentComponent: () => <div data-some-dock-tab-content-test>Some content</div>,
        }),

        injectionToken: dockTabInjectionToken,
      });

      runInAction(() => {
        di.register(dockTabInjectable);
      });
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("renders the title of dock tab", () => {
      discover.getSingleElement("some-dock-tab-title");
    });

    it("renders the content of the dock tab", () => {
      discover.getSingleElement("some-dock-tab-content");
    });
  });
});
