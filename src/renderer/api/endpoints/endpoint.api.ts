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
    apiVersion: string;
    name: string;
    uid: string;
    resourceVersion: string;
  };

  constructor(data: IEndpointAddress) {
    this.hostname = data.hostname;
    this.ip = data.ip;
    this.nodeName = data.nodeName;
  }

  getId() {
    return this.ip;
  }

  getName() {
    return this.hostname;
  }

  getTargetRef(): ITargetRef | null {
    if (this.targetRef) {
      this.targetRef.apiVersion = "v1";

      return this.targetRef;
    }

    return null;
  }
}

export class EndpointSubset implements IEndpointSubset {
  addresses: IEndpointAddress[];
  notReadyAddresses: IEndpointAddress[];
  ports: IEndpointPort[];

  constructor(data: IEndpointSubset) {
    this.addresses = data.addresses;
    this.notReadyAddresses = data.notReadyAddresses;
    this.ports = data.ports;
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
export class Endpoint extends KubeObject<void, void> {
  static kind = "Endpoints";
  static namespaced = true;
  static apiBase = "/api/v1/endpoints";

  subsets?: IEndpointSubset[];

  getEndpointSubsets(): EndpointSubset[] {
    return (this.subsets ?? []).map(s => new EndpointSubset(s));
  }

  toString(): string {
    if (this.subsets) {
      return this.getEndpointSubsets().map(String).join(", ");
    }

    return "<none>";
  }
}

export const endpointApi = new KubeApi({
  objectConstructor: Endpoint,
});
