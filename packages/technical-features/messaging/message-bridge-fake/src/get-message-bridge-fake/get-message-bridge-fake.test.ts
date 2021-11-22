import { createContainer, DiContainer, Injectable } from "@ogre-tools/injectable";
import asyncFn, { AsyncFnMock } from "@async-fn/jest";
import { registerFeature } from "@k8slens/feature-core";
import {
  getMessageChannel,
  getMessageChannelListenerInjectable,
  getRequestChannel,
  getRequestChannelListenerInjectable,
  MessageChannel,
  testUtils,
  RequestChannel,
  requestFromChannelInjectionToken,
  sendMessageToChannelInjectionToken,
} from "@k8slens/messaging";

import { registerMobX } from "@ogre-tools/injectable-extension-for-mobx";
import { runInAction } from "mobx";
import { getPromiseStatus } from "@k8slens/test-utils";
import { getMessageBridgeFake } from "./get-message-bridge-fake";
import { startApplicationInjectionToken } from "@k8slens/application";

type SomeMessageChannel = MessageChannel<string>;
type SomeRequestChannel = RequestChannel<string, number>;

const someMessageChannel: SomeMessageChannel = getMessageChannel("some-message-channel");
const someRequestChannel: SomeRequestChannel = getRequestChannel("some-request-channel");
const someOtherRequestChannel: SomeRequestChannel = {
  id: "some-other-request-channel",
};
const someRequestChannelWithoutListeners: SomeRequestChannel = {
  id: "some-request-channel-without-listeners",
};

[{ scenarioIsAsync: true }, { scenarioIsAsync: false }].forEach(({ scenarioIsAsync }) =>
  describe(`get-message-bridge-fake, given running as ${scenarioIsAsync ? "async" : "sync"}`, () => {
    let messageBridgeFake: any;

    beforeEach(() => {
      messageBridgeFake = getMessageBridgeFake();
    });

    describe("given multiple DIs are involved", () => {
      let someDi1: DiContainer;
      let someDi2: DiContainer;
      let someDiWithoutListeners: DiContainer;

      beforeEach(async () => {
        someDi1 = createContainer("some-di-1");
        someDi2 = createContainer("some-di-2");

        someDiWithoutListeners = createContainer("some-di-3");

        registerMobX(someDi1);
        registerMobX(someDi2);
        registerMobX(someDiWithoutListeners);

        runInAction(() => {
          const feature = testUtils.messagingFeatureForUnitTesting;

          registerFeature(someDi1, feature);
          registerFeature(someDi2, feature);
          registerFeature(someDiWithoutListeners, feature);
        });

        messageBridgeFake.involve(someDi1, someDi2, someDiWithoutListeners);

        if (scenarioIsAsync) {
          messageBridgeFake.setAsync(scenarioIsAsync);
        }

        await Promise.all([
          someDi1.inject(startApplicationInjectionToken)(),
          someDi2.inject(startApplicationInjectionToken)(),
          someDiWithoutListeners.inject(startApplicationInjectionToken)(),
        ]);
      });

      describe("given there are message listeners", () => {
        let someHandler1MockInDi1: jest.Mock;
        let someHandler1MockInDi2: jest.Mock;
        let someHandler2MockInDi2: jest.Mock;
        let someListener1InDi2: Injectable<unknown, unknown>;

        beforeEach(() => {
          someHandler1MockInDi1 = jest.fn();
          someHandler1MockInDi2 = jest.fn();
          someHandler2MockInDi2 = jest.fn();

          const someListener1InDi1 = getMessageChannelListenerInjectable({
            id: "some-listener-in-di-1",
            channel: someMessageChannel,
            getHandler: () => someHandler1MockInDi1,
          });

          someListener1InDi2 = getMessageChannelListenerInjectable({
            id: "some-listener-in-di-2",
            channel: someMessageChannel,
            getHandler: () => someHandler1MockInDi2,
          });

          const someListener2InDi2 = getMessageChannelListenerInjectable({
            id: "some-listener-2-in-di-2",
            channel: someMessageChannel,
            getHandler: () => someHandler2MockInDi2,
          });

          runInAction(() => {
            someDi1.register(someListener1InDi1);
            someDi2.register(someListener1InDi2);
            someDi2.register(someListener2InDi2);
          });
        });

        describe("given there is a listener in di-2 that responds to a message with a message", () => {
          beforeEach(() => {
            const someResponder = getMessageChannelListenerInjectable({
              id: "some-responder-di-2",
              channel: someMessageChannel,

              getHandler: (di) => {
                const sendMessage = di.inject(sendMessageToChannelInjectionToken);

                return (message) => {
                  sendMessage(someMessageChannel, `some-response-to: ${message}`);
                };
              },
            });

            runInAction(() => {
              someDi2.register(someResponder);
            });
          });

          describe("given a message is sent in di-1", () => {
            beforeEach(() => {
              const sendMessageToChannelFromDi1 = someDi1.inject(sendMessageToChannelInjectionToken);

              sendMessageToChannelFromDi1(someMessageChannel, "some-message");
            });

            const scenarioTitle = scenarioIsAsync
              ? "when all message steps are propagated using a wrapper"
              : "immediately";

            // eslint-disable-next-line jest/valid-title
            describe(scenarioTitle, () => {
              let someWrapper: jest.Mock;

              beforeEach((done) => {
                someWrapper = jest.fn((propagation) => propagation());

                if (scenarioIsAsync) {
                  messageBridgeFake.messagePropagationRecursive(someWrapper).then(done);
                } else {
                  done();
                }
              });

              it("the response gets handled in di-1", () => {
                expect(someHandler1MockInDi1).toHaveBeenCalledWith("some-response-to: some-message", {
                  frameId: 42,
                  processId: 42,
                });
              });

              scenarioIsAsync &&
                it("the wrapper gets called with the both propagations", () => {
                  expect(someWrapper).toHaveBeenCalledTimes(2);
                });
            });

            const scenarioName: string = scenarioIsAsync
              ? "when all message steps are propagated not using a wrapper"
              : "immediately";

            // eslint-disable-next-line jest/valid-title
            describe(scenarioName, () => {
              beforeEach((done) => {
                if (scenarioIsAsync) {
                  messageBridgeFake.messagePropagationRecursive().then(done);
                } else {
                  done();
                }
              });

              it("the response gets handled in di-1", () => {
                expect(someHandler1MockInDi1).toHaveBeenCalledWith("some-response-to: some-message", {
                  frameId: 42,
                  processId: 42,
                });
              });
            });
          });
        });

        describe("when sending message in a DI", () => {
          beforeEach(() => {
            const sendMessageToChannelFromDi1 = someDi1.inject(sendMessageToChannelInjectionToken);

            sendMessageToChannelFromDi1(someMessageChannel, "some-message");
          });

          it("listener in sending DI does not handle the message", () => {
            expect(someHandler1MockInDi1).not.toHaveBeenCalled();
          });

          scenarioIsAsync &&
            it("listeners in other than sending DIs do not handle the message yet", () => {
              expect(someHandler1MockInDi2).not.toHaveBeenCalled();
              expect(someHandler2MockInDi2).not.toHaveBeenCalled();
            });

          const scenarioName = scenarioIsAsync ? "when messages are propagated" : "immediately";

          // eslint-disable-next-line jest/valid-title
          describe(scenarioName, () => {
            beforeEach((done) => {
              if (scenarioIsAsync) {
                messageBridgeFake.messagePropagation().then(done);
              } else {
                done();
              }
            });

            it("listeners in other than sending DIs handle the message", () => {
              expect(someHandler1MockInDi2).toHaveBeenCalledWith("some-message", {
                frameId: 42,
                processId: 42,
              });

              expect(someHandler2MockInDi2).toHaveBeenCalledWith("some-message", {
                frameId: 42,
                processId: 42,
              });
            });
          });

          scenarioIsAsync &&
            describe("when messages are propagated using a wrapper, such as act() in react testing lib", () => {
              let someWrapper: jest.Mock;

              beforeEach(async () => {
                someWrapper = jest.fn((observation) => observation());

                await messageBridgeFake.messagePropagation(someWrapper);
              });

              it("the wrapper gets called with the related propagation", async () => {
                expect(someWrapper).toHaveBeenCalledTimes(1);
              });

              it("listeners still handle the message", () => {
                expect(someHandler1MockInDi2).toHaveBeenCalledWith("some-message", {
                  frameId: 42,
                  processId: 42,
                });

                expect(someHandler2MockInDi2).toHaveBeenCalledWith("some-message", {
                  frameId: 42,
                  processId: 42,
                });
              });
            });
        });

        it("given a listener is deregistered, when sending message, deregistered listener does not handle the message", () => {
          runInAction(() => {
            someDi2.deregister(someListener1InDi2);
          });

          const sendMessageToChannelFromDi1 = someDi1.inject(sendMessageToChannelInjectionToken);

          someHandler1MockInDi2.mockClear();

          sendMessageToChannelFromDi1(someMessageChannel, "irrelevant");

          expect(someHandler1MockInDi2).not.toHaveBeenCalled();
        });
      });

      describe("given there are request listeners", () => {
        let someHandler1MockInDi1: AsyncFnMock<(message: string) => Promise<number>>;

        let someHandler1MockInDi2: AsyncFnMock<(message: string) => Promise<number>>;

        let someListener1InDi2: Injectable<unknown, unknown>;
        let actualPromise: Promise<number>;

        beforeEach(() => {
          someHandler1MockInDi1 = asyncFn();
          someHandler1MockInDi2 = asyncFn();

          const someListener1InDi1 = getRequestChannelListenerInjectable({
            id: "some-request-listener-in-di-1",
            channel: someOtherRequestChannel,
            getHandler: () => someHandler1MockInDi1,
          });

          someListener1InDi2 = getRequestChannelListenerInjectable({
            id: "some-request-listener-in-di-2",
            channel: someRequestChannel,
            getHandler: () => someHandler1MockInDi2,
          });

          runInAction(() => {
            someDi1.register(someListener1InDi1);
            someDi2.register(someListener1InDi2);
          });
        });

        describe("when requesting from a channel in a DI", () => {
          beforeEach(() => {
            const requestFromChannelFromDi1 = someDi1.inject(requestFromChannelInjectionToken);

            actualPromise = requestFromChannelFromDi1(someRequestChannel, "some-request");
          });

          it("listener in requesting DI does not handle the request", () => {
            expect(someHandler1MockInDi1).not.toHaveBeenCalled();
          });

          it("the listener in other than requesting DIs handle the request", () => {
            expect(someHandler1MockInDi2).toHaveBeenCalledWith("some-request");
          });

          it("does not resolve yet", async () => {
            const promiseStatus = await getPromiseStatus(actualPromise);

            expect(promiseStatus.fulfilled).toBe(false);
          });

          it("when handle resolves, resolves with response", async () => {
            await someHandler1MockInDi2.resolve(42);

            const actual = await actualPromise;

            expect(actual).toBe(42);
          });
        });

        it("given a listener is deregistered, when requesting, deregistered listener does not handle the request", () => {
          runInAction(() => {
            someDi2.deregister(someListener1InDi2);
          });

          const sendMessageToChannelFromDi1 = someDi1.inject(sendMessageToChannelInjectionToken);

          someHandler1MockInDi2.mockClear();

          sendMessageToChannelFromDi1(someMessageChannel, "irrelevant");

          expect(someHandler1MockInDi2).not.toHaveBeenCalled();
        });

        it("given there are multiple listeners between different DIs for same channel, when requesting, throws", () => {
          const someConflictingListenerInjectable = getRequestChannelListenerInjectable({
            id: "conflicting-listener",
            channel: someRequestChannel,
            getHandler: () => () => 84,
          });

          runInAction(() => {
            someDi1.register(someConflictingListenerInjectable);
          });

          const requestFromChannelFromDi2 = someDi2.inject(requestFromChannelInjectionToken);

          return expect(() => requestFromChannelFromDi2(someRequestChannel, "irrelevant")).rejects.toThrow(
            'Tried to make a request but multiple listeners were discovered for channel "some-request-channel" in multiple DIs.',
          );
        });

        it("when requesting from channel without listener, throws", () => {
          const requestFromChannel = someDi1.inject(requestFromChannelInjectionToken);

          return expect(() => requestFromChannel(someRequestChannelWithoutListeners, "irrelevant")).rejects.toThrow(
            'Tried to make a request but no listeners for channel "some-request-channel-without-listeners" was discovered in any DIs',
          );
        });
      });
    });
  }),
);
