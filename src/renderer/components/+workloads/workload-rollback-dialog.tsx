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

import "./workload-rollback-dialog.scss";

import type { DialogProps } from "../dialog/dialog";
import React from "react";
import { Select, SelectOption } from "../select/select";
import type { ControllerRevision } from "../../../common/k8s-api/endpoints/controller-revision.api";
import { Wizard, WizardStep } from "../wizard/wizard";
import { Dialog } from "../dialog/dialog";
import { createTerminalTab, TerminalStore } from "../dock/terminal.store";
import type { WorkloadKubeObject } from "../../../common/k8s-api/workload-kube-object";
import type { ReplicaSet } from "../../../common/k8s-api/endpoints/replica-set.api";
import { makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import orderBy from "lodash/orderBy";
import { Deployment } from "../../../common/k8s-api/endpoints/deployment.api";
import { deploymentStore } from "../+workloads-deployments/deployments.store";
import { controllerRevisionApi } from "../../../common/k8s-api/endpoints/controller-revision.api";

interface Props extends DialogProps {
}

const dialogState = observable.object({
  isOpen: false,
  workloadKubeObject: null as WorkloadKubeObject,
});

export interface KubeObjectHistory {
  revision: number;
  date: string;
  name: string;
}

@observer
export class WorkloadRollbackDialog extends React.Component<Props> {

  @observable workloadObject: WorkloadKubeObject;
  @observable isLoading = false;
  @observable revisions = observable.array<KubeObjectHistory>();
  @observable revision: KubeObjectHistory;

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  static open(workloadKubeObject: WorkloadKubeObject) {
    dialogState.isOpen = true;
    dialogState.workloadKubeObject = workloadKubeObject;
  }

  static close() {
    dialogState.isOpen = false;
  }

  close = () => {
    WorkloadRollbackDialog.close();
  };

  get workloadKubeObject(): WorkloadKubeObject {
    return dialogState.workloadKubeObject;
  }

  getHistory(revisions: ReplicaSet[] | ControllerRevision[]) {
    return revisions.map(revision => ({
      revision: revision.getRevisionNumber(),
      date: new Date(revision.metadata.creationTimestamp).toLocaleString(),
      name: revision.getName(),
    } as KubeObjectHistory));
  }

  onOpen = async () => {
    this.isLoading = true;
    let revisions: ReplicaSet[] | ControllerRevision[];

    if(this.workloadKubeObject instanceof Deployment) {
      revisions = deploymentStore.getRelatedReplicas(this.workloadKubeObject);
    }
    else {
      revisions =  await controllerRevisionApi.getRevisions({ namespace: this.workloadKubeObject.getNs(),
        name: this.workloadKubeObject.getName() });
    }

    this.revisions = observable.array(orderBy(this.getHistory(revisions), "revision", "desc"));
    this.revision = this.revisions[0];
    this.isLoading = false;
  };

  rollback = async () => {
    const shell = createTerminalTab({
      title: `Rollback: ${this.workloadKubeObject.getName()} (namespace: ${this.workloadKubeObject.getNs()})`
    });

    TerminalStore.getInstance().sendCommand(`kubectl rollout undo ${this.workloadKubeObject.kind.toLocaleLowerCase()}` +
      `/${this.workloadKubeObject.getName()} --to-revision=${this.revision.revision} -n=${this.workloadKubeObject.getNs()}`,
    {
      enter: true,
      tabId: shell.id
    });

    this.close();
  };

  renderContent() {
    const { revision, revisions } = this;

    if (revisions.length < 2) {
      return <p>No revisions to rollback.</p>;
    }

    return (
      <div className="flex gaps align-center">
        <b>Revision</b>
        <Select
          themeName="light"
          value={revision}
          options={revisions}
          formatOptionLabel={({ value }: SelectOption<KubeObjectHistory>) => `${value.revision} -  ${value.name},
          created: ${value.date}`}
          onChange={({ value }: SelectOption<KubeObjectHistory>) => this.revision = value}
        />
      </div>
    );
  }

  render() {
    const { ...dialogProps } = this.props;
    const kubeObjectName = this.workloadKubeObject ? this.workloadKubeObject.getName() : "";
    const header = <h5>Rollback {this.workloadKubeObject?.kind.toLowerCase()} <b>{kubeObjectName}</b></h5>;
    const {revisions} = this;

    return (
      <Dialog
        {...dialogProps}
        className="WorkloadRollbackDialog"
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
            disabledNext={revisions.length < 2}
          >
            {this.renderContent()}
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}
