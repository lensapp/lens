/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IComputedValue } from "mobx";

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
interface WorkloadsOverviewDetailComponents {
  Details: React.ComponentType<{}>;
}

export interface WorkloadsOverviewDetailRegistration {
  components: WorkloadsOverviewDetailComponents;
  priority?: number;
  visible?: IComputedValue<boolean>;
}
