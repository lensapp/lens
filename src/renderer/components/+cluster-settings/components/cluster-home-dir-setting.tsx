import React from "react";
import throttle from "lodash/throttle";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Cluster } from "../../../../main/cluster";
import { Input } from "../../input";
import { SubTitle } from "../../layout/sub-title";

interface Props {
  cluster: Cluster;
}

@observer
export class ClusterHomeDirSetting extends React.Component<Props> {
  @observable directory = this.props.cluster.preferences.terminalCWD || "";

  save = throttle((value: string) => {
    this.props.cluster.preferences.terminalCWD = value;
  }, 500);

  onChange = (value: string) => {
    this.directory = value;
    this.save(value);
  }

  render() {
    return (
      <>
        <SubTitle title="Working Directory"/>
        <p>Terminal working directory.</p>
        <Input
          theme="round-black"
          value={this.directory}
          onChange={this.onChange}
          placeholder="$HOME"
        />
        <span className="hint">
          An explicit start path where the terminal will be launched,{" "}
          this is used as the current working directory (cwd) for the shell process.
        </span>
      </>
    );
  }
}