/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IComputedValue } from "mobx";

export interface AppPreferenceTabRegistration {
  title: string;
  id: string;
  orderNumber?: number;
  visible?: IComputedValue<boolean>;
}
