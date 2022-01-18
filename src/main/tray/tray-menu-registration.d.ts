/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export interface TrayMenuRegistration {
  label?: string;
  click?: (menuItem: TrayMenuRegistration) => void;
  id?: string;
  type?: "normal" | "separator" | "submenu"
  toolTip?: string;
  enabled?: boolean;
  submenu?: TrayMenuRegistration[]
}
