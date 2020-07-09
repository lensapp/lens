import { autobind } from "../../utils";
import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";

export interface EndpointPort {
  name?: string;
  protocol: string;
  port: number;
}

export interface EndpointAddress {
  hostname: string;
  ip: string;
  nodeName: string;
}

export interface EndpointSubset {
  addresses: EndpointAddress[];
  notReadyAddresses: EndpointAddress[];
  ports: EndpointPort[];
}

interface TargetRef {
  kind: string;
  namespace: string;
  name: string;
  uid: string;
  resourceVersion: string;
  apiVersion: string;
}

export class EndpointAddress implements EndpointAddress {
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

  constructor(data: EndpointAddress) {
    Object.assign(this, data);
  }

  getId(): string {
    return this.ip;
  }

  getName(): string {
    return this.hostname;
  }

  getTargetRef(): TargetRef {
    if (this.targetRef) {
      return Object.assign(this.targetRef, {apiVersion: "v1"});
    } else {
      return null;
    }
  }
}

export class EndpointSubset implements EndpointSubset {
  addresses: EndpointAddress[];
  notReadyAddresses: EndpointAddress[];
  ports: EndpointPort[];

  constructor(data: EndpointSubset) {
    Object.assign(this, data);
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
      return "";
    }
    return this.addresses.map(address => {
      if (!this.ports) {
        return address.ip;
      }
      return this.ports.map(port => {
        return `${address.ip}:${port.port}`;
      }).join(", ");
    }).join(", ");
  }
}

@autobind()
export class Endpoint extends KubeObject {
  static kind = "Endpoint"

  subsets: EndpointSubset[]

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

export const endpointApi = new KubeApi({
  kind: Endpoint.kind,
  apiBase: "/api/v1/endpoints",
  isNamespaced: true,
  objectConstructor: Endpoint,
});
