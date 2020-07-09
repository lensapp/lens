import "./release-rollback-dialog.scss";

import * as React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { HelmRelease, helmReleasesApi, ReleaseRevision } from "../../api/endpoints/helm-releases.api";
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
  @observable revision: ReleaseRevision;
  @observable revisions = observable.array<ReleaseRevision>();

  static open(release: HelmRelease): void {
    ReleaseRollbackDialog.isOpen = true;
    ReleaseRollbackDialog.release = release;
  }

  static close(): void {
    ReleaseRollbackDialog.isOpen = false;
  }

  get release(): HelmRelease {
    return ReleaseRollbackDialog.release;
  }

  onOpen = async (): Promise<void> => {
    this.isLoading = true;
    const currentRevision = this.release.revision;
    let releases = await helmReleasesApi.getHistory(this.release.getName(), this.release.namespace);
    releases = releases.filter(item => item.revision !== currentRevision); // remove current
    releases = orderBy(releases, "revision", "desc"); // sort
    this.revisions.replace(releases);
    this.revision = this.revisions[0];
    this.isLoading = false;
  }

  rollback = async (): Promise<void> => {
    const revisionNumber = this.revision.revision;
    try {
      await releaseStore.rollback(this.release.getName(), this.release.namespace, revisionNumber);
      this.close();
    } catch (err) {
      Notifications.error(err);
    }
  };

  close = (): void => {
    ReleaseRollbackDialog.close();
  }

  renderContent(): JSX.Element {
    const { revision, revisions } = this;
    if (!revision) {
      return <p><Trans>No revisions to rollback.</Trans></p>;
    }
    return (
      <div className="flex gaps align-center">
        <b><Trans>Revision</Trans></b>
        <Select
          themeName="light"
          value={revision}
          options={revisions}
          formatOptionLabel={({ value }: SelectOption<ReleaseRevision>): string => `${value.revision} - ${value.chart}`}
          onChange={({ value }: SelectOption<ReleaseRevision>): void => {
            this.revision = value; 
          }}
        />
      </div>
    );
  }

  render(): JSX.Element {
    const { ...dialogProps } = this.props;
    const releaseName = this.release ? this.release.getName() : "";
    const header = <h5><Trans>Rollback <b>{releaseName}</b></Trans></h5>;
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
            nextLabel={<Trans>Rollback</Trans>}
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
