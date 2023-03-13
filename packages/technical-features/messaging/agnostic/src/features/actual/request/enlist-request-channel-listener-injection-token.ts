import { getInjectionToken } from "@ogre-tools/injectable";

import type {
  RequestChannel,
  RequestChannelListener,
} from "./request-channel-listener-injection-token";

export type EnlistRequestChannelListener = (
  listener: RequestChannelListener<RequestChannel<unknown, unknown>>
) => () => void;

export const enlistRequestChannelListenerInjectionToken =
  getInjectionToken<EnlistRequestChannelListener>({
    id: "listening-to-a-request-channel",
  });
