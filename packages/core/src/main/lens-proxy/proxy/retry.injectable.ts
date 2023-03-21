/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

export interface ProxyRetry {
  clearCount: (id: string) => void;
  getCount: (id: string) => number;
  incrementCount: (id: string) => void;
  isClosed: () => boolean;
  close: () => void;
}

const proxyRetryInjectable = getInjectable({
  id: "proxy-retry",
  instantiate: (): ProxyRetry => {
    const counters = new Map<string, number>();
    let closed = false;

    return {
      clearCount: (id: string) => {
        counters.delete(id);
      },
      getCount: (id: string) => counters.get(id) ?? 0,
      incrementCount: (id: string) => {
        counters.set(id, (counters.get(id) ?? 0) + 1);
      },
      isClosed: () => closed,
      close: () => {
        closed = true;
      },
    };
  },
});

export default proxyRetryInjectable;
