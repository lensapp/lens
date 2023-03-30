import { registerFeature } from "@k8slens/feature-core";
import { createContainer, DiContainer, getInjectable } from "@ogre-tools/injectable";
import { registerMobX } from "@ogre-tools/injectable-extension-for-mobx";
import { registerInjectableReact } from "@ogre-tools/injectable-react";
import { reactApplicationRootFeature } from "./feature";
import { runInAction, computed, observable, IObservableValue } from "mobx";
import { startApplicationInjectionToken } from "@k8slens/application";
import type { RenderResult } from "@testing-library/react";
import { render, act } from "@testing-library/react";
import renderInjectable from "./render-application/render.injectable";
import { reactApplicationChildrenInjectionToken } from "./react-application/react-application-children-injection-token";
import React from "react";
import { Discover, discoverFor } from "@k8slens/react-testing-library-discovery";
import { reactApplicationWrapperInjectionToken } from "./react-application/react-application-wrapper-injection-token";

const SomeChildren = () => <div data-some-children-test>Some children</div>;

describe("react-application", () => {
  let rendered: RenderResult;
  let di: DiContainer;
  let discover: Discover;

  beforeEach(async () => {
    di = createContainer("some-container");

    registerInjectableReact(di);

    registerMobX(di);

    runInAction(() => {
      registerFeature(di, reactApplicationRootFeature);
    });

    di.override(renderInjectable, () => (application) => {
      rendered = render(application);
    });

    const startApplication = di.inject(startApplicationInjectionToken);

    await startApplication();

    discover = discoverFor(() => rendered);
  });

  it("renders", () => {
    expect(rendered.baseElement).toMatchSnapshot();
  });

  describe("when children is registered and enabled", () => {
    let someObservable: IObservableValue<boolean>;

    beforeEach(() => {
      someObservable = observable.box(true);

      const someChildrenInjectable = getInjectable({
        id: "some-children",

        instantiate: () => ({
          id: "some-children",
          Component: SomeChildren,
          enabled: computed(() => someObservable.get()),
        }),

        injectionToken: reactApplicationChildrenInjectionToken,
      });

      runInAction(() => {
        di.register(someChildrenInjectable);
      });
    });

    it("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    it("renders the children", () => {
      const { discovered } = discover.getSingleElement("some-children");

      expect(discovered).not.toBeNull();
    });

    describe("when wrapper is registered", () => {
      beforeEach(() => {
        const someWrapperInjectable = getInjectable({
          id: "some-wrapper",

          instantiate: () => (Component) => () =>
            (
              <div data-some-wrapper-test>
                <Component />
              </div>
            ),

          injectionToken: reactApplicationWrapperInjectionToken,
        });

        runInAction(() => {
          di.register(someWrapperInjectable);
        });
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("renders the children inside the wrapper", () => {
        const { discovered } = discover
          .getSingleElement("some-wrapper")
          .getSingleElement("some-children");

        expect(discovered).not.toBeNull();
      });
    });

    describe("when children is enabled", () => {
      beforeEach(() => {
        act(() => {
          runInAction(() => {
            someObservable.set(false);
          });
        });
      });

      it("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      it("does not render the children", () => {
        const { discovered } = discover.querySingleElement("some-children");

        expect(discovered).toBeNull();
      });
    });
  });
});
