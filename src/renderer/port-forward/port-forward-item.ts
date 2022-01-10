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


import type { ItemObject } from "../../common/item.store";
import { autoBind } from "../../common/utils";

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
