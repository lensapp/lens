import React from "react";
import { observable, autorun } from "mobx";
import { observer, disposeOnUnmount } from "mobx-react";
import { Cluster } from "../../../../main/cluster";
import { Input, InputValidators } from "../../input";
import { SubTitle } from "../../layout/sub-title";

interface Props {
  cluster: Cluster;
}

@observer
export class ClusterProxySetting extends React.Component<Props> {
  @observable proxy = "";

  componentDidMount() {
    disposeOnUnmount(this,
      autorun(() => {
        this.proxy = this.props.cluster.preferences.httpsProxy || "";
      })
    );
  }

  save = () => {
    this.props.cluster.preferences.httpsProxy = this.proxy;
  };

  onChange = (value: string) => {
    this.proxy = value;
  };

  render() {
    return (
      <>
        <SubTitle title="HTTP Proxy" />
        <Input
          theme="round-black"
          value={this.proxy}
          onChange={this.onChange}
          onBlur={this.save}
          placeholder="http://<address>:<port>"
          validators={this.proxy ? InputValidators.isUrl : undefined}
        />
        <small className="hint">
          HTTP Proxy server. Used for communicating with Kubernetes API.
        </small>
      </>
    );
  }
}
