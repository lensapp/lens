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
export class ClusterNameSetting extends React.Component<Props> {
  @observable name = this.props.cluster.preferences.clusterName || "";
  @observable status = TextInputStatus.CLEAN;
  @observable errorText?: string;

  render() {
    return <>
      <h4>Cluster Name</h4>
      <p>Change cluster name:</p>
      <Input
        theme="round-black"
        className="box grow"
        value={this.name}
        onSubmit={this.onClusterNameSubmit}
        onChange={this.onClusterNameChange}
        iconRight={this.getIconRight()}
      />
    </>;
  }

  @autobind()
  onClusterNameChange(name: string, _e: React.ChangeEvent) {
    if (this.status === TextInputStatus.UPDATING) {
      console.log("prevent changing cluster name while updating");
      return;
    }
    
    this.status = this.nameDiffers(name)
    this.name = name;
  }
  
  nameDiffers(name: string): TextInputStatus {
    const { clusterName } = this.props.cluster.preferences;

    return name === clusterName ? TextInputStatus.CLEAN : TextInputStatus.DIRTY;
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
      return <Spinner/>;
    case TextInputStatus.ERROR:
      return <Icon id="cluster-name-setting-error-icon" size="16px" material="error">
        <Tooltip targetId="cluster-name-setting-error-icon" position={TooltipPosition.TOP}>
          {this.errorText}
        </Tooltip>
      </Icon>
    }
  }

  @autobind()
  onClusterNameSubmit(name: string) {
    if (this.nameDiffers(name) !== TextInputStatus.DIRTY) {
      return;
    }

    this.status = TextInputStatus.UPDATING 
    this.props.cluster.preferences.clusterName = name;
    this.name = name;
    this.status = TextInputStatus.UPDATED
  }
}