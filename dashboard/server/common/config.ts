import { IClusterInfo } from "../common/cluster";
export interface IConfig extends Partial<IClusterInfo> {
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
