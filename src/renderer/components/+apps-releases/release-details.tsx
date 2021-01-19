import "./release-details.scss";

import React, { Component } from "react";
import groupBy from "lodash/groupBy";
import isEqual from "lodash/isEqual";
import { observable, reaction } from "mobx";
import { Link } from "react-router-dom";
import kebabCase from "lodash/kebabCase";
import { HelmRelease, helmReleasesApi, IReleaseDetails } from "../../api/endpoints/helm-releases.api";
import { HelmReleaseMenu } from "./release-menu";
import { Drawer, DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { cssNames, stopPropagation } from "../../utils";
import { disposeOnUnmount, observer } from "mobx-react";
import { Spinner } from "../spinner";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { AceEditor } from "../ace-editor";
import { Button } from "../button";
import { releaseStore } from "./release.store";
import { Notifications } from "../notifications";
import { createUpgradeChartTab } from "../dock/upgrade-chart.store";
import { themeStore } from "../../theme.store";
import { apiManager } from "../../api/api-manager";
import { SubTitle } from "../layout/sub-title";
import { secretsStore } from "../+config-secrets/secrets.store";
import { Secret } from "../../api/endpoints";
import { getDetailsUrl } from "../kube-object";

interface Props {
  release: HelmRelease;
  hideDetails(): void;
}

@observer
export class ReleaseDetails extends Component<Props> {
  @observable details: IReleaseDetails;
  @observable values = "";
  @observable saving = false;
  @observable releaseSecret: Secret;

  @disposeOnUnmount
  releaseSelector = reaction(() => this.props.release, release => {
    if (!release) return;
    this.loadDetails();
    this.loadValues();
    this.releaseSecret = null;
  }
  );

  @disposeOnUnmount
  secretWatcher = reaction(() => secretsStore.items.toJS(), () => {
    if (!this.props.release) return;
    const { getReleaseSecret } = releaseStore;
    const { release } = this.props;
    const secret = getReleaseSecret(release);

    if (this.releaseSecret) {
      if (isEqual(this.releaseSecret.getLabels(), secret.getLabels())) return;
      this.loadDetails();
    }
    this.releaseSecret = secret;
  });

  async loadDetails() {
    const { release } = this.props;

    this.details = null;
    this.details = await helmReleasesApi.get(release.getName(), release.getNs());
  }

  async loadValues() {
    const { release } = this.props;

    this.values = "";
    this.values = await helmReleasesApi.getValues(release.getName(), release.getNs());
  }

  updateValues = async () => {
    const { release } = this.props;
    const name = release.getName();
    const namespace = release.getNs();
    const data = {
      chart: release.getChart(),
      repo: await release.getRepo(),
      version: release.getVersion(),
      values: this.values
    };

    this.saving = true;

    try {
      await releaseStore.update(name, namespace, data);
      Notifications.ok(
        <p>Release <b>{name}</b> successfully updated!</p>
      );
    } catch (err) {
      Notifications.error(err);
    }
    this.saving = false;
  };

  upgradeVersion = () => {
    const { release, hideDetails } = this.props;

    createUpgradeChartTab(release);
    hideDetails();
  };

  renderValues() {
    const { values, saving } = this;

    return (
      <div className="values">
        <DrawerTitle title={`Values`}/>
        <div className="flex column gaps">
          <AceEditor
            mode="yaml"
            value={values}
            onChange={values => this.values = values}
          />
          <Button
            primary
            label={`Save`}
            waiting={saving}
            onClick={this.updateValues}
          />
        </div>
      </div>
    );
  }

  renderNotes() {
    if (!this.details.info?.notes) return null;
    const { notes } = this.details.info;

    return (
      <div className="notes">
        {notes}
      </div>
    );
  }

  renderResources() {
    const { resources } = this.details;

    if (!resources) return null;
    const groups = groupBy(resources, item => item.kind);
    const tables = Object.entries(groups).map(([kind, items]) => {
      return (
        <React.Fragment key={kind}>
          <SubTitle title={kind}/>
          <Table scrollable={false}>
            <TableHead sticky={false}>
              <TableCell className="name">Name</TableCell>
              {items[0].getNs() && <TableCell className="namespace">Namespace</TableCell>}
              <TableCell className="age">Age</TableCell>
            </TableHead>
            {items.map(item => {
              const name = item.getName();
              const namespace = item.getNs();
              const api = apiManager.getApi(item.metadata.selfLink);
              const detailsUrl = api ? getDetailsUrl(api.getUrl({ name, namespace })) : "";

              return (
                <TableRow key={item.getId()}>
                  <TableCell className="name">
                    {detailsUrl ? <Link to={detailsUrl}>{name}</Link> : name}
                  </TableCell>
                  {namespace && <TableCell className="namespace">{namespace}</TableCell>}
                  <TableCell className="age">{item.getAge()}</TableCell>
                </TableRow>
              );
            })}
          </Table>
        </React.Fragment>
      );
    });

    return (
      <div className="resources">
        {tables}
      </div>
    );
  }

  renderContent() {
    const { release } = this.props;
    const { details } = this;

    if (!release) return null;

    if (!details) {
      return <Spinner center/>;
    }

    return (
      <div>
        <DrawerItem name="Chart" className="chart">
          <div className="flex gaps align-center">
            <span>{release.getChart()}</span>
            <Button
              primary
              label={`Upgrade`}
              className="box right upgrade"
              onClick={this.upgradeVersion}
            />
          </div>
        </DrawerItem>
        <DrawerItem name="Updated">
          {release.getUpdated()} ago ({release.updated})
        </DrawerItem>
        <DrawerItem name="Namespace">
          {release.getNs()}
        </DrawerItem>
        <DrawerItem name="Version" onClick={stopPropagation}>
          <div className="version flex gaps align-center">
            <span>
              {release.getVersion()}
            </span>
          </div>
        </DrawerItem>
        <DrawerItem name="Status" className="status" labelsOnly>
          <Badge
            label={release.getStatus()}
            className={cssNames("status", kebabCase(release.getStatus()))}
          />
        </DrawerItem>
        {this.renderValues()}
        <DrawerTitle title={`Notes`}/>
        {this.renderNotes()}
        <DrawerTitle title={`Resources`}/>
        {this.renderResources()}
      </div>
    );
  }

  render() {
    const { release, hideDetails } = this.props;
    const title = release ? <>Release: {release.getName()}</> : "";
    const toolbar = <HelmReleaseMenu release={release} toolbar hideDetails={hideDetails}/>;

    return (
      <Drawer
        className={cssNames("ReleaseDetails", themeStore.activeTheme.type)}
        usePortal={true}
        open={!!release}
        title={title}
        onClose={hideDetails}
        toolbar={toolbar}
      >
        {this.renderContent()}
      </Drawer>
    );
  }
}
