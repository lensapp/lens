/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IComputedValue } from "mobx";

export interface TrayMenuRegistration {
  label?: string | IComputedValue<string>;
  click?: (menuItem: TrayMenuRegistration) => void;
  id?: string;
  type?: "normal" | "separator" | "submenu";
  toolTip?: string;
  enabled?: boolean | IComputedValue<boolean>;
  submenu?: TrayMenuRegistration[];
  visible?: IComputedValue<boolean>;
}
