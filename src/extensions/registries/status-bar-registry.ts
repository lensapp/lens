// Extensions API -> Status bar customizations

import React from "react";
import { BaseRegistry } from "./base-registry";

export interface StatusBarRegistration {
  icon?: React.ReactNode;
}

export class StatusBarRegistry extends BaseRegistry<StatusBarRegistration> {
}

export const statusBarRegistry = new StatusBarRegistry();
