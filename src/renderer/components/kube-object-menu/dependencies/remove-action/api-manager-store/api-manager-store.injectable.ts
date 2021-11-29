/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import type { Injectable } from "@ogre-tools/injectable";
import { lifecycleEnum } from "@ogre-tools/injectable";
import apiManagerInjectable from "./api-manager.injectable";
import type { ApiManager } from "../../../../../../common/k8s-api/api-manager";
import type { KubeObject } from "../../../../../../common/k8s-api/kube-object";
import type { KubeObjectStore } from "../../../../../../common/k8s-api/kube-object.store";

interface Dependencies {
  apiManager: ApiManager;
}

interface InstantiationParameter {
  kubeObject: KubeObject | null;
}

const apiManagerStoreInjectable: Injectable<
  KubeObjectStore<KubeObject> | null,
  Dependencies,
  InstantiationParameter
> = {
  getDependencies: di => ({
    apiManager: di.inject(apiManagerInjectable),
  }),

  instantiate: ({ apiManager }, { kubeObject }) =>
    kubeObject ? apiManager.getStore(kubeObject.selfLink) : null,

  lifecycle: lifecycleEnum.transient,
};

export default apiManagerStoreInjectable;
