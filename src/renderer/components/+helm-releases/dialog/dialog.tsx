/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./dialog.scss";

import React from "react";
import type { IObservableValue } from "mobx";
import { computed, observable, runInAction } from "mobx";
import { observer } from "mobx-react";
import type { DialogProps } from "../../dialog";
import { Dialog } from "../../dialog";
import { Wizard, WizardStep } from "../../wizard";
import type { HelmRelease } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import { getReleaseHistory, type HelmReleaseRevision } from "../../../../common/k8s-api/endpoints/helm-releases.api";
import { Select } from "../../select";
import { Notifications } from "../../notifications";
import orderBy from "lodash/orderBy";
import { withInjectables } from "@ogre-tools/injectable-react";
import releaseRollbackDialogStateInjectable from "./state.injectable";
import rollbackReleaseInjectable from "../rollback-release/rollback-release.injectable";

export interface ReleaseRollbackDialogProps extends DialogProps {
}

interface Dependencies {
  rollbackRelease: (releaseName: string, namespace: string, revisionNumber: number) => Promise<void>;
  state: IObservableValue<HelmRelease | undefined>;
}

@observer
class NonInjectedReleaseRollbackDialog extends React.Component<ReleaseRollbackDialogProps & Dependencies> {
  readonly isLoading = observable.box(false);
  readonly revision = observable.box<HelmReleaseRevision | undefined>();
  readonly revisions = observable.array<HelmReleaseRevision>();
  readonly revisionOptions = computed(() => (
    this.revisions.map(revision => ({
      value: revision,
      label: `${revision.revision} - ${revision.chart} - ${revision.app_version}, updated: ${new Date(revision.updated).toLocaleString()}`,
    }))
  ));

  close = () => {
    this.props.state.set(undefined);
  };

  onOpen = async (release: HelmRelease) => {
    this.isLoading.set(true);

    const releases = await getReleaseHistory(release.getName(), release.getNs());

    runInAction(() => {
      this.revisions.replace(orderBy(releases, "revision", "desc"));
      this.revision.set(this.revisions[0]);
      this.isLoading.set(false);
    });
  };

  rollback = async (release: HelmRelease) => {
    const revision = this.revision.get();

    if (!revision) {
      return;
    }

    try {
      await this.props.rollbackRelease(release.getName(), release.getNs(), revision.revision);
      this.close();
    } catch (err) {
      Notifications.checkedError(err, "Unknown error occured while rolling back release");
    }
  };

  renderRevisionContent() {
    const revision = this.revision.get();

    if (!revision) {
      return <p>No revisions to rollback.</p>;
    }

    return (
      <div className="flex gaps align-center">
        <b>Revision</b>
        <Select
          id="revision-input"
          themeName="light"
          value={revision}
          options={this.revisionOptions.get()}
          onChange={option => this.revision.set(option?.value)}
        />
      </div>
    );
  }

  renderContent(release: HelmRelease) {
    return (
      <Wizard
        header={(
          <h5>
            Rollback
            <b>{release.getName()}</b>
          </h5>
        )}
        done={this.close}
      >
        <WizardStep
          scrollable={false}
          nextLabel="Rollback"
          next={() => this.rollback(release)}
          loading={this.isLoading.get()}
        >
          {this.renderRevisionContent()}
        </WizardStep>
      </Wizard>
    );
  }

  render() {
    const { state, ...dialogProps } = this.props;
    const release = state.get();

    return (
      <Dialog
        {...dialogProps}
        className="ReleaseRollbackDialog"
        isOpen={Boolean(release)}
        onOpen={release ? (() => this.onOpen(release)) : undefined}
        close={this.close}
      >
        {release && this.renderContent(release)}
      </Dialog>
    );
  }
}

export const ReleaseRollbackDialog = withInjectables<Dependencies, ReleaseRollbackDialogProps>(
  NonInjectedReleaseRollbackDialog,

  {
    getProps: (di, props) => ({
      rollbackRelease: di.inject(rollbackReleaseInjectable),
      state: di.inject(releaseRollbackDialogStateInjectable),
      ...props,
    }),
  },
);
