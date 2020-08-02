import React from "react";
import { Cluster } from "../../../../main/cluster";
import { clusterStore } from "../../../../common/cluster-store"
import { Icon } from "../../icon";
import { FilePicker, OverSizeLimitStyle } from "../../file-picker";
import { autobind } from "../../../utils";
import { Button } from "../../button";
import { GeneralInputStatus } from "./statuses"
import { observable } from "mobx";
import { observer } from "mobx-react";

interface Props {
    cluster: Cluster;
}

@observer
export class ClusterIconSetting extends React.Component<Props> {
  @observable status = GeneralInputStatus.CLEAN;
  @observable errorText?: string;

  @autobind()
  async onIconPick([file]: File[]) {
    const { cluster } = this.props;
    
    try {
      if (file) {
        const buf = Buffer.from(await file.arrayBuffer());
        cluster.preferences.icon = `data:image/jpeg;base64, ${buf.toString('base64')}`;
      } else {
        // this has to be done as a seperate branch (and not always) because `cluster`
        // is observable and triggers an update loop.
        cluster.preferences.icon = undefined;
      }
    } catch (e) {
      this.errorText = e.toString()
      this.status = GeneralInputStatus.ERROR
    }
  }

  getClearButton() {
    const { cluster } = this.props;

    if (cluster.preferences.icon) {
      return <Button accent onClick={() => this.onIconPick([])}>Clear</Button>
    }
  }

  render() {
    return <>
      <h4>Cluster Icon</h4>
      <p>Set cluster icon. By default it is automatically generated. {this.getIconRight()}</p>
      <div className="center">
        <FilePicker 
          accept="image/*" 
          labelText="Browse for new icon..." 
          onOverSizeLimit={OverSizeLimitStyle.FILTER} 
          handler={this.onIconPick}
        />
        {this.getClearButton()}
      </div>
    </>;
  }
  
  getIconRight(): React.ReactNode {
    switch (this.status) {
    case GeneralInputStatus.CLEAN:
      return null;
    case GeneralInputStatus.ERROR:
      return <Icon size="16px" material="error" title={this.errorText}></Icon>
    }
  }
}