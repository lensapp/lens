import React from "react";
import { Cluster } from "../../../../main/cluster";
import { Input } from "../../input";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { SubTitle } from "../../layout/sub-title";
import { isRequired } from "../../input/input.validators";

interface Props {
  cluster: Cluster;
}

@observer
export class ClusterNameSetting extends React.Component<Props> {
  @observable name = this.props.cluster.preferences.clusterName || "";

  save = () => {
    this.props.cluster.preferences.clusterName = this.name;
  };

  onChange = (value: string) => {
    this.name = value;
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
          onBlur={this.save}
        />
      </>
    );
  }
}