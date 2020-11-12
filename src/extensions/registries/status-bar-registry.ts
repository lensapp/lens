// Extensions API -> Status bar customizations

import React from "react";
import { BaseRegistry, BaseRegistryItem } from "./base-registry";

export interface StatusBarRegistration extends BaseRegistryItem {
  item?: React.ReactNode;
}

export class StatusBarRegistry extends BaseRegistry<StatusBarRegistration> {
}

export const statusBarRegistry = new StatusBarRegistry();
