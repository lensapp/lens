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
import { stat } from "fs/promises";
import { Notifications } from "../../notifications";
import { resolveTilde } from "../../../utils";
import { Icon } from "../../icon";
import { PathPicker } from "../../path-picker";

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

  saveCWD = async () => {
    if (!this.directory) {
      this.props.cluster.preferences.terminalCWD = undefined;

      return;
    }

    try {
      const dir = resolveTilde(this.directory);
      const stats = await stat(dir);

      if (stats.isDirectory()) {
        this.props.cluster.preferences.terminalCWD = dir;
      } else {
        Notifications.error(
          <>
            <b>Shell Working Directory</b>
            <p>Provided path is not a directory, your changes were not saved.</p>
          </>,
        );
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        Notifications.error(
          <>
            <b>Shell Working Directory</b>
            <p>Provided path does not exist, your changes were not saved.</p>
          </>,
        );
      } else {
        Notifications.error(
          <>
            <b>Shell Working Directory</b>
            <p>Your changes were not saved due to the error bellow</p>
            <p>{String(error)}</p>
          </>,
        );
      }
    }
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

  openFilePicker = () => {
    PathPicker.pick({
      label: "Choose Working Directory",
      buttonLabel: "Pick",
      properties: ["openDirectory", "showHiddenFiles"],
      onPick: ([directory]) => {
        this.props.cluster.preferences.terminalCWD = directory;
      },
    });
  };

  onClearCWD = () => {
    this.props.cluster.preferences.terminalCWD = undefined;
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
            iconRight={
              <>
                {
                  this.directory && (
                    <Icon
                      material="close"
                      title="Clear"
                      onClick={this.onClearCWD}
                    />
                  )
                }
                <Icon
                  material="folder"
                  title="Pick from filesystem"
                  onClick={this.openFilePicker}
                />
              </>
            }
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
