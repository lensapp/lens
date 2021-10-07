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

export interface ForwardedPort {
  clusterId?: string;
  kind: string;
  namespace: string;
  name: string;
  port: number;
  forwardPort: number;
}
  
export class PortForwardItem implements ItemObject {
  clusterId: string;
  kind: string;
  namespace: string;
  name: string;
  port: number;
  forwardPort: number;
  
  constructor(pf: ForwardedPort) {
    this.clusterId = pf.clusterId;
    this.kind = pf.kind;
    this.namespace = pf.namespace;
    this.name = pf.name;
    this.port = pf.port;
    this.forwardPort = pf.forwardPort;

    autoBind(this);
  }
  
  getName() {
    return this.name;
  }
  
  getNs() {
    return this.namespace;
  }
   
  get id() {
    return this.forwardPort;
  }
   
  getId() {
    return String(this.forwardPort);
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
  
  getSearchFields() {
    return [
      this.name,
      this.id,
      this.kind,
      this.port,
      this.forwardPort,
    ];
  }
}
