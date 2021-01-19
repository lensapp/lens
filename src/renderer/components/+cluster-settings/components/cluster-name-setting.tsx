import React from "react";
import { Cluster } from "../../../../main/cluster";
import { Input } from "../../input";
import { observable, autorun } from "mobx";
import { observer, disposeOnUnmount } from "mobx-react";
import { SubTitle } from "../../layout/sub-title";
import { isRequired } from "../../input/input_validators";

interface Props {
  cluster: Cluster;
}

@observer
export class ClusterNameSetting extends React.Component<Props> {
  @observable name = "";

  componentDidMount() {
    disposeOnUnmount(this,
      autorun(() => {
        this.name = this.props.cluster.preferences.clusterName;
      })
    );
  }

  save = () => {
    this.props.cluster.preferences.clusterName = this.name;
  };

  onChange = (value: string) => {
    this.name = value;
  };

  render() {
    return (
      <>
        <SubTitle title="Cluster Name" />
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