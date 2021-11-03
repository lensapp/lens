/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./release-details.scss";

import React, { Component } from "react";
import groupBy from "lodash/groupBy";
import isEqual from "lodash/isEqual";
import { observable, reaction, makeObservable } from "mobx";
import { Link } from "react-router-dom";
import kebabCase from "lodash/kebabCase";
import { getRelease, getReleaseValues, HelmRelease, IReleaseDetails } from "../../../common/k8s-api/endpoints/helm-releases.api";
import { HelmReleaseMenu } from "./release-menu";
import { Drawer, DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { cssNames, stopPropagation } from "../../utils";
import { disposeOnUnmount, observer } from "mobx-react";
import { Spinner } from "../spinner";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { Button } from "../button";
import { releaseStore } from "./release.store";
import { Notifications } from "../notifications";
import { createUpgradeChartTab } from "../dock/upgrade-chart.store";
import { ThemeStore } from "../../theme.store";
import { apiManager } from "../../../common/k8s-api/api-manager";
import { SubTitle } from "../layout/sub-title";
import { secretsStore } from "../+config-secrets/secrets.store";
import { Secret } from "../../../common/k8s-api/endpoints";
import { getDetailsUrl } from "../kube-detail-params";
import { Checkbox } from "../checkbox";
import MonacoEditor from "react-monaco-editor";
import { UserStore } from "../../../common/user-store";

interface Props {
  release: HelmRelease;
  hideDetails(): void;
}

@observer
export class ReleaseDetails extends Component<Props> {
  @observable details: IReleaseDetails | null = null;
  @observable values = "";
  @observable valuesLoading = false;
  @observable showOnlyUserSuppliedValues = true;
  @observable saving = false;
  @observable releaseSecret: Secret;
  @observable error?: string = undefined;

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.release, release => {
        if (!release) return;
        this.loadDetails();
        this.loadValues();
        this.releaseSecret = null;
      }),
      reaction(() => secretsStore.getItems(), () => {
        if (!this.props.release) return;
        const { getReleaseSecret } = releaseStore;
        const { release } = this.props;
        const secret = getReleaseSecret(release);

        if (this.releaseSecret) {
          if (isEqual(this.releaseSecret.getLabels(), secret.getLabels())) return;
          this.loadDetails();
        }
        this.releaseSecret = secret;
      }),
      reaction(() => this.showOnlyUserSuppliedValues, () => {
        this.loadValues();
      }),
    ]);
  }

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  async loadDetails() {
    const { release } = this.props;
    
    try {
      this.details = null;
      this.details = await getRelease(release.getName(), release.getNs());
    } catch (error) {
      this.error = `Failed to get release details: ${error}`;
    }
  }

  async loadValues() {
    const { release } = this.props;

    try {
      this.valuesLoading = true;
      this.values = (await getReleaseValues(release.getName(), release.getNs(), !this.showOnlyUserSuppliedValues)) ?? "";
    } catch (error) {
      Notifications.error(`Failed to load values for ${release.getName()}: ${error}`);
      this.values = "";
    } finally {
      this.valuesLoading = false;
    }
  }

  updateValues = async () => {
    const { release } = this.props;
    const name = release.getName();
    const namespace = release.getNs();
    const data = {
      chart: release.getChart(),
      repo: await release.getRepo(),
      version: release.getVersion(),
      values: this.values,
    };

    this.saving = true;

    try {
      await releaseStore.update(name, namespace, data);
      Notifications.ok(
        <p>Release <b>{name}</b> successfully updated!</p>,
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
    const { values, valuesLoading, saving } = this;

    return (
      <div className="values">
        <DrawerTitle title="Values"/>
        <div className="flex column gaps">
          <Checkbox
            label="User-supplied values only"
            value={this.showOnlyUserSuppliedValues}
            onChange={value => this.showOnlyUserSuppliedValues = value}
            disabled={valuesLoading}
          />
          <MonacoEditor
            language="yaml"
            value={values}
            onChange={text => this.values = text}
            theme={ThemeStore.getInstance().activeTheme.monacoTheme}
            className={cssNames("MonacoEditor", { loading: valuesLoading })}
            options={{ readOnly: valuesLoading, ...UserStore.getInstance().getEditorOptions() }}
          >
            {valuesLoading && <Spinner center />}
          </MonacoEditor>
          <Button
            primary
            label="Save"
            waiting={saving}
            disabled={valuesLoading}
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
              const api = apiManager.getApi(api => api.kind === kind && api.apiVersionWithGroup == item.apiVersion);
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

    if (!release) return null;

    if (this.error) {
      return (
        <div className="loading-error">
          {this.error}
        </div>
      );
    }

    if (!this.details) {
      return <Spinner center/>;
    }

    return (
      <div>
        <DrawerItem name="Chart" className="chart">
          <div className="flex gaps align-center">
            <span>{release.getChart()}</span>
            <Button
              primary
              label="Upgrade"
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
            className={kebabCase(release.getStatus())}
          />
        </DrawerItem>
        {this.renderValues()}
        <DrawerTitle title="Notes"/>
        {this.renderNotes()}
        <DrawerTitle title="Resources"/>
        {this.renderResources()}
      </div>
    );
  }

  render() {
    const { release, hideDetails } = this.props;
    const title = release ? `Release: ${release.getName()}` : "";
    const toolbar = <HelmReleaseMenu release={release} toolbar hideDetails={hideDetails}/>;

    return (
      <Drawer
        className={cssNames("ReleaseDetails", ThemeStore.getInstance().activeTheme.type)}
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
