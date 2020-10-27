import React from "react";
import { observable, autorun } from "mobx";
import { observer, disposeOnUnmount } from "mobx-react";
import { Cluster } from "../../../../main/cluster";
import { Input } from "../../input";
import { SubTitle } from "../../layout/sub-title";

interface Props {
  cluster: Cluster;
}

@observer
export class ClusterHomeDirSetting extends React.Component<Props> {
  @observable directory = "";

  componentDidMount() {
    disposeOnUnmount(this,
      autorun(() => {
        this.directory = this.props.cluster.preferences.terminalCWD || "";
      })
    );
  }

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
        <small className="hint">
          An explicit start path where the terminal will be launched,{" "}
          this is used as the current working directory (cwd) for the shell process.
        </small>
      </>
    );
  }
}