
// Extensions-api -> Cluster frame custom modal registration

import { getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";

export interface ClusterModalRegistration {
  id: string;
  Component: React.ComponentType;
  visible?: IComputedValue<boolean>;
}

export const clusterModalsInjectionToken = getInjectionToken<
  IComputedValue<ClusterModalRegistration[]>
>({ id: "cluster-modals-injection-token" });