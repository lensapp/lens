
// Extensions-api -> Cluster frame custom modal registration

import type { IComputedValue } from "mobx";

export interface ClusterModalRegistration {
  id: string;
  component: React.ComponentType;
  visible?: IComputedValue<boolean>;
}