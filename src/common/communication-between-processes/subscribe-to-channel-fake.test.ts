/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { getDisForUnitTesting } from "../../test-utils/get-dis-for-unit-testing";
import {
  SubscribeToChannel,
  subscribeToChannelInjectionToken,
} from "./subscribe-to-channel-injection-token";
import { PublishToChannel, publishToChannelInjectionToken } from "./publish-to-channel-injection-token";
import { createChannel } from "../ipc-channel/create-channel/create-channel";
import type { Channel } from "../ipc-channel/channel";

describe("subscribe-to-channel-fake, given IPC bridge", () => {
  let mainDi: DiContainer;
  let rendererDi: DiContainer;

  beforeEach(() => {
    const dis = getDisForUnitTesting();

    mainDi = dis.mainDi;
    rendererDi = dis.rendererDi;
  });

  [
    { scenario: "given in renderer", getDiForPublish: () => mainDi, getDiForSubscribe: () => rendererDi },
    { scenario: "given in main", getDiForPublish: () => rendererDi, getDiForSubscribe: () => mainDi },
  ].forEach(({ scenario, getDiForPublish, getDiForSubscribe }) => {
    describe(scenario, () => {
      let publishToChannel: PublishToChannel;
      let subscribeToChannel: SubscribeToChannel;
      let channel: Channel<string>;
      let diForPublish: DiContainer;
      let diForSubscribe: DiContainer;

      beforeEach(() => {
        diForPublish = getDiForPublish();
        diForSubscribe = getDiForSubscribe();

        publishToChannel = diForPublish.inject(publishToChannelInjectionToken);
        subscribeToChannel = diForSubscribe.inject(subscribeToChannelInjectionToken);

        channel = createChannel("some-channel");
      });

      it("given no subscribers, when publishing message to channel, throws", () => {
        expect(() => {
          publishToChannel(channel, "some-message");
        }).toThrow('Tried to publish message "some-message" to channel "some-channel" when there is no subscribers.');
      });

      describe("when subscribing", () => {
        let subscriberMock: jest.Mock<(message: string) => void>;

        beforeEach(() => {
          subscriberMock = jest.fn();

          subscribeToChannel(channel, subscriberMock);
        });

        it("does not call subscribers yet", () => {
          expect(subscriberMock).not.toHaveBeenCalled();
        });

        describe("when publishing to channel", () => {
          beforeEach(() => {
            publishToChannel(channel, "some-message");
          });

          it("notifies the subscribers", () => {
            expect(subscriberMock).toHaveBeenCalledWith("some-message");
          });

          it("when published again, notifies again", () => {
            subscriberMock.mockClear();

            publishToChannel(channel, "some-other-message");

            expect(subscriberMock).toHaveBeenCalledWith("some-other-message");
          });
        });
      });

      it("given multiple subscribers, when publishing, notifies all subscribers", () => {
        const subscriberMock = jest.fn();

        subscribeToChannel(channel, subscriberMock);
        subscribeToChannel(channel, subscriberMock);

        publishToChannel(channel, "some-message");

        expect(subscriberMock).toHaveBeenCalledTimes(2);
      });
    });
  });
});
