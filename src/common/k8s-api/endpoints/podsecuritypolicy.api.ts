/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { autoBind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

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

let pspApi: KubeApi<PodSecurityPolicy>;

if (isClusterPageContext()) {
  pspApi = new KubeApi({
    objectConstructor: PodSecurityPolicy,
  });
}

export {
  pspApi,
};
