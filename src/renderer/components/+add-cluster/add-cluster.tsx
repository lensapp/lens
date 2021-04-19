import "./add-cluster.scss";

import { KubeConfig } from "@kubernetes/client-node";
import { IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Switch } from "@material-ui/core";
import { KeyboardArrowDown, KeyboardArrowUp } from "@material-ui/icons";
import fse from "fs-extra";
import { debounce, every } from "lodash";
import { action, computed, observable } from "mobx";
import { observer } from "mobx-react";
import path from "path";
import React from "react";

import { catalogURL } from "../+catalog";
import { ClusterStore } from "../../../common/cluster-store";
import { appEventBus } from "../../../common/event-bus";
import { dumpConfigYaml, loadConfigFromString, splitConfig } from "../../../common/kube-helpers";
import { docsUrl } from "../../../common/vars";
import { navigate } from "../../navigation";
import { iter } from "../../utils";
import { AceEditor } from "../ace-editor";
import { Button } from "../button";
import { EditableList } from "../editable-list";
import { Input } from "../input";
import { PageLayout } from "../layout/page-layout";
import { Notifications } from "../notifications";

interface Option {
  config: KubeConfig;
  selected: boolean;
  error?: string;
}

function getContexts(config: KubeConfig): Map<string, Option> {
  return new Map(
    splitConfig(config)
      .map(({ config, error }) => [config.currentContext, {
        config,
        error,
        selected: false,
      }])
  );
}

@observer
export class AddCluster extends React.Component {
  @observable kubeContexts = observable.map<string, Option>();
  @observable customConfig = "";
  @observable proxyServer = "";
  @observable isWaiting = false;
  @observable showProxySettings = false;
  @observable showAccessibleNamespaces = false;
  @observable errorText: string;
  accessibleNamespaces = observable.set<string>();

  componentDidMount() {
    appEventBus.emit({ name: "cluster-add", action: "start" });
  }

  @computed get selectedContexts(): KubeConfig[] {
    return Array.from(this.kubeContexts.values())
      .filter(({ selected }) => selected)
      .map(({ config }) => config);
  }

  @computed get anySelected(): boolean {
    return this.selectedContexts.length > 0;
  }

  @computed get accessibleNamespacesList(): string[] {
    return Array.from(this.accessibleNamespaces);
  }

  @action
  refreshContexts = debounce(() => {
    const { config, error } = loadConfigFromString(this.customConfig.trim() || "{}");

    this.kubeContexts.replace(getContexts(config));
    this.errorText = error?.toString();

    if (this.kubeContexts.size === 1) {
      for (const option of this.kubeContexts.values()) {
        option.selected = true;
      }
    }
  }, 500);

  saveKubeConfigToDisk = async (context: KubeConfig): Promise<boolean> => {
    try {
      const absPath = ClusterStore.getCustomKubeConfigPath();

      await fse.ensureDir(path.dirname(absPath));
      await fse.writeFile(absPath, dumpConfigYaml(context), { encoding: "utf-8", mode: 0o600 });

      this.kubeContexts.get(context.currentContext).selected = false;

      return true;
    } catch (error) {
      this.kubeContexts.get(context.currentContext).error = error?.toString();

      return false;
    }
  };

  @action
  addClusters = async () => {
    if (!this.selectedContexts.length) {
      return this.errorText = "Please select at least one cluster context";
    }

    this.errorText = "";
    this.isWaiting = true;
    appEventBus.emit({ name: "cluster-add", action: "click" });

    const results = await Promise.all(iter.map(this.selectedContexts, this.saveKubeConfigToDisk));

    this.isWaiting = false;

    if (every(results)) {
      Notifications.ok(`Successfully added ${results.length} new cluster(s)`);

      return navigate(catalogURL());
    }

    Notifications.error(`Failed to add ${this.selectedContexts.length} cluster(s)`);
  };

  renderContextSelectionEntry = (option: Option) => {
    const context = option.config.currentContext;
    const id = `context-selection-${context}`;

    return (
      <ListItem key={context} id={`context-selection-list-item-${context}`} disabled={Boolean(option.error)} style={{ fontSize: "inherit" }}>
        <ListItemText
          id={id}
          primary={context}
          secondary={option.error}
          secondaryTypographyProps={{ color: "error", variant: "inherit" }}
          primaryTypographyProps={{ variant: "inherit" }}
        />
        <ListItemSecondaryAction>
          <Switch
            edge="end"
            disabled={Boolean(option.error)}
            onChange={(event, checked) => this.kubeContexts.get(context).selected = checked}
            inputProps={{ "aria-labelledby": id }}
            color="primary"
          />
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  toggleShowProxySettings = () => {
    this.showProxySettings = !this.showProxySettings;
  };

  toggleShowAccessibleNamespaces = () => {
    this.showAccessibleNamespaces = !this.showAccessibleNamespaces;
  };

  renderAccessibleNamespaces() {
    return (
      <>
        <h3>
          Accessible Namespaces
          <IconButton
            onClick={this.toggleShowAccessibleNamespaces}
            style={{ fontSize: "inherit" }}
            color="inherit"
          >
            {
              this.showAccessibleNamespaces
                ? <KeyboardArrowUp style={{ fontSize: "inherit" }} />
                : <KeyboardArrowDown style={{ fontSize: "inherit" }} />
            }
          </IconButton>
        </h3>
        {this.showAccessibleNamespaces && (
          <div>
            <p>This setting is useful for manually specifying which namespaces you have access to. This is useful when you do not have permissions to list namespaces.</p>
            <EditableList
              placeholder="Add new namespace ..."
              add={newNamespace => this.accessibleNamespaces.add(newNamespace)}
              remove={({ oldItem }) => this.accessibleNamespaces.delete(oldItem)}
              items={this.accessibleNamespacesList}
            />
            <small className="hint">
              These settings will be applied too all clusters being added.
            </small>
          </div>
        )}
      </>
    );
  }

  renderProxySettings() {
    return (
      <>
        <h3>
          Proxy settings
          <IconButton
            onClick={this.toggleShowProxySettings}
            style={{ fontSize: "inherit" }}
            color="inherit"
          >
            {
              this.showProxySettings
                ? <KeyboardArrowUp style={{ fontSize: "inherit" }} />
                : <KeyboardArrowDown style={{ fontSize: "inherit" }} />
            }
          </IconButton>
        </h3>
        {this.showProxySettings && (
          <div className="proxy-settings">
            <p>HTTP Proxy server. Used for communicating with Kubernetes API.</p>
            <Input
              autoFocus
              value={this.proxyServer}
              onChange={value => this.proxyServer = value}
              theme="round-black"
            />
            <small className="hint">
              {"A HTTP proxy server URL (format: http://<address>:<port>)."}
            </small>
          </div>
        )}
      </>
    );
  }

  render() {
    return (
      <PageLayout className="AddClusters" showOnTop={true}>
        <h2>Add Clusters from Kubeconfig</h2>
        <p>
          Clusters added here are <b>not</b> merged into the <code>~/.kube/config</code> file.
          Read more about adding clusters <a href={`${docsUrl}/clusters/adding-clusters/`} rel="noreferrer" target="_blank">here</a>.
        </p>
        <div className="flex column">
          <AceEditor
            autoFocus
            showGutter={false}
            mode="yaml"
            value={this.customConfig}
            onChange={value => {
              this.customConfig = value;
              this.errorText = "";
              this.refreshContexts();
            }}
          />
          <small className="hint">
            Pro-Tip: paste kubeconfig to get available contexts
          </small>
        </div>
        {this.errorText && <div className="error">{this.errorText}</div>}
        <div className="actions-panel">
          <Button
            primary
            disabled={!this.anySelected}
            label={this.selectedContexts.length === 1 ? "Add cluster" : "Add clusters"}
            onClick={this.addClusters}
            waiting={this.isWaiting}
            tooltip={this.anySelected || "Select at least one cluster to add."}
            tooltipOverrideDisabled
          />
        </div>
        <List style={{ fontSize: "inherit" }}>
          {Array.from(this.kubeContexts.values(), this.renderContextSelectionEntry)}
        </List>
        {this.renderProxySettings()}
        {this.renderAccessibleNamespaces()}
      </PageLayout>
    );
  }
}
