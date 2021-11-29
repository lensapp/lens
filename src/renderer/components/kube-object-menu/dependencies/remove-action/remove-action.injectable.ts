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
import apiManagerStoreInjectable from "./api-manager-store/api-manager-store.injectable";
import type { InstantiationParameter } from "./remove-action";
import type { Dependencies } from "./remove-action";
import { removeAction } from "./remove-action";
import hideDetailsInjectable from "../hide-details.injectable";

const removeActionInjectable: Injectable<
  ReturnType<typeof removeAction>,
  Dependencies,
  InstantiationParameter
> = {
  getDependencies: (di, { kubeObject }) => ({
    apiManagerStore: di.inject(apiManagerStoreInjectable, { kubeObject }),
    hideDetails: di.inject(hideDetailsInjectable),
  }),

  instantiate: removeAction,
  lifecycle: lifecycleEnum.transient,
};

export default removeActionInjectable;
