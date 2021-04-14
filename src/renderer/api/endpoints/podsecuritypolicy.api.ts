import { autobind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";

interface PodSecurityPolicySpec {
  allowPrivilegeEscalation?: boolean;
  allowedCSIDrivers?: {
    name: string;
  }[];
  allowedCapabilities: string[];
  allowedFlexVolumes?: {
    driver: string;
  }[];
  allowedHostPaths?: {
    pathPrefix: string;
    readOnly: boolean;
  }[];
  allowedProcMountTypes?: string[];
  allowedUnsafeSysctls?: string[];
  defaultAddCapabilities?: string[];
  defaultAllowPrivilegeEscalation?: boolean;
  forbiddenSysctls?: string[];
  fsGroup?: {
    rule: string;
    ranges: {
      max: number;
      min: number;
    }[];
  };
  hostIPC?: boolean;
  hostNetwork?: boolean;
  hostPID?: boolean;
  hostPorts?: {
    max: number;
    min: number;
  }[];
  privileged?: boolean;
  readOnlyRootFilesystem?: boolean;
  requiredDropCapabilities?: string[];
  runAsGroup?: {
    ranges: {
      max: number;
      min: number;
    }[];
    rule: string;
  };
  runAsUser?: {
    rule: string;
    ranges: {
      max: number;
      min: number;
    }[];
  };
  runtimeClass?: {
    allowedRuntimeClassNames: string[];
    defaultRuntimeClassName: string;
  };
  seLinux?: {
    rule: string;
    seLinuxOptions: {
      level: string;
      role: string;
      type: string;
      user: string;
    };
  };
  supplementalGroups?: {
    rule: string;
    ranges: {
      max: number;
      min: number;
    }[];
  };
  volumes?: string[];
}

@autobind()
export class PodSecurityPolicy extends KubeObject<PodSecurityPolicySpec> {
  static kind = "PodSecurityPolicy";
  static namespaced = false;
  static apiBase = "/apis/policy/v1beta1/podsecuritypolicies";

  isPrivileged() {
    return this.spec?.privileged ?? false;
  }

  getVolumes() {
    return this.spec?.volumes ?? [];
  }

  getRules() {
    const { fsGroup, runAsGroup, runAsUser, supplementalGroups, seLinux } = this.spec ?? {};

    return {
      fsGroup: fsGroup?.rule ?? "",
      runAsGroup: runAsGroup?.rule ?? "",
      runAsUser: runAsUser?.rule ?? "",
      supplementalGroups: supplementalGroups?.rule ?? "",
      seLinux: seLinux?.rule ?? "",
    };
  }
}

export const pspApi = new KubeApi({
  objectConstructor: PodSecurityPolicy,
});
