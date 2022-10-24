/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Extensions-api -> Cluster frame custom modal registration

import type { IComputedValue } from "mobx";

export interface ClusterModalRegistration {
  id: string;
  Component: React.ComponentType;
  visible: IComputedValue<boolean>;
}
