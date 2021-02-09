import "./release-rollback-dialog.scss";

import React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { HelmRelease, helmReleasesApi, IReleaseRevision } from "../../api/endpoints/helm-releases.api";
import { releaseStore } from "./release.store";
import { Select, SelectOption } from "../select";
import { Notifications } from "../notifications";
import orderBy from "lodash/orderBy";

interface Props extends DialogProps {
}

@observer
export class ReleaseRollbackDialog extends React.Component<Props> {
  @observable static isOpen = false;
  @observable.ref static release: HelmRelease = null;

  @observable isLoading = false;
  @observable revision: IReleaseRevision;
  @observable revisions = observable.array<IReleaseRevision>();

  static open(release: HelmRelease) {
    ReleaseRollbackDialog.isOpen = true;
    ReleaseRollbackDialog.release = release;
  }

  static close() {
    ReleaseRollbackDialog.isOpen = false;
  }

  get release(): HelmRelease {
    return ReleaseRollbackDialog.release;
  }

  onOpen = async () => {
    this.isLoading = true;
    const currentRevision = this.release.getRevision();
    let releases = await helmReleasesApi.getHistory(this.release.getName(), this.release.getNs());

    releases = releases.filter(item => item.revision !== currentRevision); // remove current
    releases = orderBy(releases, "revision", "desc"); // sort
    this.revisions.replace(releases);
    this.revision = this.revisions[0];
    this.isLoading = false;
  };

  rollback = async () => {
    const revisionNumber = this.revision.revision;

    try {
      await releaseStore.rollback(this.release.getName(), this.release.getNs(), revisionNumber);
      this.close();
    } catch (err) {
      Notifications.error(err);
    }
  };

  close = () => {
    ReleaseRollbackDialog.close();
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
        isOpen={ReleaseRollbackDialog.isOpen}
        onOpen={this.onOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
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
