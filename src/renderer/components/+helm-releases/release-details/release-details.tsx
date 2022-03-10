/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./release-details.scss";

import React, { Component } from "react";
import groupBy from "lodash/groupBy";
import { computed, IComputedValue, makeObservable, observable } from "mobx";
import { Link } from "react-router-dom";
import kebabCase from "lodash/kebabCase";
import type { HelmRelease, IReleaseDetails, IReleaseUpdateDetails, IReleaseUpdatePayload } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import { HelmReleaseMenu } from "../release-menu";
import { Drawer, DrawerItem, DrawerTitle } from "../../drawer";
import { Badge } from "../../badge";
import { cssNames, stopPropagation } from "../../../utils";
import { Observer, observer } from "mobx-react";
import { Spinner } from "../../spinner";
import { Table, TableCell, TableHead, TableRow } from "../../table";
import { Button } from "../../button";
import { Notifications } from "../../notifications";
import { ThemeStore } from "../../../theme.store";
import { apiManager } from "../../../../common/k8s-api/api-manager";
import { SubTitle } from "../../layout/sub-title";
import { getDetailsUrl } from "../../kube-detail-params";
import { Checkbox } from "../../checkbox";
import { MonacoEditor } from "../../monaco-editor";
import { IAsyncComputed, withInjectables } from "@ogre-tools/injectable-react";
import createUpgradeChartTabInjectable from "../../dock/upgrade-chart/create-upgrade-chart-tab.injectable";
import updateReleaseInjectable from "../update-release/update-release.injectable";
import releaseInjectable from "./release.injectable";
import releaseDetailsInjectable from "./release-details.injectable";
import releaseValuesInjectable from "./release-values.injectable";
import userSuppliedValuesAreShownInjectable from "./user-supplied-values-are-shown.injectable";

export interface ReleaseDetailsProps {
  hideDetails(): void;
}

interface Dependencies {
  release: IComputedValue<HelmRelease>;
  releaseDetails: IAsyncComputed<IReleaseDetails>;
  releaseValues: IAsyncComputed<string>;
  updateRelease: (name: string, namespace: string, payload: IReleaseUpdatePayload) => Promise<IReleaseUpdateDetails>;
  createUpgradeChartTab: (release: HelmRelease) => void;
  userSuppliedValuesAreShown: { toggle: () => void; value: boolean };
}

@observer
class NonInjectedReleaseDetails extends Component<ReleaseDetailsProps & Dependencies> {
  @observable saving = false;

  private nonSavedValues: string;

  constructor(props: ReleaseDetailsProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  @computed get release() {
    return this.props.release.get();
  }

  @computed get details() {
    return this.props.releaseDetails.value.get();
  }

  updateValues = async () => {
    const name = this.release.getName();
    const namespace = this.release.getNs();
    const data = {
      chart: this.release.getChart(),
      repo: await this.release.getRepo(),
      version: this.release.getVersion(),
      values: this.nonSavedValues,
    };

    this.saving = true;

    try {
      await this.props.updateRelease(name, namespace, data);
      Notifications.ok(
        <p>Release <b>{name}</b> successfully updated!</p>,
      );

      this.props.releaseValues.invalidate();
    } catch (err) {
      Notifications.error(err);
    }
    this.saving = false;
  };

  upgradeVersion = () => {
    const { hideDetails } = this.props;

    this.props.createUpgradeChartTab(this.release);
    hideDetails();
  };

  renderValues() {
    return (
      <Observer>
        {() => {
          const { saving } = this;

          const releaseValuesArePending =
            this.props.releaseValues.pending.get();

          this.nonSavedValues = this.props.releaseValues.value.get();

          return (
            <div className="values">
              <DrawerTitle title="Values" />
              <div className="flex column gaps">
                <Checkbox
                  label="User-supplied values only"
                  value={this.props.userSuppliedValuesAreShown.value}
                  onChange={this.props.userSuppliedValuesAreShown.toggle}
                  disabled={releaseValuesArePending}
                />
                <MonacoEditor
                  style={{ minHeight: 300 }}
                  value={this.nonSavedValues}
                  onChange={(text) => (this.nonSavedValues = text)}
                />
                <Button
                  primary
                  label="Save"
                  waiting={saving}
                  disabled={releaseValuesArePending}
                  onClick={this.updateValues}
                />
              </div>
            </div>
          );
        }}
      </Observer>
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
    if (!this.release) return null;

    if (!this.details) {
      return <Spinner center/>;
    }

    return (
      <div>
        <DrawerItem name="Chart" className="chart">
          <div className="flex gaps align-center">
            <span>{this.release.getChart()}</span>
            <Button
              primary
              label="Upgrade"
              className="box right upgrade"
              onClick={this.upgradeVersion}
            />
          </div>
        </DrawerItem>
        <DrawerItem name="Updated">
          {this.release.getUpdated()} ago ({this.release.updated})
        </DrawerItem>
        <DrawerItem name="Namespace">
          {this.release.getNs()}
        </DrawerItem>
        <DrawerItem name="Version" onClick={stopPropagation}>
          <div className="version flex gaps align-center">
            <span>
              {this.release.getVersion()}
            </span>
          </div>
        </DrawerItem>
        <DrawerItem name="Status" className="status" labelsOnly>
          <Badge
            label={this.release.getStatus()}
            className={kebabCase(this.release.getStatus())}
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
    const { hideDetails } = this.props;
    const title = this.release ? `Release: ${this.release.getName()}` : "";
    const toolbar = <HelmReleaseMenu release={this.release} toolbar hideDetails={hideDetails}/>;

    return (
      <Drawer
        className={cssNames("ReleaseDetails", ThemeStore.getInstance().activeTheme.type)}
        usePortal={true}
        open={!!this.release}
        title={title}
        onClose={hideDetails}
        toolbar={toolbar}
      >
        {this.renderContent()}
      </Drawer>
    );
  }
}

export const ReleaseDetails = withInjectables<Dependencies, ReleaseDetailsProps>(
  NonInjectedReleaseDetails,

  {
    getProps: (di, props) => ({
      release: di.inject(releaseInjectable),
      releaseDetails: di.inject(releaseDetailsInjectable),
      releaseValues: di.inject(releaseValuesInjectable),

      userSuppliedValuesAreShown: di.inject(userSuppliedValuesAreShownInjectable),

      updateRelease: di.inject(updateReleaseInjectable),
      createUpgradeChartTab: di.inject(createUpgradeChartTabInjectable),
      ...props,
    }),
  },
);
