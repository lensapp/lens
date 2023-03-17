import { registerFeature } from "@k8slens/feature-core";
import { createContainer, DiContainer } from "@ogre-tools/injectable";
import { messagingFeatureForMain } from "../feature";
import { getMessageChannel, sendMessageToChannelInjectionToken } from "@k8slens/messaging";
import getWebContentsInjectable from "./get-web-contents.injectable";
import type { WebContents } from "electron";

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

  it("given multiple web contents, when sending a message, sends message to all web contents", () => {
    const sendToWebContentsMock = jest.fn();

    di.override(getWebContentsInjectable, () => () => [
      {
        send: (...args: any[]) => sendToWebContentsMock("some-web-content", ...args),
        isDestroyed: () => false,
        isCrashed: () => false,
      } as unknown as WebContents,

      {
        send: (...args: any[]) => sendToWebContentsMock("some-other-web-content", ...args),
        isDestroyed: () => false,
        isCrashed: () => false,
      } as unknown as WebContents,
    ]);

    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    sendMessageToChannel(someChannel, "some-message");

    expect(sendToWebContentsMock.mock.calls).toEqual([
      ["some-web-content", "some-channel", "some-message"],
      ["some-other-web-content", "some-channel", "some-message"],
    ]);
  });

  it("given non alive web content, when sending a message, sends message to all web contents being alive", () => {
    const sendToWebContentsMock = jest.fn();

    di.override(getWebContentsInjectable, () => () => [
      {
        send: (...args: any[]) => sendToWebContentsMock("some-alive-content", ...args),
        isDestroyed: () => false,
        isCrashed: () => false,
      } as unknown as WebContents,

      {
        send: (...args: any[]) => sendToWebContentsMock("destroyed-web-content", ...args),
        isDestroyed: () => true,
        isCrashed: () => false,
      } as unknown as WebContents,

      {
        send: (...args: any[]) => sendToWebContentsMock("crashed-web-content", ...args),
        isDestroyed: () => false,
        isCrashed: () => true,
      } as unknown as WebContents,
    ]);

    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    sendMessageToChannel(someChannel, "some-message");

    expect(sendToWebContentsMock.mock.calls).toEqual([
      ["some-alive-content", "some-channel", "some-message"],
    ]);
  });
});
