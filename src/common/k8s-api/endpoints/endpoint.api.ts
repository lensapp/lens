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
import { get } from "lodash";
import { isClusterPageContext } from "../../utils/cluster-id-url-parsing";

export interface IEndpointPort {
  name?: string;
  protocol: string;
  port: number;
}

export interface IEndpointAddress {
  hostname: string;
  ip: string;
  nodeName: string;
}

export interface IEndpointSubset {
  addresses: IEndpointAddress[];
  notReadyAddresses: IEndpointAddress[];
  ports: IEndpointPort[];
}

interface ITargetRef {
  kind: string;
  namespace: string;
  name: string;
  uid: string;
  resourceVersion: string;
  apiVersion: string;
}

export class EndpointAddress implements IEndpointAddress {
  hostname: string;
  ip: string;
  nodeName: string;
  targetRef?: {
    kind: string;
    namespace: string;
    name: string;
    uid: string;
    resourceVersion: string;
  };

  static create(data: IEndpointAddress): EndpointAddress {
    return new EndpointAddress(data);
  }

  constructor(data: IEndpointAddress) {
    Object.assign(this, data);
  }

  getId() {
    return this.ip;
  }

  getName() {
    return this.hostname;
  }

  getTargetRef(): ITargetRef {
    if (this.targetRef) {
      return Object.assign(this.targetRef, { apiVersion: "v1" });
    } else {
      return null;
    }
  }
}

export class EndpointSubset implements IEndpointSubset {
  addresses: IEndpointAddress[];
  notReadyAddresses: IEndpointAddress[];
  ports: IEndpointPort[];

  constructor(data: IEndpointSubset) {
    this.addresses = get(data, "addresses", []);
    this.notReadyAddresses = get(data, "notReadyAddresses", []);
    this.ports = get(data, "ports", []);
  }

  getAddresses(): EndpointAddress[] {
    return this.addresses.map(EndpointAddress.create);
  }

  getNotReadyAddresses(): EndpointAddress[] {
    return this.notReadyAddresses.map(EndpointAddress.create);
  }

  toString(): string {
    return this.addresses
      .map(address => (
        this.ports
          .map(port => `${address.ip}:${port.port}`)
          .join(", ")
      ))
      .join(", ");
  }
}

export interface Endpoint {
  subsets: IEndpointSubset[];
}

export class Endpoint extends KubeObject {
  static kind = "Endpoints";
  static namespaced = true;
  static apiBase = "/api/v1/endpoints";

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  getEndpointSubsets(): EndpointSubset[] {
    const subsets = this.subsets || [];

    return subsets.map(s => new EndpointSubset(s));
  }

  toString(): string {
    if(this.subsets) {
      return this.getEndpointSubsets().map(es => es.toString()).join(", ");
    } else {
      return "<none>";
    }
  }

}

let endpointApi: KubeApi<Endpoint>;

if (isClusterPageContext()) {
  endpointApi = new KubeApi<Endpoint>({
    objectConstructor: Endpoint,
  });
}

export {
  endpointApi,
};
