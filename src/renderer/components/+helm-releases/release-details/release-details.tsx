/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./release-details.scss";

import React, { Component } from "react";
import groupBy from "lodash/groupBy";
import type { IComputedValue } from "mobx";
import { computed, makeObservable, observable } from "mobx";
import { Link } from "react-router-dom";
import kebabCase from "lodash/kebabCase";
import type { HelmRelease, HelmReleaseDetails, HelmReleaseUpdateDetails, HelmReleaseUpdatePayload } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import { HelmReleaseMenu } from "../release-menu";
import { Drawer, DrawerItem, DrawerTitle } from "../../drawer";
import { Badge } from "../../badge";
import { cssNames, stopPropagation } from "../../../utils";
import { Observer, observer } from "mobx-react";
import { Spinner } from "../../spinner";
import { Table, TableCell, TableHead, TableRow } from "../../table";
import { Button } from "../../button";
import { Notifications } from "../../notifications";
import type { ThemeStore } from "../../../themes/store";
import { apiManager } from "../../../../common/k8s-api/api-manager";
import { SubTitle } from "../../layout/sub-title";
import { getDetailsUrl } from "../../kube-detail-params";
import { Checkbox } from "../../checkbox";
import { MonacoEditor } from "../../monaco-editor";
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import createUpgradeChartTabInjectable from "../../dock/upgrade-chart/create-upgrade-chart-tab.injectable";
import updateReleaseInjectable from "../update-release/update-release.injectable";
import releaseInjectable from "./release.injectable";
import releaseDetailsInjectable from "./release-details.injectable";
import releaseValuesInjectable from "./release-values.injectable";
import userSuppliedValuesAreShownInjectable from "./user-supplied-values-are-shown.injectable";
import { KubeObjectAge } from "../../kube-object/age";
import type { KubeJsonApiData } from "../../../../common/k8s-api/kube-json-api";
import { entries } from "../../../../common/utils/objects";
import themeStoreInjectable from "../../../themes/store.injectable";

export interface ReleaseDetailsProps {
  hideDetails(): void;
}

interface Dependencies {
  release: IComputedValue<HelmRelease | null | undefined>;
  releaseDetails: IAsyncComputed<HelmReleaseDetails>;
  releaseValues: IAsyncComputed<string>;
  updateRelease: (name: string, namespace: string, payload: HelmReleaseUpdatePayload) => Promise<HelmReleaseUpdateDetails>;
  createUpgradeChartTab: (release: HelmRelease) => void;
  userSuppliedValuesAreShown: { toggle: () => void; value: boolean };
  themeStore: ThemeStore;
}

@observer
class NonInjectedReleaseDetails extends Component<ReleaseDetailsProps & Dependencies> {
  @observable saving = false;

  private nonSavedValues = "";

  constructor(props: ReleaseDetailsProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  @computed get details() {
    return this.props.releaseDetails.value.get();
  }

  updateValues = async (release: HelmRelease) => {
    const name = release.getName();
    const namespace = release.getNs();
    const data = {
      chart: release.getChart(),
      repo: await release.getRepo(),
      version: release.getVersion(),
      values: this.nonSavedValues,
    };

    this.saving = true;

    try {
      await this.props.updateRelease(name, namespace, data);
      Notifications.ok(
        <p>
          Release
          <b>{name}</b>
          {" successfully updated!"}
        </p>,
      );

      this.props.releaseValues.invalidate();
    } catch (err) {
      Notifications.checkedError(err, "Unknown error occured while updating release");
    }
    this.saving = false;
  };

  upgradeVersion = (release: HelmRelease) => {
    const { hideDetails, createUpgradeChartTab } = this.props;

    createUpgradeChartTab(release);
    hideDetails();
  };

  renderValues(release: HelmRelease) {
    return (
      <Observer>
        {() => {
          const { saving } = this;

          const releaseValuesArePending =
            this.props.releaseValues.pending.get();

          this.nonSavedValues = this.props.releaseValues.value.get();

          return (
            <div className="values">
              <DrawerTitle>Values</DrawerTitle>
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
                  onClick={() => this.updateValues(release)}
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

  renderResources(resources: KubeJsonApiData[]) {
    return (
      <div className="resources">
        {
          entries(groupBy(resources, item => item.kind))
            .map(([kind, items]) => (
              <React.Fragment key={kind}>
                <SubTitle title={kind} />
                <Table scrollable={false}>
                  <TableHead sticky={false}>
                    <TableCell className="name">Name</TableCell>
                    {items[0].metadata.namespace && <TableCell className="namespace">Namespace</TableCell>}
                    <TableCell className="age">Age</TableCell>
                  </TableHead>
                  {items.map(item => {
                    const { name, namespace, uid } = item.metadata;
                    const api = apiManager.getApi(api => api.kind === kind && api.apiVersionWithGroup == item.apiVersion);
                    const detailsUrl = api ? getDetailsUrl(api.getUrl({ name, namespace })) : "";

                    return (
                      <TableRow key={uid}>
                        <TableCell className="name">
                          {detailsUrl ? <Link to={detailsUrl}>{name}</Link> : name}
                        </TableCell>
                        {namespace && (
                          <TableCell className="namespace">
                            {namespace}
                          </TableCell>
                        )}
                        <TableCell className="age">
                          <KubeObjectAge key="age" object={item} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </Table>
              </React.Fragment>
            ))
        }
      </div>
    );
  }

  renderContent(release: HelmRelease) {
    if (!this.details) {
      return <Spinner center/>;
    }

    const { resources } = this.details;

    return (
      <div>
        <DrawerItem name="Chart" className="chart">
          <div className="flex gaps align-center">
            <span>{release.getChart()}</span>
            <Button
              primary
              label="Upgrade"
              className="box right upgrade"
              onClick={() => this.upgradeVersion(release)}
            />
          </div>
        </DrawerItem>
        <DrawerItem name="Updated">
          {release.getUpdated()}
          {` ago (${release.updated})`}
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
        <DrawerItem
          name="Status"
          className="status"
          labelsOnly
        >
          <Badge
            label={release.getStatus()}
            className={kebabCase(release.getStatus())}
          />
        </DrawerItem>
        {this.renderValues(release)}
        <DrawerTitle>Notes</DrawerTitle>
        {this.renderNotes()}
        <DrawerTitle>Resources</DrawerTitle>
        {resources && this.renderResources(resources)}
      </div>
    );
  }

  render() {
    const { hideDetails, themeStore } = this.props;
    const release = this.props.release.get();

    return (
      <Drawer
        className={cssNames("ReleaseDetails", themeStore.activeTheme.type)}
        usePortal={true}
        open={Boolean(release)}
        title={release ? `Release: ${release.getName()}` : ""}
        onClose={hideDetails}
        toolbar={release && (
          <HelmReleaseMenu
            release={release}
            toolbar
            hideDetails={hideDetails}
          />
        )}
      >
        {release && this.renderContent(release)}
      </Drawer>
    );
  }
}

export const ReleaseDetails = withInjectables<Dependencies, ReleaseDetailsProps>(NonInjectedReleaseDetails, {
  getProps: (di, props) => ({
    ...props,
    release: di.inject(releaseInjectable),
    releaseDetails: di.inject(releaseDetailsInjectable),
    releaseValues: di.inject(releaseValuesInjectable),
    userSuppliedValuesAreShown: di.inject(userSuppliedValuesAreShownInjectable),
    updateRelease: di.inject(updateReleaseInjectable),
    createUpgradeChartTab: di.inject(createUpgradeChartTabInjectable),
    themeStore: di.inject(themeStoreInjectable),
  }),
});
