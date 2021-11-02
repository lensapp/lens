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

import { KubeObject } from "../kube-object";
import { autoBind } from "../../utils";
import { KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export interface IPolicyIpBlock {
  cidr: string;
  except?: string[];
}

export interface IPolicySelector {
  matchLabels: {
    [label: string]: string;
  };
}

export interface IPolicyIngress {
  from: {
    ipBlock?: IPolicyIpBlock;
    namespaceSelector?: IPolicySelector;
    podSelector?: IPolicySelector;
  }[];
  ports: {
    protocol: string;
    port: number;
  }[];
}

export interface IPolicyEgress {
  to: {
    ipBlock: IPolicyIpBlock;
  }[];
  ports: {
    protocol: string;
    port: number;
  }[];
}

export interface NetworkPolicy {
  spec: {
    podSelector: {
      matchLabels: {
        [label: string]: string;
        role: string;
      };
    };
    policyTypes: string[];
    ingress: IPolicyIngress[];
    egress: IPolicyEgress[];
  };
}

export class NetworkPolicy extends KubeObject {
  static kind = "NetworkPolicy";
  static namespaced = true;
  static apiBase = "/apis/networking.k8s.io/v1/networkpolicies";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  getMatchLabels(): string[] {
    if (!this.spec.podSelector || !this.spec.podSelector.matchLabels) return [];

    return Object
      .entries(this.spec.podSelector.matchLabels)
      .map(data => data.join(":"));
  }

  getTypes(): string[] {
    if (!this.spec.policyTypes) return [];

    return this.spec.policyTypes;
  }
}

let networkPolicyApi: KubeApi<NetworkPolicy>;

if (isClusterPageContext()) {
  networkPolicyApi = new KubeApi<NetworkPolicy>({
    objectConstructor: NetworkPolicy,
  });
}

export {
  networkPolicyApi,
};
