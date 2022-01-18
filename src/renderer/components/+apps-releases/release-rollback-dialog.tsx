/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./release-rollback-dialog.scss";

import React from "react";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { getReleaseHistory, HelmRelease, IReleaseRevision } from "../../../common/k8s-api/endpoints/helm-releases.api";
import { Select, SelectOption } from "../select";
import { Notifications } from "../notifications";
import orderBy from "lodash/orderBy";
import { withInjectables } from "@ogre-tools/injectable-react";
import releaseStoreInjectable from "./release-store.injectable";
import releaseRollbackDialogModelInjectable
  from "./release-rollback-dialog-model/release-rollback-dialog-model.injectable";
import type { ReleaseRollbackDialogModel } from "./release-rollback-dialog-model/release-rollback-dialog-model";

interface Props extends DialogProps {
}

interface Dependencies {
  rollbackRelease: (releaseName: string, namespace: string, revisionNumber: number) => Promise<any>
  model: ReleaseRollbackDialogModel
}

@observer
class NonInjectedReleaseRollbackDialog extends React.Component<Props & Dependencies> {
  @observable isLoading = false;
  @observable revision: IReleaseRevision;
  @observable revisions = observable.array<IReleaseRevision>();

  constructor(props: Props & Dependencies) {
    super(props);
    makeObservable(this);
  }

  get release(): HelmRelease {
    return this.props.model.release;
  }

  onOpen = async () => {
    this.isLoading = true;
    let releases = await getReleaseHistory(this.release.getName(), this.release.getNs());

    releases = orderBy(releases, "revision", "desc"); // sort
    this.revisions.replace(releases);
    this.revision = this.revisions[0];
    this.isLoading = false;
  };

  rollback = async () => {
    const revisionNumber = this.revision.revision;

    try {
      await this.props.rollbackRelease(this.release.getName(), this.release.getNs(), revisionNumber);
      this.props.model.close();
    } catch (err) {
      Notifications.error(err);
    }
  };

  renderContent() {
    const { revision, revisions } = this;

    if (!revision) {
      return <p>No revisions to rollback.</p>;
    }

    return (
      <div className="flex gaps align-center">
        <b>Revision</b>
        <Select
          themeName="light"
          value={revision}
          options={revisions}
          formatOptionLabel={({ value }: SelectOption<IReleaseRevision>) => `${value.revision} - ${value.chart}
          - ${value.app_version}, updated: ${new Date(value.updated).toLocaleString()}`}
          onChange={({ value }: SelectOption<IReleaseRevision>) => this.revision = value}
        />
      </div>
    );
  }

  render() {
    const { ...dialogProps } = this.props;
    const releaseName = this.release ? this.release.getName() : "";
    const header = <h5>Rollback <b>{releaseName}</b></h5>;

    return (
      <Dialog
        {...dialogProps}
        className="ReleaseRollbackDialog"
        isOpen={this.props.model.isOpen}
        onOpen={this.onOpen}
        close={this.props.model.close}
      >
        <Wizard header={header} done={this.props.model.close}>
          <WizardStep
            scrollable={false}
            nextLabel="Rollback"
            next={this.rollback}
            loading={this.isLoading}
          >
            {this.renderContent()}
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}

export const ReleaseRollbackDialog = withInjectables<Dependencies, Props>(
  NonInjectedReleaseRollbackDialog,

  {
    getProps: (di, props) => ({
      rollbackRelease: di.inject(releaseStoreInjectable).rollback,
      model: di.inject(releaseRollbackDialogModelInjectable),
      ...props,
    }),
  },
);
