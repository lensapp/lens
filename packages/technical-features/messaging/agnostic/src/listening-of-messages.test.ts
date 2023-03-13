import { createContainer, DiContainer, Injectable } from "@ogre-tools/injectable";

import { registerFeature } from "@k8slens/feature-core";
import { registerMobX } from "@ogre-tools/injectable-extension-for-mobx";
import { runInAction } from "mobx";

import {
  EnlistMessageChannelListener,
  enlistMessageChannelListenerInjectionToken,
} from "./features/actual/message/enlist-message-channel-listener-injection-token";

import { messagingFeatureForUnitTesting } from "./features/unit-testing";

import {
  getMessageChannelListenerInjectable,
  MessageChannel,
  MessageChannelListener,
} from "./features/actual/message/message-channel-listener-injection-token";

import { listeningOfChannelsInjectionToken } from "./features/actual/listening-of-channels/listening-of-channels.injectable";

import { getMessageChannel } from "./features/actual/message/get-message-channel";
import { applicationFeature, startApplicationInjectionToken } from "@k8slens/application";

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
      listener.id === "some-channel-id-message-listener-some-listener"
        ? disposeSomeListenerMock
        : disposeSomeUnrelatedListenerMock,
    );

    runInAction(() => {
      registerFeature(di, applicationFeature, messagingFeatureForUnitTesting);
    });

    di.override(enlistMessageChannelListenerInjectionToken, () => enlistMessageChannelListenerMock);
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

      describe("when application is started", () => {
        beforeEach(async () => {
          const startApplication = di.inject(startApplicationInjectionToken);

          await startApplication();
        });

        it("enlists a listener for the channel", () => {
          expect(enlistMessageChannelListenerMock).toHaveBeenCalledWith({
            id: "some-channel-id-message-listener-some-listener",
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
                  id: "some-channel-id-message-listener-some-other-listener",
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
