import { registerFeature } from "@k8slens/feature-core";
import { createContainer, DiContainer } from "@ogre-tools/injectable";
import { messagingFeatureForMain } from "../feature";
import { getMessageChannel, sendMessageToChannelInjectionToken } from "@k8slens/messaging";
import getWebContentsInjectable from "./get-web-contents.injectable";
import type { WebContents } from "electron";
import allowCommunicationListenerInjectable from "./allow-communication-listener.injectable";

const someChannel = getMessageChannel<string>("some-channel");

describe("send-message-to-channel", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = createContainer("irrelevant");

    registerFeature(di, messagingFeatureForMain);
  });

  it("given no web contents, when sending a message, does not do anything", () => {
    di.override(getWebContentsInjectable, () => () => []);

    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    expect(() => sendMessageToChannel(someChannel, "some-message")).not.toThrow();
  });

  describe("given web content that is alive", () => {
    let sendToFrameMock: jest.Mock;
    let sendMessageMock: jest.Mock;

    beforeEach(() => {
      sendToFrameMock = jest.fn();
      sendMessageMock = jest.fn();

      di.override(getWebContentsInjectable, () => () => [
        {
          send: (...args: any[]) => sendMessageMock("first", ...args),
          sendToFrame: (...args: any[]) => sendToFrameMock("first", ...args),
          isDestroyed: () => false,
          isCrashed: () => false,
        } as unknown as WebContents,
        {
          send: (...args: any[]) => sendMessageMock("second", ...args),
          sendToFrame: (...args: any[]) => sendToFrameMock("second", ...args),
          isDestroyed: () => false,
          isCrashed: () => false,
        } as unknown as WebContents,
      ]);
    });

    it("when sending message, sends the message to webcontents", () => {
      const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

      sendMessageToChannel(someChannel, "some-message");

      expect(sendMessageMock.mock.calls).toEqual([
        ["first", "some-channel", "some-message"],
        ["second", "some-channel", "some-message"],
      ]);
    });

    describe("when multiple renderers inform that they are ready to listen messages", () => {
      beforeEach(() => {
        const allowCommunicationListener = di.inject(allowCommunicationListenerInjectable);

        allowCommunicationListener.handler(undefined, { frameId: 42, processId: 126 });
        allowCommunicationListener.handler(undefined, { frameId: 84, processId: 168 });
      });

      describe("when sending a message", () => {
        beforeEach(() => {
          const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

          sendMessageToChannel(someChannel, "some-message");
        });

        it("sends the message to webcontents", () => {
          expect(sendMessageMock.mock.calls).toEqual([
            ["first", "some-channel", "some-message"],
            ["second", "some-channel", "some-message"],
          ]);
        });

        it("sends the message to individual frames in webcontents", () => {
          expect(sendToFrameMock.mock.calls).toEqual([
            ["first", [126, 42], "some-channel", "some-message"],
            ["first", [168, 84], "some-channel", "some-message"],

            ["second", [126, 42], "some-channel", "some-message"],
            ["second", [168, 84], "some-channel", "some-message"],
          ]);
        });
      });
    });
  });

  it("given non alive web contents, when sending a message, does not send messages", () => {
    const sendToWebContentsMock = jest.fn();

    di.override(getWebContentsInjectable, () => () => [
      {
        send: sendToWebContentsMock,
        isDestroyed: () => true,
        isCrashed: () => false,
      } as unknown as WebContents,

      {
        send: sendToWebContentsMock,
        isDestroyed: () => false,
        isCrashed: () => true,
      } as unknown as WebContents,
    ]);

    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    sendMessageToChannel(someChannel, "irrelevant");

    expect(sendToWebContentsMock).not.toHaveBeenCalled();
  });
});
