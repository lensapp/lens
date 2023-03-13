import {
  createContainer,
  DiContainer,
  getInjectable,
  Injectable,
} from "@ogre-tools/injectable";

import { registerFeature } from "@k8slens/feature-core";
import { registerMobX } from "@ogre-tools/injectable-extension-for-mobx";
import { _resetGlobalState, configure, runInAction } from "mobx";

import {
  EnlistRequestChannelListener,
  enlistRequestChannelListenerInjectionToken,
} from "./features/actual/request/enlist-request-channel-listener-injection-token";

import { messagingFeature } from "./features/actual/feature";

import {
  getRequestChannelListenerInjectable,
  RequestChannel,
  RequestChannelListener,
} from "./features/actual/request/request-channel-listener-injection-token";

import { listeningOfChannelsInjectionToken } from "./features/actual/listening-of-channels/listening-of-channels.injectable";
import { enlistMessageChannelListenerInjectionToken } from "./features/actual/message/enlist-message-channel-listener-injection-token";
import { noop } from "lodash/fp";
import { sendMessageToChannelInjectionToken } from "./features/actual/message/message-to-channel-injection-token.no-coverage";
import { getRequestChannel } from "./features/actual/request/get-request-channel";

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
      listener.id === "some-listener"
        ? disposeSomeListenerMock
        : disposeSomeUnrelatedListenerMock
    );

    const someEnlistMessageChannelListenerInjectable = getInjectable({
      id: "some-enlist-message-channel-listener",
      instantiate: () => () => () => {},
      injectionToken: enlistMessageChannelListenerInjectionToken,
    });

    const someEnlistRequestChannelListenerInjectable = getInjectable({
      id: "some-enlist-request-channel-listener",
      instantiate: () => enlistRequestChannelListenerMock,
      injectionToken: enlistRequestChannelListenerInjectionToken,
    });

    const sendMessageToChannelDummyInjectable = getInjectable({
      id: "send-message-to-channel-dummy",
      instantiate: () => () => {},
      injectionToken: sendMessageToChannelInjectionToken,
    });

    runInAction(() => {
      di.register(
        someEnlistMessageChannelListenerInjectable,
        someEnlistRequestChannelListenerInjectable,
        sendMessageToChannelDummyInjectable
      );

      registerFeature(di, messagingFeature);
    });
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

      // Todo: make starting automatic by using a runnable with a timeslot.
      describe("when listening of channels is started", () => {
        beforeEach(() => {
          const listeningOnRequestChannels = di.inject(
            listeningOfChannelsInjectionToken
          );

          listeningOnRequestChannels.start();
        });

        it("it enlists a listener for the channel", () => {
          expect(enlistRequestChannelListenerMock).toHaveBeenCalledWith({
            id: "some-listener",
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

          const someConflictingListenerInjectable =
            getRequestChannelListenerInjectable({
              id: "some-other-listener",
              channel: someChannel,
              getHandler: handler,
            });

          expect(() => {
            runInAction(() => {
              di.register(someConflictingListenerInjectable);
            });
          }).toThrow(
            'Tried to add listener for channel "some-channel-id" but listener already exists.'
          );
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
                  id: "some-other-listener",
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
