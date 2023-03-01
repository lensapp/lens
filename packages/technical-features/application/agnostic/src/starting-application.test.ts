import {
  createContainer,
  DiContainer,
  getInjectable,
} from "@ogre-tools/injectable";
import { registerFeature } from "@k8slens/feature-core";
import { feature } from "./feature";
import { startApplicationInjectionToken } from "./start-application/start-application.injectable";
import { beforeAnythingInjectionToken } from "./start-application/timeslots/before-anything-injection-token";
import { afterBeforeAnythingInjectionToken } from "./start-application/timeslots/after-before-anything-injection-token";
import { beforeApplicationIsLoadingInjectionToken } from "./start-application/timeslots/before-application-is-loading-injection-token";
import { untilReadyToStartInjectionToken } from "./start-application/triggers/until-ready-to-start-injection-token";
import asyncFn, { AsyncFnMock } from "@async-fn/jest";
import { untilApplicationIsReadyToLoadInjectionToken } from "./start-application/triggers/until-application-is-ready-to-load-injection-token";
import { onLoadOfApplicationInjectionToken } from "./start-application/timeslots/on-load-of-application-injection-token";
import { untilApplicationIsShownInjectionToken } from "./start-application/triggers/until-application-is-shown-injection-token";
import { afterApplicationIsLoadedInjectionToken } from "./start-application/timeslots/after-application-is-loaded-injection-token";

describe("starting-application", () => {
  let di: DiContainer;
  let untilReadyToStartMock: AsyncFnMock<() => Promise<void>>;
  let untilApplicationIsReadyToLoadMock: AsyncFnMock<() => Promise<void>>;
  let untilApplicationIsShownMock: AsyncFnMock<() => Promise<void>>;

  let beforeAnythingMock: jest.Mock;
  let afterBeforeAnythingMock: jest.Mock;
  let beforeApplicationIsLoadingMock: AsyncFnMock<() => Promise<void>>;
  let onLoadOfApplicationMock: AsyncFnMock<() => Promise<void>>;
  let afterApplicationIsLoadedMock: AsyncFnMock<() => Promise<void>>;

  beforeEach(() => {
    di = createContainer("irrelevant");

    registerFeature(di, feature);

    untilReadyToStartMock = asyncFn();
    untilApplicationIsReadyToLoadMock = asyncFn();
    untilApplicationIsShownMock = asyncFn();

    beforeAnythingMock = jest.fn();
    afterBeforeAnythingMock = jest.fn();
    beforeApplicationIsLoadingMock = asyncFn();
    onLoadOfApplicationMock = asyncFn();
    afterApplicationIsLoadedMock = asyncFn();

    const beforeAnythingInjectable = getInjectable({
      id: "before-anything",
      instantiate: () => ({ run: beforeAnythingMock }),
      injectionToken: beforeAnythingInjectionToken,
    });

    const afterBeforeAnythingInjectable = getInjectable({
      id: "after-before-anything",
      instantiate: () => ({ run: afterBeforeAnythingMock }),
      injectionToken: afterBeforeAnythingInjectionToken,
    });

    const beforeApplicationIsLoadingInjectable = getInjectable({
      id: "before-application-is-loading",
      instantiate: () => ({ run: beforeApplicationIsLoadingMock }),
      injectionToken: beforeApplicationIsLoadingInjectionToken,
    });

    const onLoadOfApplicationInjectable = getInjectable({
      id: "on-load-of-application",
      instantiate: () => ({ run: onLoadOfApplicationMock }),
      injectionToken: onLoadOfApplicationInjectionToken,
    });

    const afterApplicationIsLoadedInjectable = getInjectable({
      id: "after-application-is-loaded",
      instantiate: () => ({ run: afterApplicationIsLoadedMock }),
      injectionToken: afterApplicationIsLoadedInjectionToken,
    });

    const untilReadyToStartInjectable = getInjectable({
      id: "until-ready-to-start",
      instantiate: () => untilReadyToStartMock,
      injectionToken: untilReadyToStartInjectionToken,
    });

    const untilApplicationIsReadyToLoadInjectable = getInjectable({
      id: "until-application-is-ready-to-load",
      instantiate: () => untilApplicationIsReadyToLoadMock,
      injectionToken: untilApplicationIsReadyToLoadInjectionToken,
    });

    const untilApplicationIsShownInjectable = getInjectable({
      id: "until-application-is-shown",
      instantiate: () => untilApplicationIsShownMock,
      injectionToken: untilApplicationIsShownInjectionToken,
    });

    di.register(
      untilReadyToStartInjectable,
      untilApplicationIsReadyToLoadInjectable,
      untilApplicationIsShownInjectable,

      beforeAnythingInjectable,
      afterBeforeAnythingInjectable,
      beforeApplicationIsLoadingInjectable,
      onLoadOfApplicationInjectable,
      afterApplicationIsLoadedInjectable
    );
  });

  describe("when application is started", () => {
    beforeEach(() => {
      const startApplication = di.inject(startApplicationInjectionToken);

      startApplication();
    });

    it("calls the runnable registered in the before anything timeslot", () => {
      expect(beforeAnythingMock).toHaveBeenCalled();
    });

    it("calls the runnable registered in the after before anything timeslot", () => {
      expect(afterBeforeAnythingMock).toHaveBeenCalled();
    });

    it("does not call runnables registered in before application is loading yet", () => {
      expect(beforeApplicationIsLoadingMock).not.toHaveBeenCalled();
    });

    it("calls the trigger for when application is ready to start", () => {
      expect(untilReadyToStartMock).toHaveBeenCalled();
    });

    describe("when application is ready to be started", () => {
      beforeEach(async () => {
        await untilReadyToStartMock.resolve();
      });

      it("calls runnables registered in before application is loading", () => {
        expect(beforeApplicationIsLoadingMock).toHaveBeenCalled();
      });

      it("does not call the trigger for until application is ready to load yet", () => {
        expect(untilApplicationIsReadyToLoadMock).not.toHaveBeenCalled();
      });

      describe("when runnables in before application is loading resolve", () => {
        beforeEach(async () => {
          await beforeApplicationIsLoadingMock.resolve();
        });

        it("calls the trigger for until application is ready to load", () => {
          expect(untilApplicationIsReadyToLoadMock).toHaveBeenCalled();
        });

        it("does not call runnables registered in on load of application yet", () => {
          expect(onLoadOfApplicationMock).not.toHaveBeenCalled();
        });

        describe("when until application is ready to load resolves", () => {
          beforeEach(async () => {
            await untilApplicationIsReadyToLoadMock.resolve();
          });

          it("calls runnables registered in on load of application", () => {
            expect(onLoadOfApplicationMock).toHaveBeenCalled();
          });

          it("does not call the trigger for until application is shown yet", () => {
            expect(untilApplicationIsShownMock).not.toHaveBeenCalled();
          });

          describe("when runnables in before application is loading resolve", () => {
            beforeEach(async () => {
              await onLoadOfApplicationMock.resolve();
            });

            it("calls the trigger for until application is shown", () => {
              expect(untilApplicationIsShownMock).toHaveBeenCalled();
            });

            it("does not call runnables registered in after load of application yet", () => {
              expect(afterApplicationIsLoadedMock).not.toHaveBeenCalled();
            });

            it('when until application is shown resolves, calls runnables registered in after load of application', async () => {
              await untilApplicationIsShownMock.resolve();

              expect(afterApplicationIsLoadedMock).toHaveBeenCalled();
            });
          });
        });
      });
    });
  });
});
