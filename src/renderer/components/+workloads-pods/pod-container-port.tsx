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

import "./pod-container-port.scss";

import React from "react";
import { observer } from "mobx-react";
import type { Pod } from "../../api/endpoints";
import { apiBase } from "../../api";
import { observable, makeObservable } from "mobx";
import { cssNames } from "../../utils";
import { Notifications } from "../notifications";
import { Spinner } from "../spinner";

interface Props {
  pod: Pod;
  port: {
    name?: string;
    containerPort: number;
    protocol: string;
  }
}

@observer
export class PodContainerPort extends React.Component<Props> {
  @observable waiting = false;

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  async portForward() {
    const { pod, port } = this.props;

    this.waiting = true;

    try {
      await apiBase.post(`/pods/${pod.getNs()}/pod/${pod.getName()}/port-forward/${port.containerPort}`, {});
    } catch(error) {
      Notifications.error(error);
    } finally {
      this.waiting = false;
    }
  }

  render() {
    const { port } = this.props;
    const { name, containerPort, protocol } = port;
    const text = `${name ? `${name}: ` : ""}${containerPort}/${protocol}`;

    return (
      <div className={cssNames("PodContainerPort", { waiting: this.waiting })}>
        <span title="Open in a browser" onClick={() => this.portForward() }>
          {text}
          {this.waiting && (
            <Spinner />
          )}
        </span>
      </div>
    );
  }
}
