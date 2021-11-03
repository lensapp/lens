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

import React from "react";
import { observable, autorun, makeObservable } from "mobx";
import { observer, disposeOnUnmount } from "mobx-react";
import type { Cluster } from "../../../../main/cluster";
import { Input } from "../../input";
import { SubTitle } from "../../layout/sub-title";

interface Props {
  cluster: Cluster;
}

@observer
export class ClusterHomeDirSetting extends React.Component<Props> {
  @observable directory = "";
  @observable defaultNamespace = "";

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  async componentDidMount() {
    const kubeconfig = await this.props.cluster.getKubeconfig();

    const defaultNamespace = this.props.cluster.preferences?.defaultNamespace || kubeconfig.getContextObject(this.props.cluster.contextName).namespace;

    disposeOnUnmount(this,
      autorun(() => {
        this.directory = this.props.cluster.preferences.terminalCWD || "";
        this.defaultNamespace = defaultNamespace || "";
      }),
    );
  }

  saveCWD = () => {
    this.props.cluster.preferences.terminalCWD = this.directory;
  };

  onChangeTerminalCWD = (value: string) => {
    this.directory = value;
  };

  saveDefaultNamespace = () => {
    if (this.defaultNamespace) {
      this.props.cluster.preferences.defaultNamespace = this.defaultNamespace;
    } else {
      this.props.cluster.preferences.defaultNamespace = undefined;
    }
  };

  onChangeDefaultNamespace = (value: string) => {
    this.defaultNamespace = value;
  };

  render() {
    return (
      <>
        <section>
          <SubTitle title="Working Directory"/>
          <Input
            theme="round-black"
            value={this.directory}
            onChange={this.onChangeTerminalCWD}
            onBlur={this.saveCWD}
            placeholder="$HOME"
          />
          <small className="hint">
            An explicit start path where the terminal will be launched,{" "}
            this is used as the current working directory (cwd) for the shell process.
          </small>
        </section>
        <section>
          <SubTitle title="Default Namespace"/>
          <Input
            theme="round-black"
            value={this.defaultNamespace}
            onChange={this.onChangeDefaultNamespace}
            onBlur={this.saveDefaultNamespace}
            placeholder={this.defaultNamespace}
          />
          <small className="hint">
            Default namespace used for kubectl.
          </small>
        </section>
      </>
    );
  }
}
