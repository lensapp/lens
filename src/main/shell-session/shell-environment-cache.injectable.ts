/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { asyncComputed } from "@ogre-tools/injectable-react";
import { when } from "mobx";
import { now } from "mobx-utils";
import type { ClusterId } from "../../common/cluster-types";
import { getOrInsert } from "../../common/utils";

export type ShellEnvironmentCache = (clusterId: string, builder: () => Promise<Partial<Record<string, string>>>) => Promise<Partial<Record<string, string>>>;

const shellEnvironmentCacheInjectable = getInjectable({
  id: "shell-environment-cache",
  instantiate: (): ShellEnvironmentCache => {
    const cache = new Map<ClusterId, IAsyncComputed<Partial<Record<string, string>>>>();

    return async (clusterId, builder) => {
      const cacheLine = getOrInsert(cache, clusterId, asyncComputed(() => {
        now(1000 * 60 * 10); // update every 10 minutes

        return builder();
      }));

      await when(() => !cacheLine.pending.get());

      return cacheLine.value.get();
    };
  },
});

export default shellEnvironmentCacheInjectable;
