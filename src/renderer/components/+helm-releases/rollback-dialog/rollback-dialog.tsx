/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./rollback-dialog.scss";

import React, { useState } from "react";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../../dialog";
import { Wizard, WizardStep } from "../../wizard";
import { getReleaseHistory, HelmRelease, IReleaseRevision } from "../../../../common/k8s-api/endpoints/helm-release.api";
import { Select, SelectOption } from "../../select";
import { Notifications } from "../../notifications";
import orderBy from "lodash/orderBy";
import { withInjectables } from "@ogre-tools/injectable-react";
import helmReleaseRollbackDialogStateInjectable from "./state.injectable";
import closeHelmReleaseRollbackDialogInjectable from "./close.injectable";
import rollbackReleaseInjectable from "../rollback-release.injectable";

export interface ReleaseRollbackDialogProps extends Omit<DialogProps, "isOpen"> {
}

interface Dependencies {
  helmRelease: HelmRelease | null;
  closeReleaseRollbackDialog: () => void;
  rollbackRelease: (releaseName: string, namespace: string, revisionNumber: number) => Promise<void>;
}

const NonInjectedReleaseRollbackDialog = observer(({ helmRelease, closeReleaseRollbackDialog, rollbackRelease, className, ...dialogProps }: Dependencies & ReleaseRollbackDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [revision, setRevision] = useState<IReleaseRevision | undefined>(undefined);
  const [revisions, setRevisions] = useState<IReleaseRevision[]>([]);
  const isOpen = Boolean(helmRelease);

  const onOpen = async () => {
    setIsLoading(true);

    const revisions = orderBy(await getReleaseHistory(helmRelease.getName(), helmRelease.getNs()), "revision", "desc");

    setRevisions(revisions);
    setRevision(revisions[0]);
    setIsLoading(false);
  };
  const rollback = async () => {
    try {
      await rollbackRelease(helmRelease.getName(), helmRelease.getNs(), helmRelease.getRevision());
      closeReleaseRollbackDialog();
    } catch (err) {
      Notifications.error(err);
    }
  };
  const renderContent = () => {
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
          formatOptionLabel={({ value }: SelectOption<IReleaseRevision>) => `${value.revision} - ${value.chart} - ${value.app_version}, updated: ${new Date(value.updated).toLocaleString()}`}
          onChange={({ value }: SelectOption<IReleaseRevision>) => setRevision(value)}
        />
      </div>
    );
  };

  return (
    <Dialog
      {...dialogProps}
      isOpen={isOpen}
      className="ReleaseRollbackDialog"
      onOpen={onOpen}
      close={closeReleaseRollbackDialog}
    >
      <Wizard header={<h5>Rollback <b>{helmRelease?.getName()}</b></h5>} done={closeReleaseRollbackDialog}>
        <WizardStep
          scrollable={false}
          nextLabel="Rollback"
          next={rollback}
          loading={isLoading}
        >
          {renderContent()}
        </WizardStep>
      </Wizard>
    </Dialog>
  );
});

export const ReleaseRollbackDialog = withInjectables<Dependencies, ReleaseRollbackDialogProps>(NonInjectedReleaseRollbackDialog, {
  getProps: (di, props) => ({
    helmRelease: di.inject(helmReleaseRollbackDialogStateInjectable).helmRelease,
    closeReleaseRollbackDialog: di.inject(closeHelmReleaseRollbackDialogInjectable),
    rollbackRelease: di.inject(rollbackReleaseInjectable),
    ...props,
  }),
});
