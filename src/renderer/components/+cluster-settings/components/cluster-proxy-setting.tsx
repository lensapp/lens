import React from "react";
import throttle from "lodash/throttle";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Cluster } from "../../../../main/cluster";
import { Input } from "../../input";
import { isUrl } from "../../input/input.validators";
import { SubTitle } from "../../layout/sub-title";

interface Props {
  cluster: Cluster;
}

@observer
export class ClusterProxySetting extends React.Component<Props> {
  @observable proxy = this.props.cluster.preferences.httpsProxy || "";

  save = throttle((value: string) => {
    this.props.cluster.preferences.httpsProxy = value;
  }, 500);

  onChange = (value: string) => {
    this.proxy = value;
    this.save(value);
  }

  render() {
    return (
      <>
        <SubTitle title="HTTP Proxy"/>
        <p>HTTP Proxy server. Used for communicating with Kubernetes API.</p>
        <Input
          theme="round-black"
          value={this.proxy}
          onChange={this.onChange}
          placeholder="http://<address>:<port>"
          validators={isUrl}
        />
      </>
    );
  }
}