/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


import autoBind from "auto-bind";
import type { ItemObject } from "@k8slens/list-layout";

export type ForwardedPortStatus = "Active" | "Disabled";
export interface ForwardedPort {
  kind: string;
  namespace: string;
  name: string;
  port: number;
  forwardPort: number;
  protocol?: string;
  status?: ForwardedPortStatus;
}

export class PortForwardItem implements ItemObject {
  kind: string;
  namespace: string;
  name: string;
  port: number;
  forwardPort: number;
  protocol: string;
  status: ForwardedPortStatus;

  constructor(pf: ForwardedPort) {
    this.kind = pf.kind;
    this.namespace = pf.namespace;
    this.name = pf.name;
    this.port = pf.port;
    this.forwardPort = pf.forwardPort;
    this.protocol = pf.protocol ?? "http";
    this.status = pf.status ?? "Active";

    autoBind(this);
  }

  getName() {
    return this.name;
  }

  getNs() {
    return this.namespace;
  }

  getId() {
    return `${this.namespace}-${this.kind}-${this.name}:${this.port}`;
  }

  getKind() {
    return this.kind;
  }

  getPort() {
    return this.port;
  }

  getForwardPort() {
    return this.forwardPort;
  }

  getProtocol() {
    return this.protocol;
  }

  getStatus() {
    return this.status;
  }

  getSearchFields() {
    return [
      this.name,
      this.namespace,
      this.kind,
      this.port,
      this.forwardPort,
      this.status,
    ];
  }
}
