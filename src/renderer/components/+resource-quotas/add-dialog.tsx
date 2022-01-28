/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./add-dialog.scss";

import React, { useState } from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Input } from "../input";
import { systemName } from "../input/input_validators";
import { ResourceQuotaApi, resourceQuotaKinds, ResourceQuotaKinds } from "../../../common/k8s-api/endpoints";
import { Select } from "../select";
import { Icon } from "../icon";
import { Button } from "../button";
import { Notifications } from "../notifications";
import { NamespaceSelect } from "../+namespaces/namespace-select";
import { SubTitle } from "../layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import resourceQuotaApiInjectable from "../../../common/k8s-api/endpoints/resource-quota.api.injectable";
import addResourceQuotaDialogStateInjectable, { AddResourceQuotaDialogState } from "./add-dialog.state.injectable";
import closeAddResourceQuotaDialogInjectable from "./add-dialog-close.injectable";
import { cssNames, iter } from "../../utils";

export interface AddQuotaDialogProps extends Omit<DialogProps, "isOpen"> {
}

interface Dependencies {
  resourceQuotaApi: ResourceQuotaApi;
  state: AddResourceQuotaDialogState;
  closeAddResourceQuotaDialog: () => void;
}

const NonInjectedAddQuotaDialog = observer(({ resourceQuotaApi, state, closeAddResourceQuotaDialog, className, ...dialogProps }: Dependencies & AddQuotaDialogProps) => {
  const [quotaName, setQuotaName] = useState("");
  const [quotaSelectValue, setQuotaSelectValue] = useState<ResourceQuotaKinds>(resourceQuotaKinds[0]);
  const [quotaInputValue, setQuotaInputValue] = useState("");
  const [namespace, setNamespace] = useState("default");
  const [quotas] = useState(observable.map(resourceQuotaKinds.map(resourceQuotaKind => [resourceQuotaKind, ""])));

  const { isOpen } = state;
  const quotaEntries = [...iter.filter(quotas.entries(), ([, value]) => value.trim().length === 0)];
  const quotaOptions = Array.from(quotas.keys(), quota => {
    const isCompute = quota.endsWith(".cpu") || quota.endsWith(".memory");
    const isStorage = quota.endsWith(".storage") || quota === "persistentvolumeclaims";
    const isCount = quota.startsWith("count/");
    const icon = isCompute ? "memory" : isStorage ? "storage" : isCount ? "looks_one" : "";

    return {
      label: icon ? <span className="nobr"><Icon material={icon} /> {quota}</span> : quota,
      value: quota,
    };
  });

  const reset = () => {
    quotas.replace(resourceQuotaKinds.map(resourceQuotaKind => [resourceQuotaKind, ""]));
    setQuotaName("");
    setQuotaSelectValue(resourceQuotaKinds[0]);
    setQuotaInputValue("");
    setNamespace("default");
  };
  const setQuota = () => {
    if (quotaSelectValue) {
      quotas.set(quotaSelectValue, quotaInputValue);
      setQuotaInputValue("");
    }
  };
  const addQuota = async () => {
    try {
      await resourceQuotaApi.create({ namespace, name: quotaName }, {
        spec: {
          hard: Object.fromEntries(quotaEntries),
        },
      });
      closeAddResourceQuotaDialog();
    } catch (err) {
      Notifications.error(err);
    }
  };
  const onInputQuota = (evt: React.KeyboardEvent) => {
    switch (evt.key) {
      case "Enter":
        setQuota();
        evt.preventDefault(); // don't submit form
        break;
    }
  };

  return (
    <Dialog
      {...dialogProps}
      isOpen={isOpen}
      className={cssNames("AddQuotaDialog", className)}
      onOpen={reset}
      close={closeAddResourceQuotaDialog}
    >
      <Wizard header={<h5>Create ResourceQuota</h5>} done={closeAddResourceQuotaDialog}>
        <WizardStep
          contentClass="flex gaps column"
          disabledNext={!namespace}
          nextLabel="Create"
          next={addQuota}
        >
          <div className="flex gaps">
            <Input
              required autoFocus
              placeholder="ResourceQuota name"
              trim
              validators={systemName}
              value={quotaName}
              onChange={setQuotaName}
              className="box grow"
            />
          </div>

          <SubTitle title="Namespace" />
          <NamespaceSelect
            value={namespace}
            placeholder="Namespace"
            themeName="light"
            className="box grow"
            onChange={({ value }) => setNamespace(value)}
          />

          <SubTitle title="Values" />
          <div className="flex gaps align-center">
            <Select
              className="quota-select"
              themeName="light"
              placeholder="Select a quota.."
              options={quotaOptions}
              value={quotaSelectValue}
              onChange={({ value }) => setQuotaSelectValue(value)}
            />
            <Input
              maxLength={10}
              placeholder="Value"
              value={quotaInputValue}
              onChange={setQuotaInputValue}
              onKeyDown={onInputQuota}
              className="box grow"
            />
            <Button round primary onClick={setQuota}>
              <Icon
                material={quotas.get(quotaSelectValue) ? "edit" : "add"}
                tooltip="Set quota"
              />
            </Button>
          </div>
          <div className="quota-entries">
            {quotaEntries.map(([quota, value]) => (
              <div key={quota} className="quota gaps inline align-center">
                <div className="name">{quota}</div>
                <div className="value">{value}</div>
                <Icon material="clear" onClick={() => quotas.set(quota, "")} />
              </div>
            ))}
          </div>
        </WizardStep>
      </Wizard>
    </Dialog>
  );
});

export const AddResourceQuotaDialog = withInjectables<Dependencies, AddQuotaDialogProps>(NonInjectedAddQuotaDialog, {
  getProps: (di, props) => ({
    resourceQuotaApi: di.inject(resourceQuotaApiInjectable),
    state: di.inject(addResourceQuotaDialogStateInjectable),
    closeAddResourceQuotaDialog: di.inject(closeAddResourceQuotaDialogInjectable),
    ...props,
  }),
});
