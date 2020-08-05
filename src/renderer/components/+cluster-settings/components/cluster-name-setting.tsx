import React from "react";
import { Cluster } from "../../../../main/cluster";
import { Input } from "../../input";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { SubTitle } from "../../layout/sub-title";
import { isRequired } from "../../input/input.validators";
import throttle from "lodash/throttle";

interface Props {
  cluster: Cluster;
}

@observer
export class ClusterNameSetting extends React.Component<Props> {
  @observable name = this.props.cluster.preferences.clusterName || "";

  save = throttle((value: string) => {
    if (!value) return;
    this.props.cluster.preferences.clusterName = value;
  }, 500);

  onChange = (value: string) => {
    this.name = value;
    this.save(value);
  }

  render() {
    return (
      <>
        <SubTitle title="Cluster Name"/>
        <p>Define cluster name.</p>
        <Input
          theme="round-black"
          validators={isRequired}
          value={this.name}
          onChange={this.onChange}
        />
      </>
    );
  }
}