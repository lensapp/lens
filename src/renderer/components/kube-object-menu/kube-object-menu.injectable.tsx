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
import React from "react";

import {
  KubeObjectMenu,
  KubeObjectMenuDependencies,
  KubeObjectMenuProps,
} from "./kube-object-menu";

import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { lifecycleEnum, Injectable } from "@ogre-tools/injectable";
import apiManagerInjectable from "./dependencies/api-manager.injectable";
import clusterNameInjectable from "./dependencies/cluster-name.injectable";
import editResourceTabInjectable from "./dependencies/edit-resource-tab.injectable";
import hideDetailsInjectable from "./dependencies/hide-details.injectable";
import kubeObjectMenuItemsInjectable from "./dependencies/kube-object-menu-items/kube-object-menu-items.injectable";

const KubeObjectMenuInjectable: Injectable<
  JSX.Element,
  KubeObjectMenuDependencies<KubeObject>,
  KubeObjectMenuProps<KubeObject>
> = {
  getDependencies: (di, props) => ({
    clusterName: di.inject(clusterNameInjectable),
    apiManager: di.inject(apiManagerInjectable),
    editResourceTab: di.inject(editResourceTabInjectable),
    hideDetails: di.inject(hideDetailsInjectable),

    kubeObjectMenuItems: di.inject(kubeObjectMenuItemsInjectable, {
      kubeObject: props.object,
    }),
  }),

  instantiate: (dependencies, props) => (
    <KubeObjectMenu {...dependencies} {...props} />
  ),

  lifecycle: lifecycleEnum.transient,
};

export default KubeObjectMenuInjectable;
