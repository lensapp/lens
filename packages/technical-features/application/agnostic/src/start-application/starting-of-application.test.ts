import { createContainer, DiContainer, getInjectable } from "@ogre-tools/injectable";
import { registerFeature } from "@k8slens/feature-core";
import { applicationFeature } from "../feature";
import { startApplicationInjectionToken } from "./start-application.injectable";
import * as timeSlots from "./time-slots";
import asyncFn, { AsyncFnMock } from "@async-fn/jest";

describe("starting-of-application", () => {
  let di: DiContainer;

  let beforeApplicationIsLoadingMock: AsyncFnMock<() => Promise<void>>;
  let onLoadOfApplicationMock: AsyncFnMock<() => Promise<void>>;
  let afterApplicationIsLoadedMock: AsyncFnMock<() => Promise<void>>;

  beforeEach(() => {
    di = createContainer("irrelevant");

    registerFeature(di, applicationFeature);

    beforeApplicationIsLoadingMock = asyncFn();
    onLoadOfApplicationMock = asyncFn();
    afterApplicationIsLoadedMock = asyncFn();

    const beforeApplicationIsLoadingInjectable = getInjectable({
      id: "before-application-is-loading",
      instantiate: () => ({ run: beforeApplicationIsLoadingMock }),
      injectionToken: timeSlots.beforeApplicationIsLoadingInjectionToken,
    });

    const onLoadOfApplicationInjectable = getInjectable({
      id: "on-load-of-application",
      instantiate: () => ({ run: onLoadOfApplicationMock }),
      injectionToken: timeSlots.onLoadOfApplicationInjectionToken,
    });

    const afterApplicationIsLoadedInjectable = getInjectable({
      id: "after-application-is-loaded",
      instantiate: () => ({ run: afterApplicationIsLoadedMock }),
      injectionToken: timeSlots.afterApplicationIsLoadedInjectionToken,
    });

    di.register(
      beforeApplicationIsLoadingInjectable,
      onLoadOfApplicationInjectable,
      afterApplicationIsLoadedInjectable,
    );
  });

  describe("when application is started", () => {
    beforeEach(() => {
      const startApplication = di.inject(startApplicationInjectionToken);

      void startApplication();
    });

    it("calls runnables registered in before application is loading", () => {
      expect(beforeApplicationIsLoadingMock).toHaveBeenCalled();
    });

    describe("when runnables in before application is loading resolve", () => {
      beforeEach(async () => {
        await beforeApplicationIsLoadingMock.resolve();
      });

      it("calls runnables registered in on load of application", () => {
        expect(onLoadOfApplicationMock).toHaveBeenCalled();
      });

      it("when runnables in before application is loading resolve, calls runnables registered in after load of application", async () => {
        await onLoadOfApplicationMock.resolve();

        expect(afterApplicationIsLoadedMock).toHaveBeenCalled();
      });
    });
  });
});
