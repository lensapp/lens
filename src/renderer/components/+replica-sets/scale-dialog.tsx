/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./scale-dialog.scss";

import React, { useState } from "react";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Icon } from "../icon";
import { Slider } from "../slider";
import { Notifications } from "../notifications";
import { cssNames } from "../../utils";
import type { ReplicaSet, ReplicaSetApi } from "../../../common/k8s-api/endpoints/replica-set.api";
import { withInjectables } from "@ogre-tools/injectable-react";
import replicaSetApiInjectable from "../../../common/k8s-api/endpoints/replica-set.api.injectable";
import replicaSetScaleDialogStateInjectable from "./scale-dialog.state.injectable";
import closeReplicaSetScaleDialogInjectable from "./scale-dialog-close.injectable";

export interface ReplicaSetScaleDialogProps extends Partial<DialogProps> {
}

interface Dependencies {
  replicaSetApi: ReplicaSetApi
  replicaSet: ReplicaSet | null;
  closeReplicaSetScaleDialog: () => void;
}

const defaultScaleMax = 50;

const NonInjectedReplicaSetScaleDialog = observer(({ replicaSetApi, replicaSet, closeReplicaSetScaleDialog, className, ...dialogProps }: Dependencies & ReplicaSetScaleDialogProps) => {
  const [ready, setReady] = useState(false);
  const [currentReplicas, setCurrentReplicas] = useState(0);
  const [desiredReplicas, setDesiredReplicas] = useState(0);
  const isOpen = Boolean(replicaSet);
  const scaleMax = Math.max(currentReplicas, defaultScaleMax) * 2;
  const scaleMin = 0;

  const onOpen = async () => {
    const replicas = await replicaSetApi.getReplicas({
      namespace: replicaSet.getNs(),
      name: replicaSet.getName(),
    });

    setCurrentReplicas(replicas);
    setDesiredReplicas(replicas);
    setReady(true);
  };

  const onClose = () => setReady(false);
  const onChange = (evt: React.ChangeEvent, value: number) => setDesiredReplicas(value);
  const desiredReplicasUp = () => setDesiredReplicas(Math.min(scaleMax, desiredReplicas + 1));
  const desiredReplicasDown = () => setDesiredReplicas(Math.max(scaleMin, desiredReplicas - 1));

  const scale = async () => {
    try {
      if (currentReplicas !== desiredReplicas) {
        await replicaSetApi.scale({
          name: replicaSet.getName(),
          namespace: replicaSet.getNs(),
        }, desiredReplicas);
      }
      closeReplicaSetScaleDialog();
    } catch (err) {
      Notifications.error(err);
    }
  };

  return (
    <Dialog
      {...dialogProps}
      isOpen={isOpen}
      className={cssNames("ReplicaSetScaleDialog", className)}
      onOpen={onOpen}
      onClose={onClose}
      close={closeReplicaSetScaleDialog}
    >
      <Wizard
        header={(
          <h5>
            Scale Replica Set <span>{replicaSet?.getName()}</span>
          </h5>
        )}
        done={closeReplicaSetScaleDialog}
      >
        <WizardStep
          contentClass="flex gaps column"
          next={scale}
          nextLabel="Scale"
          disabledNext={!ready}
        >
          <div className="current-scale" data-testid="current-scale">
          Current replica scale: {currentReplicas}
          </div>
          <div className="flex gaps align-center">
            <div className="desired-scale" data-testid="desired-scale">
            Desired number of replicas: {desiredReplicas}
            </div>
            <div className="slider-container flex align-center" data-testid="slider">
              <Slider value={desiredReplicas} max={scaleMax}
                onChange={onChange as any /** see: https://github.com/mui-org/material-ui/issues/20191 */}
              />
            </div>
            <div className="plus-minus-container flex gaps">
              <Icon
                material="add_circle_outline"
                onClick={desiredReplicasUp}
                data-testid="desired-replicas-up"
              />
              <Icon
                material="remove_circle_outline"
                onClick={desiredReplicasDown}
                data-testid="desired-replicas-down"
              />
            </div>
          </div>
          {currentReplicas < 10 && desiredReplicas > 90 && (
            <div className="warning" data-testid="warning">
              <Icon material="warning"/>
              High number of replicas may cause cluster performance issues
            </div>
          )}
        </WizardStep>
      </Wizard>
    </Dialog>
  );
});

export const ReplicaSetScaleDialog = withInjectables<Dependencies, ReplicaSetScaleDialogProps>(NonInjectedReplicaSetScaleDialog, {
  getProps: (di, props) => ({
    replicaSetApi: di.inject(replicaSetApiInjectable),
    replicaSet: di.inject(replicaSetScaleDialogStateInjectable).replicaSet,
    closeReplicaSetScaleDialog: di.inject(closeReplicaSetScaleDialogInjectable),
    ...props,
  }),
});
