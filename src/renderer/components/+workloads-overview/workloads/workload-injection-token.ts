/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";

export interface Workload {
  resourceName: string;
  open: () => void;
  amountOfItems: IComputedValue<number>;
  status: IComputedValue<Partial<Record<string, number>>>;
  title: string;
  orderNumber: number;
}

export const workloadInjectionToken = getInjectionToken<Workload>({
  id: "workload-injection-token",
});
