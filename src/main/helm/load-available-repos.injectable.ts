/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { orderBy } from "lodash";
import type { Options } from "request-promise-native";
import type { HelmRepo } from "./helm-repo-manager";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../common/utils";
import customRequestPromiseInjectable from "../../common/request-promise.injectable.ts";

interface Dependencies {
  customRequestPromise: (opts: Options) => Promise<any>;
}

async function loadAvailableHelmRepos({ customRequestPromise }: Dependencies): Promise<HelmRepo[]> {
  const res = await customRequestPromise({
    uri: "https://github.com/lensapp/artifact-hub-repositories/releases/download/latest/repositories.json",
    json: true,
    resolveWithFullResponse: true,
    timeout: 10000,
  });

  return orderBy<HelmRepo>(res.body, repo => repo.name);
}

const loadAvailableHelmReposInjectable = getInjectable({
  instantiate: (di) => bind(loadAvailableHelmRepos, null, {
    customRequestPromise: di.inject(customRequestPromiseInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default loadAvailableHelmReposInjectable;

