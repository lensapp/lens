/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import type { ClusterModalRegistration } from "../../extensions/registries";

export const clusterModalsInjectionToken = getInjectionToken<
  IComputedValue<ClusterModalRegistration[]>
>({ id: "cluster-modals-injection-token" });
