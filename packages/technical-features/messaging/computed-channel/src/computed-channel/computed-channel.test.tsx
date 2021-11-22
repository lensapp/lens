import React from "react";
import { act } from "@testing-library/react";
import { createContainer, DiContainer, getInjectable } from "@ogre-tools/injectable";
import { getMessageBridgeFake, MessageBridgeFake } from "@k8slens/messaging-fake-bridge";
import { startApplicationInjectionToken } from "@k8slens/application";
import { computed, IComputedValue, IObservableValue, observable, reaction, runInAction } from "mobx";
import type { MessageChannel } from "@k8slens/messaging";
import { getMessageChannelListenerInjectable } from "@k8slens/messaging";
import { registerMobX } from "@ogre-tools/injectable-extension-for-mobx";
import { registerFeature } from "@k8slens/feature-core";
import { testUtils } from "@k8slens/messaging";
import { computedChannelInjectionToken, computedChannelObserverInjectionToken } from "./computed-channel.injectable";
import { runWithThrownMobxReactions, renderFor } from "@k8slens/test-utils";
import { observer } from "mobx-react";
import {
  computedChannelAdministrationChannel,
  ComputedChannelAdminMessage,
} from "./computed-channel-administration-channel.injectable";
import { computedChannelFeature } from "../feature";

const testChannel: MessageChannel<string> = { id: "some-channel-id" };
const testChannel2: MessageChannel<string> = { id: "some-other-channel-id" };

const TestComponent = observer(({ someComputed }: { someComputed: IComputedValue<string> }) => (
  <div>{someComputed.get()}</div>
));

[{ scenarioIsAsync: true }, { scenarioIsAsync: false }].forEach(({ scenarioIsAsync }) =>
  describe(`computed-channel, given running message bridge fake as ${scenarioIsAsync ? "async" : "sync"}`, () => {
    describe("given multiple dis and a message channel and a channel observer and application has started", () => {
      let di1: DiContainer;
      let di2: DiContainer;
      let latestAdminMessage: ComputedChannelAdminMessage | undefined;
      let latestValueMessage: string | undefined;
      let messageBridgeFake: MessageBridgeFake;

      beforeEach(async () => {
        latestAdminMessage = undefined;
        latestValueMessage = undefined;

        di1 = createContainer("some-container-1");
        di2 = createContainer("some-container-2");
        registerMobX(di1);
        registerMobX(di2);

        const administrationChannelTestListenerInjectable = getMessageChannelListenerInjectable({
          id: "administration-channel-test-listener",
          channel: computedChannelAdministrationChannel,

          getHandler: () => (adminMessage) => {
            latestAdminMessage = adminMessage;
          },
        });

        const channelValueTestListenerInjectable = getMessageChannelListenerInjectable({
          id: "test-channel-value-listener",
          channel: testChannel,

          getHandler: () => (message) => {
            latestValueMessage = message;
          },
        });

        runInAction(() => {
          const messagingFeature = testUtils.messagingFeatureForUnitTesting;

          registerFeature(di1, messagingFeature, computedChannelFeature);
          registerFeature(di2, messagingFeature, computedChannelFeature);

          di1.register(channelValueTestListenerInjectable);
          di2.register(administrationChannelTestListenerInjectable);
        });

        messageBridgeFake = getMessageBridgeFake();
        messageBridgeFake.setAsync(scenarioIsAsync);
        messageBridgeFake.involve(di1, di2);

        await Promise.all([di1.inject(startApplicationInjectionToken)(), di2.inject(startApplicationInjectionToken)()]);
      });

      describe("given a channel observer and matching computed channel for the channel in di-2", () => {
        let someObservable: IObservableValue<string>;
        let computedTestChannel: IComputedValue<string>;

        beforeEach(() => {
          someObservable = observable.box<string>("some-initial-value");

          const channelObserverInjectable = getInjectable({
            id: "some-channel-observer",

            instantiate: () => ({
              channel: testChannel,
              observer: computed(() => someObservable.get()),
            }),

            injectionToken: computedChannelObserverInjectionToken,
          });

          runInAction(() => {
            di2.register(channelObserverInjectable);
          });

          const computedChannel = di1.inject(computedChannelInjectionToken);

          computedTestChannel = computedChannel(testChannel, "some-pending-value");
        });

        it("there is no admin message yet", () => {
          expect(latestAdminMessage).toBeUndefined();
        });

        describe("when observing the computed value in a component in di-1", () => {
          let rendered: any;

          beforeEach(() => {
            const render = renderFor(di2);

            rendered = render(<TestComponent someComputed={computedTestChannel} />);
          });

          const scenarioName = scenarioIsAsync ? "when all messages are propagated" : "immediately";

          // eslint-disable-next-line jest/valid-title
          describe(scenarioName, () => {
            beforeEach((done) => {
              if (scenarioIsAsync) {
                messageBridgeFake.messagePropagationRecursive(act).then(done);
              } else {
                done();
              }
            });

            it("renders", () => {
              expect(rendered.container).toHaveTextContent("some-initial-value");
            });
          });
        });

        describe("when observing the computed channel in di-1", () => {
          let observedValue: string | undefined;
          let stopObserving: () => void;

          beforeEach(() => {
            observedValue = undefined;

            stopObserving = reaction(
              () => computedTestChannel.get(),
              (value) => {
                observedValue = value;
              },

              {
                fireImmediately: true,
              },
            );
          });

          scenarioIsAsync &&
            it("computed test channel value is observed as the pending value", () => {
              expect(observedValue).toBe("some-pending-value");
            });

          const scenarioName = scenarioIsAsync ? "when admin messages are propagated" : "immediately";

          // eslint-disable-next-line jest/valid-title
          describe(scenarioName, () => {
            beforeEach((done) => {
              if (scenarioIsAsync) {
                void messageBridgeFake.messagePropagation().then(done);
              } else {
                done();
              }
            });

            it("administration-message to start observing gets listened", () => {
              expect(latestAdminMessage).toEqual({
                channelId: "some-channel-id",
                status: "became-observed",
              });
            });

            const scenarioName = scenarioIsAsync ? "when returning value-messages propagate" : "immediately";

            // eslint-disable-next-line jest/valid-title
            describe(scenarioName, () => {
              beforeEach((done) => {
                if (scenarioIsAsync) {
                  void messageBridgeFake.messagePropagation().then(done);
                } else {
                  done();
                }
              });

              it("the computed channel value in di-1 matches the value in di-2", () => {
                expect(observedValue).toBe("some-initial-value");
              });

              it("the value gets listened in di-1", () => {
                expect(latestValueMessage).toBe("some-initial-value");
              });

              describe("when the observed value changes", () => {
                beforeEach(async () => {
                  latestValueMessage = undefined;

                  runInAction(() => {
                    someObservable.set("some-new-value");
                  });
                });

                const scenarioName = scenarioIsAsync ? "when value-messages propagate" : "immediately";

                // eslint-disable-next-line jest/valid-title
                describe(scenarioName, () => {
                  beforeEach((done) => {
                    if (scenarioIsAsync) {
                      void messageBridgeFake.messagePropagation().then(done);
                    } else {
                      done();
                    }
                  });

                  it("the computed channel value in di-1 changes", () => {
                    expect(observedValue).toBe("some-new-value");
                  });

                  it("the new value gets listened in di-1", () => {
                    expect(latestValueMessage).toBe("some-new-value");
                  });
                });
              });

              describe("when stopping observation for the channel in di-1", () => {
                beforeEach(async () => {
                  latestValueMessage = undefined;

                  stopObserving();
                });

                const scenarioName = scenarioIsAsync ? "when admin-messages propagate" : "immediately";

                // eslint-disable-next-line jest/valid-title
                describe(scenarioName, () => {
                  beforeEach((done) => {
                    if (scenarioIsAsync) {
                      void messageBridgeFake.messagePropagation().then(done);
                    } else {
                      done();
                    }
                  });

                  it("messages administration channel to stop observing", () => {
                    expect(latestAdminMessage).toEqual({
                      channelId: "some-channel-id",
                      status: "became-unobserved",
                    });
                  });

                  it("no value gets listened in di-1 anymore", () => {
                    expect(latestValueMessage).toBeUndefined();
                  });

                  describe("when the observed value changes", () => {
                    beforeEach(async () => {
                      latestValueMessage = undefined;

                      runInAction(() => {
                        someObservable.set("some-new-value-2");
                      });
                    });

                    it("no value gets listened in di-1 anymore", () => {
                      expect(latestValueMessage).toBeUndefined();
                    });

                    describe("when observing the computed channel again", () => {
                      beforeEach(() => {
                        observedValue = undefined;

                        reaction(
                          () => computedTestChannel.get(),
                          (value) => {
                            observedValue = value;
                          },

                          {
                            fireImmediately: true,
                          },
                        );
                      });

                      scenarioIsAsync &&
                        it("computed test channel value is observed as the pending value again", () => {
                          expect(observedValue).toBe("some-pending-value");
                        });

                      const scenarioName = scenarioIsAsync ? "when admin messages propagate" : "immediately";

                      // eslint-disable-next-line jest/valid-title
                      describe(scenarioName, () => {
                        beforeEach((done) => {
                          if (scenarioIsAsync) {
                            latestAdminMessage = undefined;

                            void messageBridgeFake.messagePropagation().then(done);
                          } else {
                            done();
                          }
                        });

                        it("administration-message to start observing gets listened again", () => {
                          expect(latestAdminMessage).toEqual({
                            channelId: "some-channel-id",
                            status: "became-observed",
                          });
                        });

                        scenarioIsAsync &&
                          it("computed test channel value is still observed as the pending value", () => {
                            expect(observedValue).toBe("some-pending-value");
                          });

                        const scenarioTitle = scenarioIsAsync ? "when value-messages propagate back" : "immediately";

                        // eslint-disable-next-line jest/valid-title
                        describe(scenarioTitle, () => {
                          beforeEach((done) => {
                            if (scenarioIsAsync) {
                              latestValueMessage = undefined;

                              void messageBridgeFake.messagePropagation().then(done);
                            } else {
                              done();
                            }
                          });

                          it("the computed channel value changes", () => {
                            expect(observedValue).toBe("some-new-value-2");
                          });

                          it("the current value gets listened", () => {
                            expect(latestValueMessage).toBe("some-new-value-2");
                          });
                        });
                      });
                    });
                  });
                });
              });

              it("given observation of unrelated computed channel is stopped, observation of other computed channel still works", async () => {
                const someOtherObservable = observable.box<string>("");

                const channelObserver2Injectable = getInjectable({
                  id: "some-channel-observer-2",

                  instantiate: () => ({
                    channel: testChannel2,
                    observer: computed(() => someOtherObservable.get()),
                  }),

                  injectionToken: computedChannelObserverInjectionToken,
                });

                runInAction(() => {
                  di2.register(channelObserver2Injectable);
                });

                const computedChannel = di1.inject(computedChannelInjectionToken);

                computedTestChannel = computedChannel(testChannel2, "some-pending-value");

                reaction(
                  () => computedTestChannel.get(),
                  (value) => {
                    observedValue = value;
                  },

                  {
                    fireImmediately: true,
                  },
                );

                scenarioIsAsync && (await messageBridgeFake.messagePropagation());

                stopObserving();

                scenarioIsAsync && (await messageBridgeFake.messagePropagation());

                runInAction(() => {
                  someOtherObservable.set("some-value");
                });

                scenarioIsAsync && (await messageBridgeFake.messagePropagation());

                expect(observedValue).toBe("some-value");
              });

              describe("when observing the computed channel again", () => {
                beforeEach(() => {
                  latestAdminMessage = undefined;

                  reaction(
                    () => computedTestChannel.get(),
                    (value) => {
                      observedValue = value;
                    },

                    {
                      fireImmediately: true,
                    },
                  );
                });

                it("doesn't send second administration message", () => {
                  expect(latestAdminMessage).toBeUndefined();
                });

                it("when one of the observations stops, doesn't send administration message to stop observing", async () => {
                  latestAdminMessage = undefined;

                  stopObserving();

                  expect(latestAdminMessage).toBeUndefined();
                });
              });

              describe("when accessing the computed value outside of reactive context", () => {
                let nonReactiveValue: string;

                beforeEach(() => {
                  latestValueMessage = undefined;
                  latestAdminMessage = undefined;

                  nonReactiveValue = computedTestChannel.get();
                });

                it("the non reactive value is what ever happens to be the current value from di-2", () => {
                  expect(nonReactiveValue).toBe("some-initial-value");
                });

                const scenarioName = scenarioIsAsync ? "when messages would be propagated" : "immediately";

                // eslint-disable-next-line jest/valid-title
                describe(scenarioName, () => {
                  beforeEach((done) => {
                    if (scenarioIsAsync) {
                      void messageBridgeFake.messagePropagation().then(done);
                    } else {
                      done();
                    }
                  });

                  it("does not send new value message", () => {
                    expect(latestValueMessage).toBeUndefined();
                  });

                  it("does not send new admin message", () => {
                    expect(latestAdminMessage).toBeUndefined();
                  });
                });
              });
            });
          });
        });

        it("given duplicate channel observer for the channel is registered, when the computed channel is observer, throws", () => {
          const duplicateChannelObserverInjectable = getInjectable({
            id: "some-duplicate-channel-observer",

            instantiate: () => ({
              channel: testChannel,
              observer: computed(() => "irrelevant"),
            }),

            injectionToken: computedChannelObserverInjectionToken,
          });

          expect(() => {
            runWithThrownMobxReactions(() => {
              runInAction(() => {
                di2.register(duplicateChannelObserverInjectable);
              });
            });
          }).toThrow('Tried to register duplicate channel observer for channels "some-channel-id"');
        });
      });

      describe("given no channel observer but still a computed channel", () => {
        let computedTestChannel: IComputedValue<string>;

        beforeEach(() => {
          const computedChannel = di1.inject(computedChannelInjectionToken);

          computedTestChannel = computedChannel(testChannel, "some-pending-value");
        });

        it("when the computed channel is observed, observes as undefined", () => {
          let observedValue = "some-value-to-never-be-seen-in-unit-test";

          reaction(
            () => computedTestChannel.get(),

            (value) => {
              observedValue = value;
            },

            {
              fireImmediately: true,
            },
          );

          expect(observedValue).toBe("some-pending-value");
        });
      });
    });
  }),
);
