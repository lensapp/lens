import React from "react";
import { Cluster } from "../../../../main/cluster";
import { Input } from "../../input";
import { Spinner } from "../../spinner";
import { clusterStore } from "../../../../common/cluster-store"
import { Icon } from "../../icon";
import { Tooltip, TooltipPosition } from "../../tooltip";
import { autobind } from "../../../utils";
import { TextInputStatus } from "./statuses"
import { observable } from "mobx";
import { observer } from "mobx-react";

interface Props {
    cluster: Cluster;
}

@observer
export class ClusterHomeDirSetting extends React.Component<Props> {
  @observable directory = this.props.cluster.preferences.terminalCWD || "";
  @observable status = TextInputStatus.CLEAN;
  @observable errorText?: string;

  render() {
    return <>
      <h4>Working Directory</h4>
      <p>Set initial working directory for terminals. When set it will the `pwd` when a new terminal instance is opened for this cluster.</p>
      <Input
        theme="round-black"
        className="box grow"
        value={this.directory}
        onSubmit={this.onWorkingDirectorySubmit}
        onChange={this.onWorkingDirectoryChange}
        iconRight={this.getIconRight()}
        placeholder="$HOME"
      />
    </>;
  }

  @autobind()
  onWorkingDirectoryChange(directory: string, _e: React.ChangeEvent) {
    if (this.status === TextInputStatus.UPDATING) {
      console.log("prevent changing cluster directory while updating");
      return;
    }
    
    this.status = this.dirDiffers(directory);
    this.directory = directory;
  }
  
  dirDiffers(directory: string): TextInputStatus {
    const { terminalCWD = "" } = this.props.cluster.preferences;

    return directory === terminalCWD ? TextInputStatus.CLEAN : TextInputStatus.DIRTY;
  }
  
  getIconRight(): React.ReactNode {
    switch (this.status) {
    case TextInputStatus.CLEAN:
      return null;
    case TextInputStatus.DIRTY:
      return <Icon size="16px" material="fiber_manual_record"/>;
    case TextInputStatus.UPDATED:
      return <Icon size="16px" className="updated" material="done"/>;
    case TextInputStatus.UPDATING:
      return <Spinner />;
    case TextInputStatus.ERROR:
      return <Icon id="cluster-directory-setting-error-icon" size="16px" material="error">
        <Tooltip targetId="cluster-directory-setting-error-icon" position={TooltipPosition.TOP}>
          {this.errorText}
        </Tooltip>
      </Icon>
    }
  }

  @autobind()
  onWorkingDirectorySubmit(directory: string) {
    if (this.dirDiffers(directory) !== TextInputStatus.DIRTY) {
      return;
    }

    this.status = TextInputStatus.UPDATING
    this.props.cluster.preferences.terminalCWD = directory;
    this.directory = directory;
    this.status = TextInputStatus.UPDATED
  }
}