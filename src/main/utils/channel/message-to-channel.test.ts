/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import getVisibleWindowsInjectable from "../../start-main-application/lens-window/get-visible-windows.injectable";
import clusterFramesInjectable from "../../../common/cluster-frames.injectable";
import type { MessageChannel } from "../../../common/utils/channel/message-channel-listener-injection-token";
import { sendMessageToChannelInjectionToken } from "../../../common/utils/channel/message-to-channel-injection-token";
import type { DiContainer } from "@ogre-tools/injectable";
import type { ClusterFrameInfo } from "../../../common/cluster-frames";

describe("message-to-channel", () => {
  let di: DiContainer;
  let sendToWindowMock: jest.Mock;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    sendToWindowMock = jest.fn();

    di.override(getVisibleWindowsInjectable, () => () => [
      {
        id: "some-window",
        send: sendToWindowMock,
        show: () => {},
        reload: () => {},
        isStarting: false,
        start: async () => {},
        close: () => {},
        isVisible: true,
      },

      {
        id: "some-other-window",
        send: sendToWindowMock,
        show: () => {},
        reload: () => {},
        isStarting: false,
        start: async () => {},
        close: () => {},
        isVisible: true,
      },
    ]);

    di.override(
      clusterFramesInjectable,
      () =>
        new Map<string, ClusterFrameInfo>([
          [
            "some-cluster-id",
            { frameId: 42, processId: 84 },
          ],
          [
            "some-other-cluster-id",
            { frameId: 126, processId: 168 },
          ],
        ]),
    );
  });

  describe("when sending message", () => {
    beforeEach(() => {
      const sendMessageToChannel = di.inject(
        sendMessageToChannelInjectionToken,
      );

      sendMessageToChannel(someChannel, 42);
    });

    it("sends to each window and cluster frames", () => {
      expect(sendToWindowMock.mock.calls).toEqual([
        [{ channel: "some-channel-id", data: 42 }],

        [
          {
            channel: "some-channel-id",
            data: 42,
            frameInfo: { frameId: 42, processId: 84 },
          },
        ],

        [
          {
            channel: "some-channel-id",
            data: 42,
            frameInfo: { frameId: 126, processId: 168 },
          },
        ],

        [{ channel: "some-channel-id", data: 42 }],

        [
          {
            channel: "some-channel-id",
            data: 42,
            frameInfo: { frameId: 42, processId: 84 },
          },
        ],

        [
          {
            channel: "some-channel-id",
            data: 42,
            frameInfo: { frameId: 126, processId: 168 },
          },
        ],
      ]);
    });
  });
});

const someChannel: MessageChannel<number> = {
  id: "some-channel-id",
};
