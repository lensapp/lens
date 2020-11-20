import { autobind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";

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

  constructor(data: IEndpointAddress) {
    Object.assign(this, data)
  }

  getId() {
    return this.ip
  }

  getName() {
    return this.hostname
  }

  getTargetRef(): ITargetRef {
    if (this.targetRef) {
      return Object.assign(this.targetRef, {apiVersion: "v1"})
    } else {
      return null
    }
  }
}

export class EndpointSubset implements IEndpointSubset {
  addresses: IEndpointAddress[];
  notReadyAddresses: IEndpointAddress[];
  ports: IEndpointPort[];

  constructor(data: IEndpointSubset) {
    Object.assign(this, data)
  }

  getAddresses(): EndpointAddress[] {
    const addresses = this.addresses || [];
    return addresses.map(a => new EndpointAddress(a));
  }

  getNotReadyAddresses(): EndpointAddress[] {
    const notReadyAddresses = this.notReadyAddresses || [];
    return notReadyAddresses.map(a => new EndpointAddress(a));
  }

  toString(): string {
    if(!this.addresses) {
      return ""
    }
    return this.addresses.map(address => {
      if (!this.ports) {
        return address.ip
      }
      return this.ports.map(port => {
        return `${address.ip}:${port.port}`
      }).join(", ")
    }).join(", ")
  }
}

@autobind()
export class Endpoint extends KubeObject {
  static kind = "Endpoints"
  static namespaced = true
  static apiBase = "/api/v1/endpoints"

  subsets: IEndpointSubset[]

  getEndpointSubsets(): EndpointSubset[] {
    const subsets = this.subsets || [];
    return subsets.map(s => new EndpointSubset(s));
  }

  toString(): string {
    if(this.subsets) {
      return this.getEndpointSubsets().map(es => es.toString()).join(", ")
    } else {
      return "<none>"
    }
  }

}

export const endpointApi = new KubeApi({
  objectConstructor: Endpoint,
});
