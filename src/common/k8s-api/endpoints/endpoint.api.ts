/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { autoBind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi, SpecificApiOptions } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";
import { get } from "lodash";

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

export class EndpointApi extends KubeApi<Endpoint> {
  constructor(args: SpecificApiOptions<Endpoint> = {}) {
    super({
      ...args,
      objectConstructor: Endpoint,
    });
  }
}
