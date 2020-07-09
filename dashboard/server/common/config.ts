import { BaseClusterInfo } from "../common/cluster";
export interface CommonConfig extends Partial<BaseClusterInfo> {
  lensVersion?: string;
  lensTheme?: string;
  username?: string;
  token?: string;
  allowedNamespaces?: string[];
  allowedResources?: string[];
  isClusterAdmin?: boolean;
  chartsEnabled: boolean;
  kubectlAccess?: boolean;  // User accessed via kubectl-lens plugin
}
