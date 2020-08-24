import React from "react";
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

  save = () => {
    this.props.cluster.preferences.terminalCWD = this.directory;
  };

  onChange = (value: string) => {
    this.directory = value;
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
          onBlur={this.save}
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