import "./cluster-settings.scss";

import React from "react";
import { observable, reaction } from "mobx";
import { RouteComponentProps } from "react-router";
import { observer, disposeOnUnmount } from "mobx-react";
import { Cluster } from "../../../main/cluster";
import { IClusterSettingsRouteParams } from "./cluster-settings.route";
import { clusterStore } from "../../../common/cluster-store";
import { PageLayout } from "../layout/page-layout";
import { requestMain } from "../../../common/ipc";
import { clusterActivateHandler, clusterRefreshHandler } from "../../../common/cluster-ipc";
import { navigation } from "../../navigation";
import { Tabs, Tab } from "../tabs";
import { ClusterProxySetting } from "./components/cluster-proxy-setting";
import { ClusterNameSetting } from "./components/cluster-name-setting";
import { ClusterHomeDirSetting } from "./components/cluster-home-dir-setting";
import { ClusterAccessibleNamespaces } from "./components/cluster-accessible-namespaces";
import { ClusterMetricsSetting } from "./components/cluster-metrics-setting";
import { ShowMetricsSetting } from "./components/show-metrics";
import { ClusterPrometheusSetting } from "./components/cluster-prometheus-setting";
import { ClusterKubeconfig } from "./components/cluster-kubeconfig";

interface Props extends RouteComponentProps<IClusterSettingsRouteParams> {
}


const clusterPages = ["General", "Proxy", "Terminal", "Namespaces", "Metrics"];

@observer
export class ClusterSettings extends React.Component<Props> {
  @observable activeTab = "General";

  get clusterId() {
    return this.props.match.params.clusterId;
  }

  get cluster(): Cluster {
    return clusterStore.getById(this.clusterId);
  }

  componentDidMount() {
    const { hash } = navigation.location;

    document.getElementById(hash.slice(1))?.scrollIntoView();

    disposeOnUnmount(this, [
      reaction(() => this.cluster, this.refreshCluster, {
        fireImmediately: true,
      }),
      reaction(() => this.clusterId, clusterId => clusterStore.setActive(clusterId), {
        fireImmediately: true,
      })
    ]);
  }

  refreshCluster = async () => {
    if (this.cluster) {
      await requestMain(clusterActivateHandler, this.cluster.id);
      await requestMain(clusterRefreshHandler, this.cluster.id);
    }
  };

  onTabChange = (tabId: string) => {
    this.activeTab = tabId;
  };

  renderNavigation() {
    return (
      <>
        <h2>{this.cluster.name}</h2>
        <Tabs className="flex column" scrollable={false} onChange={this.onTabChange} value={this.activeTab}>
          <div className="header">Cluster Settings</div>
          { clusterPages.map((page) => {
            return <Tab key={page} value={page} label={page} data-testid={`${page}-tab`} />;
          })}
        </Tabs>
      </>
    );
  }

  render() {
    const cluster = this.cluster;

    if (!cluster) return null;
    const header = (
      <>
        <h2>{cluster.preferences.clusterName}</h2>
      </>
    );

    return (
      <PageLayout
        className="ClusterSettings"
        navigation={this.renderNavigation()}
        showOnTop={true}
        contentGaps={false}
      >
        {this.activeTab == "General" && (
          <section>
            <h2 data-testid="general-header">General</h2>
            <section>
              <section>
                <ClusterNameSetting cluster={cluster} />
              </section>
              <section>
                <ClusterKubeconfig cluster={cluster} />
              </section>
            </section>
          </section>
        )}

        {this.activeTab == "Proxy" && (
          <section>
            <h2 data-testid="proxy-header">Proxy</h2>
            <section>
              <ClusterProxySetting cluster={cluster} />
            </section>
          </section>
        )}

        {this.activeTab == "Terminal" && (
          <section>
            <h2 data-testid="terminal-header">Terminal</h2>
            <section>
              <ClusterHomeDirSetting cluster={cluster} />
            </section>
          </section>
        )}

        {this.activeTab == "Namespaces" && (
          <section>
            <h2 data-testid="namespaces-header">Namespaces</h2>
            <section>
              <ClusterAccessibleNamespaces cluster={cluster} />
            </section>
          </section>
        )}

        {this.activeTab == "Metrics" && (
          <section>
            <h2 data-testid="metrics-header">Metrics</h2>
            <section>
              <section>
                <ClusterPrometheusSetting cluster={cluster} />
              </section>
              <section>
                <ClusterMetricsSetting cluster={cluster}/>
              </section>
              <section>
                <ShowMetricsSetting cluster={cluster}/>
              </section>
            </section>
          </section>
        )}

      </PageLayout>
    );
  }
}
