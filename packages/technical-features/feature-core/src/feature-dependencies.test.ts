import { createContainer, DiContainer, getInjectable, Injectable } from "@ogre-tools/injectable";

import type { Feature } from "./feature";
import { registerFeature } from "./register-feature";
import { deregisterFeature } from "./deregister-feature";
import { getFeature } from "./feature";

describe("feature-dependencies", () => {
  describe("given a parent Feature with another Features as dependency", () => {
    let di: DiContainer;
    let someInjectable: Injectable<string>;
    let someInjectableInDependencyFeature: Injectable<string>;
    let someParentFeature: Feature;
    let someDependencyFeature: Feature;

    beforeEach(() => {
      di = createContainer("irrelevant");

      someInjectable = getInjectable({
        id: "some-injectable-2",
        instantiate: () => "some-instance",
      });

      someInjectableInDependencyFeature = getInjectable({
        id: "some-injectable",
        instantiate: () => "some-instance-2",
      });

      someDependencyFeature = getFeature({
        id: "some-dependency-feature",
        register: (di) => di.register(someInjectableInDependencyFeature),
      });

      someParentFeature = getFeature({
        id: "some-feature",
        register: (di) => di.register(someInjectable),
        dependencies: [someDependencyFeature],
      });

      registerFeature(di, someParentFeature);
    });

    it("when an injectable from the dependency Feature is injected, does so", () => {
      const actual = di.inject(someInjectableInDependencyFeature);

      expect(actual).toBe("some-instance-2");
    });

    it("when the dependency Feature is deregistered, throws", () => {
      expect(() => {
        deregisterFeature(di, someDependencyFeature);
      }).toThrow(
        'Tried to deregister Feature "some-dependency-feature", but it is the dependency of Features "some-feature"',
      );
    });

    it("given the parent Feature is already deregistered, when also the dependency Feature is deregistered, throws", () => {
      deregisterFeature(di, someParentFeature);

      expect(() => {
        deregisterFeature(di, someDependencyFeature);
      }).toThrow('Tried to deregister feature "some-dependency-feature", but it was not registered.');
    });

    it("given the parent Feature is deregistered, when injecting an injectable from the dependency Feature, throws", () => {
      deregisterFeature(di, someParentFeature);

      expect(() => {
        di.inject(someInjectableInDependencyFeature);
      }).toThrow('Tried to inject non-registered injectable "irrelevant" -> "some-injectable".');
    });
  });

  describe("given a first Feature is registered, when second Feature using the first Feature as dependency gets registered", () => {
    let di: DiContainer;
    let someInjectable: Injectable<string>;
    let someFeature2: Feature;
    let someFeature1: Feature;

    beforeEach(() => {
      di = createContainer("irrelevant");

      someInjectable = getInjectable({
        id: "some-injectable",
        instantiate: () => "some-instance",
      });

      someFeature1 = getFeature({
        id: "some-feature-1",
        register: (di) => di.register(someInjectable),
      });

      someFeature2 = getFeature({
        id: "some-feature-2",
        register: () => {},
        dependencies: [someFeature1],
      });

      registerFeature(di, someFeature1, someFeature2);
    });

    it("when the first Feature is deregistered, throws", () => {
      expect(() => {
        deregisterFeature(di, someFeature1);
      }).toThrow('Tried to deregister Feature "some-feature-1", but it is the dependency of Features "some-feature-2"');
    });

    it("given the second Feature is deregistered, when injecting an injectable from the first Feature, still does so", () => {
      deregisterFeature(di, someFeature2);

      const actual = di.inject(someInjectable);

      expect(actual).toBe("some-instance");
    });
  });

  describe("given parent Features with a shared Feature as dependency", () => {
    let di: DiContainer;
    let someInjectableInDependencyFeature: Injectable<string>;
    let someFeature1: Feature;
    let someFeature2: Feature;
    let someSharedDependencyFeature: Feature;

    beforeEach(() => {
      di = createContainer("irrelevant");

      someInjectableInDependencyFeature = getInjectable({
        id: "some-injectable-in-dependency-feature",
        instantiate: () => "some-instance",
      });

      someSharedDependencyFeature = getFeature({
        id: "some-dependency-feature",
        register: (di) => di.register(someInjectableInDependencyFeature),
      });

      const someFeatureForAdditionalHierarchy = getFeature({
        id: "some-feature-for-additional-hierarchy",
        register: () => {},
        dependencies: [someSharedDependencyFeature],
      });

      someFeature1 = getFeature({
        id: "some-feature-1",
        register: () => {},
        dependencies: [someFeatureForAdditionalHierarchy],
      });

      someFeature2 = getFeature({
        id: "some-feature-2",
        register: () => {},
        dependencies: [someFeatureForAdditionalHierarchy],
      });

      registerFeature(di, someFeature1, someFeature2);
    });

    it("when the shared Feature is deregistered, throws", () => {
      expect(() => {
        deregisterFeature(di, someSharedDependencyFeature);
      }).toThrow(
        'Tried to deregister Feature "some-dependency-feature", but it is the dependency of Features "some-feature-1, some-feature-2"',
      );
    });

    it("given only part of the parent Features get deregistered, when injecting an injectable from the shared Feature, does so", () => {
      deregisterFeature(di, someFeature1);

      const actual = di.inject(someInjectableInDependencyFeature);

      expect(actual).toBe("some-instance");
    });

    it("given all of the parent Features get deregistered, when injecting an injectable from the shared Feature, throws", () => {
      deregisterFeature(di, someFeature1, someFeature2);

      expect(() => {
        di.inject(someInjectableInDependencyFeature);
      }).toThrow('Tried to inject non-registered injectable "irrelevant" -> "some-injectable-in-dependency-feature".');
    });
  });

  describe("given parent Features with a shared Feature as dependency and registered, when the shared Feature gets registered again", () => {
    let di: DiContainer;
    let someInjectableInDependencyFeature: Injectable<string>;
    let someFeature1: Feature;
    let someFeature2: Feature;
    let someSharedDependencyFeature: Feature;

    beforeEach(() => {
      di = createContainer("irrelevant");

      someInjectableInDependencyFeature = getInjectable({
        id: "some-injectable-in-dependency-feature",
        instantiate: () => "some-instance",
      });

      someSharedDependencyFeature = getFeature({
        id: "some-dependency-feature",
        register: (di) => di.register(someInjectableInDependencyFeature),
      });

      const someFeatureForAdditionalHierarchy = getFeature({
        id: "some-feature-for-additional-hierarchy",
        register: () => {},
        dependencies: [someSharedDependencyFeature],
      });

      someFeature1 = getFeature({
        id: "some-feature-1",
        register: () => {},
        dependencies: [someFeatureForAdditionalHierarchy],
      });

      someFeature2 = getFeature({
        id: "some-feature-2",
        register: () => {},
        dependencies: [someFeatureForAdditionalHierarchy],
      });

      registerFeature(di, someFeature1, someFeature2, someSharedDependencyFeature);
    });

    it("when the shared Feature is deregistered, throws", () => {
      expect(() => {
        deregisterFeature(di, someSharedDependencyFeature);
      }).toThrow(
        'Tried to deregister Feature "some-dependency-feature", but it is the dependency of Features "some-feature-1, some-feature-2"',
      );
    });

    it("given only part of the parent Features get deregistered, when injecting an injectable from the shared Feature, does so", () => {
      deregisterFeature(di, someFeature1);

      const actual = di.inject(someInjectableInDependencyFeature);

      expect(actual).toBe("some-instance");
    });

    it("given all of the parent Features get deregistered, when injecting an injectable from the shared Feature, still does so", () => {
      deregisterFeature(di, someFeature1, someFeature2);

      const actual = di.inject(someInjectableInDependencyFeature);

      expect(actual).toBe("some-instance");
    });

    it("given all of the Features get deregistered, when injecting an injectable from the shared Feature, throws", () => {
      deregisterFeature(di, someFeature1, someFeature2, someSharedDependencyFeature);

      expect(() => {
        di.inject(someInjectableInDependencyFeature);
      }).toThrow('Tried to inject non-registered injectable "irrelevant" -> "some-injectable-in-dependency-feature".');
    });
  });
});
