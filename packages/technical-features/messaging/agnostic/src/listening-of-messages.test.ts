import {
  createContainer,
  DiContainer,
  getInjectable,
  Injectable,
} from "@ogre-tools/injectable";

import { registerFeature } from "@k8slens/feature-core";
import { registerMobX } from "@ogre-tools/injectable-extension-for-mobx";
import { runInAction } from "mobx";

import {
  EnlistMessageChannelListener,
  enlistMessageChannelListenerInjectionToken,
} from "./features/actual/message/enlist-message-channel-listener-injection-token";

import { messagingFeature } from "./features/actual/feature";

import {
  getMessageChannelListenerInjectable,
  MessageChannel,
  MessageChannelListener,
} from "./features/actual/message/message-channel-listener-injection-token";

import { listeningOfChannelsInjectionToken } from "./features/actual/listening-of-channels/listening-of-channels.injectable";
import { enlistRequestChannelListenerInjectionToken } from "./features/actual/request/enlist-request-channel-listener-injection-token";
import { sendMessageToChannelInjectionToken } from "./features/actual/message/message-to-channel-injection-token.no-coverage";
import { getMessageChannel } from "./features/actual/message/get-message-channel";

describe("listening-of-messages", () => {
  let di: DiContainer;
  let enlistMessageChannelListenerMock: jest.MockedFunction<EnlistMessageChannelListener>;
  let disposeSomeListenerMock: jest.Mock;
  let disposeSomeUnrelatedListenerMock: jest.Mock;

  beforeEach(() => {
    di = createContainer("irrelevant");

    registerMobX(di);

    disposeSomeListenerMock = jest.fn();
    disposeSomeUnrelatedListenerMock = jest.fn();

    enlistMessageChannelListenerMock = jest.fn((listener) =>
      listener.id === "some-listener"
        ? disposeSomeListenerMock
        : disposeSomeUnrelatedListenerMock
    );

    const someEnlistMessageChannelListenerInjectable = getInjectable({
      id: "some-enlist-message-channel-listener",
      instantiate: () => enlistMessageChannelListenerMock,
      injectionToken: enlistMessageChannelListenerInjectionToken,
    });

    const someEnlistRequestChannelListenerInjectable = getInjectable({
      id: "some-enlist-request-channel-listener",
      instantiate: () => () => () => {},
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
      let someChannel: MessageChannel<string>;
      let someMessageHandler: () => void;

      let someListenerInjectable: Injectable<
        MessageChannelListener<MessageChannel<string>>,
        MessageChannelListener<MessageChannel<unknown>>
      >;

      beforeEach(() => {
        someChannel = getMessageChannel("some-channel-id");

        someMessageHandler = () => {};

        someListenerInjectable = getMessageChannelListenerInjectable({
          id: "some-listener",
          channel: someChannel,
          getHandler: () => someMessageHandler,
        });

        runInAction(() => {
          di.register(someListenerInjectable);
        });
      });

      // Todo: make starting automatic by using a runnable with a timeslot.
      describe("when listening of channels is started", () => {
        beforeEach(() => {
          const listeningOnMessageChannels = di.inject(
            listeningOfChannelsInjectionToken
          );

          listeningOnMessageChannels.start();
        });

        it("it enlists a listener for the channel", () => {
          expect(enlistMessageChannelListenerMock).toHaveBeenCalledWith({
            id: "some-listener",
            channel: someChannel,
            handler: someMessageHandler,
          });
        });

        describe("when another listener gets registered", () => {
          let someOtherListenerInjectable: Injectable<
            MessageChannelListener<MessageChannel<string>>,
            MessageChannelListener<MessageChannel<unknown>>,
            void
          >;

          beforeEach(() => {
            const handler = () => someMessageHandler;

            someOtherListenerInjectable = getMessageChannelListenerInjectable({
              id: "some-other-listener",
              channel: someChannel,
              getHandler: handler,
            });

            enlistMessageChannelListenerMock.mockClear();

            runInAction(() => {
              di.register(someOtherListenerInjectable);
            });
          });

          it("only enlists it as well", () => {
            expect(enlistMessageChannelListenerMock.mock.calls).toEqual([
              [
                {
                  id: "some-other-listener",
                  channel: someChannel,
                  handler: someMessageHandler,
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
                enlistMessageChannelListenerMock.mockClear();

                runInAction(() => {
                  di.register(someListenerInjectable);
                });

                expect(enlistMessageChannelListenerMock).not.toHaveBeenCalled();
              });
            });
          });
        });
      });
    });
  });
});
