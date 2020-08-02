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
export class ClusterProxySetting extends React.Component<Props> {
  @observable proxy = this.props.cluster.preferences.httpsProxy || "";
  @observable status = TextInputStatus.CLEAN;
  @observable errorText?: string;

  render() {
    return <>
      <h4>HTTPS Proxy</h4>
      <p>HTTPS Proxy server. Used for communicating with Kubernetes API.</p>
      <Input
        theme="round-black"
        className="box grow"
        value={this.proxy}
        onSubmit={this.updateClusterProxy}
        onChange={this.changeProxyState}
        iconRight={this.getIconRight()}
        placeholder="https://<address>:<port>"
      />
    </>;
  }

  @autobind()
  changeProxyState(proxy: string, _e: React.ChangeEvent) {
    if (this.status === TextInputStatus.UPDATING) {
      console.log("prevent changing cluster proxy while updating");
      return;
    }
    
    this.status = this.proxyDiffers(proxy);
    this.proxy = proxy;
  }
  
  proxyDiffers(proxy: string): TextInputStatus {
    const { httpsProxy = "" } = this.props.cluster.preferences;

    return proxy === httpsProxy ? TextInputStatus.CLEAN : TextInputStatus.DIRTY;
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
      return <Icon id="cluster-proxy-setting-error-icon" size="16px" material="error">
        <Tooltip targetId="cluster-proxy-setting-error-icon" position={TooltipPosition.TOP}>
          {this.errorText}
        </Tooltip>
      </Icon>
    }
  }

  @autobind()
  updateClusterProxy(proxy: string) {
    if (this.proxyDiffers(proxy) !== TextInputStatus.DIRTY) {
      return;
    }

    try {
      const url = new URL(proxy);
      
      if (url.protocol !== "https") {
        this.status = TextInputStatus.ERROR
        this.errorText= `Proxy's protocol should be "https"`
        return
      }
      if (url.port === "") {
        this.status = TextInputStatus.ERROR
        this.errorText= "Proxy should include a port"
        return
      }
    } catch (e) {
      this.status = TextInputStatus.ERROR
      this.errorText= "Invalid URL"
      return
    }

    this.status = TextInputStatus.UPDATING
    this.props.cluster.preferences.httpsProxy = proxy;
    this.proxy = proxy;
    this.status = TextInputStatus.UPDATED
  }
}