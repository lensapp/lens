import { createContainer, DiContainer, getInjectable } from "@ogre-tools/injectable";
import { registerFeature } from "@k8slens/feature-core";
import { applicationFeatureForElectronMain } from "./feature";
import { beforeApplicationIsLoadingInjectionToken, startApplicationInjectionToken } from "@k8slens/application";
import asyncFn, { AsyncFnMock } from "@async-fn/jest";
import whenAppIsReadyInjectable from "./start-application/when-app-is-ready.injectable";
import * as timeSlots from "./start-application/time-slots";

describe("starting-of-electron-main-application", () => {
  let di: DiContainer;
  let beforeAnythingMock: jest.Mock;
  let beforeElectronIsReadyMock: jest.Mock;
  let beforeApplicationIsLoadingMock: AsyncFnMock<() => Promise<void>>;
  let whenAppIsReadyMock: AsyncFnMock<() => Promise<void>>;

  beforeEach(() => {
    di = createContainer("irrelevant");

    beforeAnythingMock = jest.fn();
    beforeElectronIsReadyMock = jest.fn();

    beforeApplicationIsLoadingMock = asyncFn();
    whenAppIsReadyMock = asyncFn();

    registerFeature(di, applicationFeatureForElectronMain);

    const beforeAnythingIsLoadingInjectable = getInjectable({
      id: "before-anything",
      instantiate: () => ({ run: beforeAnythingMock }),
      injectionToken: timeSlots.beforeAnythingInjectionToken,
    });

    const beforeElectronIsReadyIsLoadingInjectable = getInjectable({
      id: "before-electron-is-ready",
      instantiate: () => ({ run: beforeElectronIsReadyMock }),
      injectionToken: timeSlots.beforeElectronIsReadyInjectionToken,
    });

    const beforeApplicationIsLoadingInjectable = getInjectable({
      id: "before-application-is-loading",
      instantiate: () => ({ run: beforeApplicationIsLoadingMock }),
      injectionToken: beforeApplicationIsLoadingInjectionToken,
    });

    di.register(
      beforeAnythingIsLoadingInjectable,
      beforeElectronIsReadyIsLoadingInjectable,
      beforeApplicationIsLoadingInjectable,
    );

    di.override(whenAppIsReadyInjectable, () => whenAppIsReadyMock);
  });

  describe("when application is started", () => {
    beforeEach(() => {
      const startApplication = di.inject(startApplicationInjectionToken);

      void startApplication();
    });

    it("calls for synchronous runnables for before anything", () => {
      expect(beforeAnythingMock).toHaveBeenCalled();
    });

    it("calls for synchronous runnables for before electron is ready", () => {
      expect(beforeElectronIsReadyMock).toHaveBeenCalled();
    });
    it("calls to wait when electron is ready", () => {
      expect(whenAppIsReadyMock).toHaveBeenCalled();
    });

    it("does not call runnables for before application is loading yet", () => {
      expect(beforeApplicationIsLoadingMock).not.toHaveBeenCalled();
    });

    describe("when electron is ready", () => {
      beforeEach(async () => {
        await whenAppIsReadyMock.resolve();
      });

      it("calls runnables for before application is loading", () => {
        expect(beforeApplicationIsLoadingMock).toHaveBeenCalled();
      });
    });
  });
});
