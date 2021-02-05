import type React from "react";
import { BaseRegistry } from "./base-registry";

export interface WorkspaceDetailComponents {
  Detail: React.ComponentType<any>;
}

export interface WorkspaceDetailRegistration {
  components: WorkspaceDetailComponents;
}

export class WorkspaceDetailRegistry extends BaseRegistry<WorkspaceDetailRegistration> {
}

export const workspaceDetailRegistry = new WorkspaceDetailRegistry();
