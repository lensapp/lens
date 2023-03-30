import { registerFeature } from "./register-feature";
import { createContainer, DiContainer, getInjectable, Injectable } from "@ogre-tools/injectable";
import type { Feature } from "./feature";
import { getFeature } from "./feature";
import { deregisterFeature } from "./deregister-feature";

describe("register-feature", () => {
  describe("given di-container and a Features with injectables, and given Features are registered", () => {
    let di: DiContainer;
    let someInjectable: Injectable<string>;
    let someInjectable2: Injectable<string>;
    let someFeature: Feature;
    let someFeature2: Feature;
    let instance: string;

    beforeEach(() => {
      di = createContainer("irrelevant");

      someInjectable = getInjectable({
        id: "some-injectable",
        instantiate: () => "some-instance",
      });

      someInjectable2 = getInjectable({
        id: "some-injectable-2",
        instantiate: () => "some-instance-2",
      });

      someFeature = getFeature({
        id: "some-feature-1",
        register: (di) => di.register(someInjectable),
      });

      someFeature2 = getFeature({
        id: "some-feature-2",
        register: (di) => di.register(someInjectable2),
      });

      registerFeature(di, someFeature);
      registerFeature(di, someFeature2);
    });

    it("when an injectable is injected, does so", () => {
      instance = di.inject(someInjectable);

      expect(instance).toBe("some-instance");
    });

    describe("given a Feature is deregistered", () => {
      beforeEach(() => {
        deregisterFeature(di, someFeature);
      });

      it("when injecting a related injectable, throws", () => {
        expect(() => {
          di.inject(someInjectable);
        }).toThrow();
      });

      it("when injecting an unrelated injectable, does so", () => {
        const instance = di.inject(someInjectable2);

        expect(instance).toBe("some-instance-2");
      });

      describe("given the Feature is registered again", () => {
        beforeEach(() => {
          registerFeature(di, someFeature);
        });

        it("when injecting a related injectable, does so", () => {
          const instance = di.inject(someInjectable);

          expect(instance).toBe("some-instance");
        });

        it("when injecting an unrelated injectable, does so", () => {
          const instance = di.inject(someInjectable2);

          expect(instance).toBe("some-instance-2");
        });
      });
    });

    it("when a Feature is registered again, throws", () => {
      expect(() => {
        registerFeature(di, someFeature);
      }).toThrow('Tried to register feature "some-feature-1", but it was already registered.');
    });

    it("given a Feature deregistered, when deregistered again, throws", () => {
      deregisterFeature(di, someFeature);

      expect(() => {
        deregisterFeature(di, someFeature);
      }).toThrow('Tried to deregister feature "some-feature-1", but it was not registered.');
    });
  });

  it("given di-container and registered Features with injectables forming a cycle, when an injectable is injected, throws with namespaced error about cycle", () => {
    const someInjectable: Injectable<any> = getInjectable({
      id: "some-injectable-1",
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      instantiate: (di) => di.inject(someInjectable2),
    });

    const someInjectable2: Injectable<any> = getInjectable({
      id: "some-injectable-2",
      instantiate: (di) => di.inject(someInjectable),
    });

    const di = createContainer("some-container", {
      detectCycles: false,
    });

    const someFeature = getFeature({
      id: "some-feature-1",

      register: (di) => {
        di.register(someInjectable);
      },
    });

    const someFeature2 = getFeature({
      id: "some-feature-2",

      register: (di) => {
        di.register(someInjectable2);
      },
    });

    registerFeature(di, someFeature, someFeature2);

    expect(() => {
      di.inject(someInjectable);
    }).toThrow(
      "Maximum call stack size exceeded",
      // eslint-disable-next-line max-len
      // 'Cycle of injectables encountered: "some-feature-1:some-injectable-1" -> "some-feature-2:some-injectable-2" -> "some-feature-1:some-injectable-1"',
    );
  });
});
