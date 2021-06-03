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

import "./release-rollback-dialog.scss";

import React from "react";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { getReleaseHistory, HelmRelease, IReleaseRevision } from "../../api/endpoints/helm-releases.api";
import { releaseStore } from "./release.store";
import { Select, SelectOption } from "../select";
import { Notifications } from "../notifications";
import orderBy from "lodash/orderBy";

interface Props extends DialogProps {
}

const dialogState = observable.object({
  isOpen: false,
  release: null as HelmRelease,
});

@observer
export class ReleaseRollbackDialog extends React.Component<Props> {
  @observable isLoading = false;
  @observable revision: IReleaseRevision;
  @observable revisions = observable.array<IReleaseRevision>();

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  static open(release: HelmRelease) {
    dialogState.isOpen = true;
    dialogState.release = release;
  }

  static close() {
    dialogState.isOpen = false;
  }

  get release(): HelmRelease {
    return dialogState.release;
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
        isOpen={dialogState.isOpen}
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
