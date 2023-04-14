import { runInAction } from "mobx";
import { createContainer, DiContainer, getInjectable } from "@ogre-tools/injectable";
import { renderFor } from "@k8slens/test-utils";
import { DockHost } from "./dock/dock-host";
import React from "react";
import type { RenderResult } from "@testing-library/react";
import { act } from "@testing-library/react";
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
      const dockTabInjectable1 = getInjectable({
        id: "some-dock-tab-1",

        instantiate: () => ({
          id: "some-dock-tab-1",
          TitleComponent: () => <div data-dock-tab-title-test="some-title-1">Some title 1</div>,

          ContentComponent: () => (
            <div data-dock-tab-content-test="some-content-1">Some content 1</div>
          ),
        }),

        injectionToken: dockTabInjectionToken,
      });

      const dockTabInjectable2 = getInjectable({
        id: "some-dock-tab-2",

        instantiate: () => ({
          id: "some-dock-tab-2",
          TitleComponent: () => <div data-dock-tab-title-test="some-title-2">Some title 2</div>,

          ContentComponent: () => (
            <div data-dock-tab-content-test="some-content-2">Some content 2</div>
          ),
        }),

        injectionToken: dockTabInjectionToken,
      });

      runInAction(() => {
        di.register(dockTabInjectable1, dockTabInjectable2);
      });
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("renders the titles of all the dock tabs in order", () => {
      expect(discover.queryAllElements("dock-tab-title").attributeValues).toEqual([
        "some-title-1",
        "some-title-2",
      ]);
    });

    it("renders only the content of the first dock tab", () => {
      expect(discover.queryAllElements("dock-tab-content").attributeValues).toEqual([
        "some-content-1",
      ]);
    });

    describe("when the second dock tab is clicked", () => {
      beforeEach(() => {
        act(() => {
          discover.getSingleElement("dock-tab", "some-dock-tab-2").click();
        });
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("renders only the content of the second dock tab", () => {
        expect(discover.queryAllElements("dock-tab-content").attributeValues).toEqual([
          "some-content-2",
        ]);
      });
    });
  });
});
