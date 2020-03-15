export interface IClusterConfigMap {
  clusterName: string;
  clusterUrl: string;
}

export interface IClusterInfo extends IClusterConfigMap {
  kubeVersion?: string;
  pharosVersion?: string;
}
