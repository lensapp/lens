/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { autoBind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi, SpecificApiOptions } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";

export interface PodSecurityPolicy {
  spec: {
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
      ranges: { max: number; min: number }[];
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
      ranges: { max: number; min: number }[];
      rule: string;
    };
    runAsUser?: {
      rule: string;
      ranges: { max: number; min: number }[];
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
      ranges: { max: number; min: number }[];
    };
    volumes?: string[];
  };
}

export class PodSecurityPolicy extends KubeObject {
  static kind = "PodSecurityPolicy";
  static namespaced = false;
  static apiBase = "/apis/policy/v1beta1/podsecuritypolicies";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  isPrivileged() {
    return !!this.spec.privileged;
  }

  getVolumes() {
    return this.spec.volumes || [];
  }

  getRules() {
    const { fsGroup, runAsGroup, runAsUser, supplementalGroups, seLinux } = this.spec;

    return {
      fsGroup: fsGroup ? fsGroup.rule : "",
      runAsGroup: runAsGroup ? runAsGroup.rule : "",
      runAsUser: runAsUser ? runAsUser.rule : "",
      supplementalGroups: supplementalGroups ? supplementalGroups.rule : "",
      seLinux: seLinux ? seLinux.rule : "",
    };
  }
}

export class PodSecurityPolicyApi extends KubeApi<PodSecurityPolicy> {
  constructor(args: SpecificApiOptions<PodSecurityPolicy> = {}) {
    super({
      ...args,
      objectConstructor: PodSecurityPolicy,
    });
  }
}
