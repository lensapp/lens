import React from "react";
import { Cluster } from "../../../../main/cluster";
import { FilePicker, OverSizeLimitStyle } from "../../file-picker";
import { autobind } from "../../../utils";
import { Button } from "../../button";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { SubTitle } from "../../layout/sub-title";
import { ClusterIcon } from "../../cluster-icon";

enum GeneralInputStatus {
  CLEAN = "clean",
  ERROR = "error",
}

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
        cluster.preferences.icon = `data:${file.type};base64,${buf.toString("base64")}`;
      } else {
        // this has to be done as a seperate branch (and not always) because `cluster`
        // is observable and triggers an update loop.
        cluster.preferences.icon = undefined;
      }
    } catch (e) {
      this.errorText = e.toString();
      this.status = GeneralInputStatus.ERROR;
    }
  }

  getClearButton() {
    if (this.props.cluster.preferences.icon) {
      return <Button tooltip="Revert back to default icon" accent onClick={() => this.onIconPick([])}>Clear</Button>;
    }
  }

  render() {
    const label = (
      <>
        <ClusterIcon
          cluster={this.props.cluster}
          showErrors={false}
          showTooltip={false}
        />
        {"Browse for new icon..."}
      </>
    );
    return (
      <>
        <SubTitle title="Cluster Icon" />
        <p>Define cluster icon. By default automatically generated.</p>
        <div className="file-loader">
          <FilePicker
            accept="image/*"
            label={label}
            onOverSizeLimit={OverSizeLimitStyle.FILTER}
            handler={this.onIconPick}
          />
          {this.getClearButton()}
        </div>
      </>
    );
  }
}
