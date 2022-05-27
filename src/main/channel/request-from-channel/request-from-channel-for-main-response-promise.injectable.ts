/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";

const requestFromChannelForMainResponsePromiseInjectable = getInjectable({
  id: "request-from-channel-for-main-response-promise",

  instantiate: (di, channelId: string) => {
    void channelId;

    let resolve: (response: boolean) => void;

    const promise = new Promise<boolean>(_resolve => {
      resolve = _resolve;
    });

    return ({
      promise,

      resolve: (response: boolean) => {
        resolve(response);
      },
    });
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, channelId: string) => channelId,
  }),
});

export default requestFromChannelForMainResponsePromiseInjectable;
