import { runInAction } from "mobx";
import { createContainer, DiContainer, getInjectable } from "@ogre-tools/injectable";
import { renderFor } from "@k8slens/test-utils";
import { DockHost } from "./dock/dock-host";
import React from "react";
import type { RenderResult } from "@testing-library/react";
import { act } from "@testing-library/react";
import { dockTabTypeInjectionToken } from "./dock-tab-type";
import { Discover, discoverFor } from "@k8slens/react-testing-library-discovery";
import { registerFeature } from "@k8slens/feature-core";
import { dockFeature } from "./feature";
import { createDockTabInjectionToken } from "./dock/create-dock-tab.injectable";
import { getRandomIdInjectionToken } from "./dock/get-random-id.injectable";

const dockTabTypeInjectable1 = getInjectable({
  id: "some-dock-tab-type-1",

  instantiate: () => ({
    id: "some-dock-tab-type-1",
    TitleComponent: () => <div data-dock-tab-title-test="some-title-1">Some title 1</div>,

    ContentComponent: () => <div data-dock-tab-content-test="some-content-1">Some content 1</div>,
  }),

  injectionToken: dockTabTypeInjectionToken,
});

const dockTabTypeInjectable2 = getInjectable({
  id: "some-dock-tab-type-2",

  instantiate: () => ({
    id: "some-dock-tab-type-2",
    TitleComponent: () => <div data-dock-tab-title-test="some-title-2">Some title 2</div>,

    ContentComponent: () => <div data-dock-tab-content-test="some-content-2">Some content 2</div>,
  }),

  injectionToken: dockTabTypeInjectionToken,
});

describe("DockHost, given rendered", () => {
  let di: DiContainer;
  let rendered: RenderResult;
  let discover: Discover;

  beforeEach(() => {
    di = createContainer("some-container");

    registerFeature(di, dockFeature);

    di.override(getRandomIdInjectionToken, () => {
      let index = 1;

      return () => `some-random-id-${index++}`;
    });

    const render = renderFor(di);

    rendered = render(<DockHost />);
    discover = discoverFor(() => rendered);
  });

  it("given no implementations of dock tab types, renders", () => {
    expect(rendered.baseElement).toMatchSnapshot();
  });

  describe("given implementations of dock tab types emerge", () => {
    beforeEach(() => {
      runInAction(() => {
        di.register(dockTabTypeInjectable1, dockTabTypeInjectable2);
      });
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("renders no tabs", () => {
      const { discovered } = discover.querySingleElement("dock-tab");

      expect(discovered).toBeNull();
    });

    it("renders no content", () => {
      const { discovered } = discover.querySingleElement("dock-tab-content");

      expect(discovered).toBeNull();
    });

    describe("when dock tab of one of the types is created", () => {
      beforeEach(() => {
        const dockTabType1 = di.inject(dockTabTypeInjectable1);

        const createDockTab = di.inject(createDockTabInjectionToken);

        createDockTab({ type: dockTabType1 });
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("renders the title for the dock tab", () => {
        expect(discover.queryAllElements("dock-tab-title").attributeValues).toEqual([
          "some-title-1",
        ]);
      });

      it("renders the content of the first dock tab", () => {
        expect(discover.queryAllElements("dock-tab-content").attributeValues).toEqual([
          "some-content-1",
        ]);
      });

      describe("when all dock tabs are closed WIP(PASSES BUT IS CLEARLY WRONG)", () => {
        beforeEach(() => {
          act(() => {
            discover
              .getSingleElement("dock-tab", "some-random-id-1")
              .getSingleElement("close-tab")
              .click();
          });
        });

        fit("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        it("renders no tabs", () => {
          const { discovered } = discover.querySingleElement("dock-tab");

          expect(discovered).toBeNull();
        });

        it("renders no content", () => {
          const { discovered } = discover.querySingleElement("dock-tab-content");

          expect(discovered).toBeNull();
        });
      });

      describe("given another dock tab is created", () => {
        beforeEach(() => {
          const dockTabType2 = di.inject(dockTabTypeInjectable2);

          const createDockTab = di.inject(createDockTabInjectionToken);

          createDockTab({ type: dockTabType2 });
        });

        it("renders the titles of all the dock tabs in order of creating", () => {
          expect(discover.queryAllElements("dock-tab-title").attributeValues).toEqual([
            "some-title-1",
            "some-title-2",
          ]);
        });

        it("renders only the content of the just created dock tab", () => {
          expect(discover.queryAllElements("dock-tab-content").attributeValues).toEqual([
            "some-content-2",
          ]);
        });

        describe("when dock tab being active is closed", () => {
          beforeEach(() => {
            act(() => {
              discover
                .getSingleElement("dock-tab", "some-random-id-2")
                .getSingleElement("close-tab")
                .click();
            });
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          it("renders the title for the dock tab", () => {
            expect(discover.queryAllElements("dock-tab-title").attributeValues).toEqual([
              "some-title-1",
            ]);
          });

          it("renders the content of the previous dock tab", () => {
            expect(discover.queryAllElements("dock-tab-content").attributeValues).toEqual([
              "some-content-1",
            ]);
          });
        });

        describe("when dock tab not being active is closed", () => {
          beforeEach(() => {
            act(() => {
              discover
                .getSingleElement("dock-tab", "some-random-id-1")
                .getSingleElement("close-tab")
                .click();
            });
          });

          it("renders", () => {
            expect(rendered.baseElement).toMatchSnapshot();
          });

          it("renders the title for the dock tab", () => {
            expect(discover.queryAllElements("dock-tab-title").attributeValues).toEqual([
              "some-title-2",
            ]);
          });

          it("still renders the content of the active dock tab", () => {
            expect(discover.queryAllElements("dock-tab-content").attributeValues).toEqual([
              "some-content-2",
            ]);
          });
        });

        describe("when the second dock tab is clicked", () => {
          beforeEach(() => {
            act(() => {
              discover.getSingleElement("dock-tab", "some-random-id-2").click();
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
  });
});
