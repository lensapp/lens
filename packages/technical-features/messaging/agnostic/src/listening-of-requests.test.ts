import { createContainer, DiContainer, Injectable } from "@ogre-tools/injectable";

import { registerFeature } from "@k8slens/feature-core";
import { registerMobX } from "@ogre-tools/injectable-extension-for-mobx";
import { _resetGlobalState, configure, runInAction } from "mobx";

import {
  EnlistRequestChannelListener,
  enlistRequestChannelListenerInjectionToken,
} from "./features/actual/request/enlist-request-channel-listener-injection-token";

import { messagingFeatureForUnitTesting } from "./features/unit-testing";

import {
  getRequestChannelListenerInjectable,
  RequestChannel,
  RequestChannelListener,
} from "./features/actual/request/request-channel-listener-injection-token";

import { listeningOfChannelsInjectionToken } from "./features/actual/listening-of-channels/listening-of-channels.injectable";
import { noop } from "lodash/fp";
import { getRequestChannel } from "./features/actual/request/get-request-channel";
import { applicationFeature, startApplicationInjectionToken } from "@k8slens/application";

describe("listening-of-requests", () => {
  let di: DiContainer;
  let enlistRequestChannelListenerMock: jest.MockedFunction<EnlistRequestChannelListener>;
  let disposeSomeListenerMock: jest.Mock;
  let disposeSomeUnrelatedListenerMock: jest.Mock;

  beforeEach(() => {
    configure({
      disableErrorBoundaries: false,
    });

    _resetGlobalState();

    di = createContainer("irrelevant");

    registerMobX(di);

    disposeSomeListenerMock = jest.fn();
    disposeSomeUnrelatedListenerMock = jest.fn();

    enlistRequestChannelListenerMock = jest.fn((listener) =>
      listener.id === "some-channel-id-request-listener-some-listener"
        ? disposeSomeListenerMock
        : disposeSomeUnrelatedListenerMock,
    );

    runInAction(() => {
      registerFeature(di, applicationFeature, messagingFeatureForUnitTesting);
    });

    di.override(enlistRequestChannelListenerInjectionToken, () => enlistRequestChannelListenerMock);
  });

  describe("given listening of channels has not started yet", () => {
    describe("when a new listener gets registered", () => {
      let someChannel: RequestChannel<string, string>;
      let someOtherChannel: RequestChannel<string, string>;
      let someRequestHandler: () => string;

      let someListenerInjectable: Injectable<
        RequestChannelListener<RequestChannel<string, string>>,
        RequestChannelListener<RequestChannel<unknown, unknown>>
      >;

      beforeEach(() => {
        someChannel = getRequestChannel("some-channel-id");
        someOtherChannel = getRequestChannel("some-other-channel-id");

        someRequestHandler = () => "some-response";

        someListenerInjectable = getRequestChannelListenerInjectable({
          id: "some-listener",
          channel: someChannel,
          getHandler: () => someRequestHandler,
        });

        runInAction(() => {
          di.register(someListenerInjectable);
        });
      });

      describe("when application is started", () => {
        beforeEach(async () => {
          const startApplication = di.inject(startApplicationInjectionToken);

          await startApplication();
        });

        it("enlists a listener for the channel", () => {
          expect(enlistRequestChannelListenerMock).toHaveBeenCalledWith({
            id: "some-channel-id-request-listener-some-listener",
            channel: someChannel,
            handler: someRequestHandler,
          });
        });

        it("when another listener for same channel gets registered, throws", () => {
          const originalConsoleWarn = console.warn;

          console.warn = noop;

          configure({
            disableErrorBoundaries: true,
          });

          console.warn = originalConsoleWarn;

          const handler = () => someRequestHandler;

          const someConflictingListenerInjectable = getRequestChannelListenerInjectable({
            id: "some-other-listener",
            channel: someChannel,
            getHandler: handler,
          });

          expect(() => {
            runInAction(() => {
              di.register(someConflictingListenerInjectable);
            });
          }).toThrow('Tried to add listener for channel "some-channel-id" but listener already exists.');
        });

        describe("when another listener gets registered", () => {
          let someOtherListenerInjectable: Injectable<
            RequestChannelListener<RequestChannel<string, string>>,
            RequestChannelListener<RequestChannel<unknown, unknown>>
          >;

          beforeEach(() => {
            const handler = () => someRequestHandler;

            someOtherListenerInjectable = getRequestChannelListenerInjectable({
              id: "some-other-listener",
              channel: someOtherChannel,
              getHandler: handler,
            });

            enlistRequestChannelListenerMock.mockClear();

            runInAction(() => {
              di.register(someOtherListenerInjectable);
            });
          });

          it("only enlists it as well", () => {
            expect(enlistRequestChannelListenerMock.mock.calls).toEqual([
              [
                {
                  id: "some-other-channel-id-request-listener-some-other-listener",
                  channel: someOtherChannel,
                  handler: someRequestHandler,
                },
              ],
            ]);
          });

          describe("when one of the listeners gets deregistered", () => {
            beforeEach(() => {
              runInAction(() => {
                di.deregister(someListenerInjectable);
              });
            });

            it("the listener gets disposed", () => {
              expect(disposeSomeListenerMock).toHaveBeenCalled();
            });

            it("the unrelated listener does not get disposed", () => {
              expect(disposeSomeUnrelatedListenerMock).not.toHaveBeenCalled();
            });

            describe("when listening of channels stops", () => {
              beforeEach(() => {
                const listening = di.inject(listeningOfChannelsInjectionToken);

                listening.stop();
              });

              it("remaining listeners get disposed", () => {
                expect(disposeSomeUnrelatedListenerMock).toHaveBeenCalled();
              });

              it("when yet another listener gets registered, does not enlist it", () => {
                enlistRequestChannelListenerMock.mockClear();

                runInAction(() => {
                  di.register(someListenerInjectable);
                });

                expect(enlistRequestChannelListenerMock).not.toHaveBeenCalled();
              });
            });
          });
        });
      });
    });
  });
});
