/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { RoleBinding, RoleBindingSubject } from "../../../common/k8s-api/endpoints";
import { prevDefault } from "../../utils";
import { AddRemoveButtons } from "../add-remove-buttons";
import type { ConfirmDialogParams } from "../confirm-dialog";
import { DrawerTitle } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { KubeObjectMeta } from "../kube-object-meta";
import { Table, TableCell, TableHead, TableRow } from "../table";
import type { RoleBindingStore } from "./store";
import { ObservableHashSet } from "../../../common/utils/hash-set";
import { hashRoleBindingSubject } from "./hashers";
import { withInjectables } from "@ogre-tools/injectable-react";
import roleBindingStoreInjectable from "./store.injectable";
import openConfirmDialogInjectable from "../confirm-dialog/dialog-open.injectable";
import logger from "../../../common/logger";
import openRoleBindingDialogInjectable from "./open-dialog.injectable";

export interface RoleBindingDetailsProps extends KubeObjectDetailsProps<RoleBinding> {
}

interface Dependencies {
  roleBindingStore: RoleBindingStore;
  openConfirmDialog: (params: ConfirmDialogParams) => void;
  openRoleBindingDialog: (roleBinding?: RoleBinding) => void;
}

const NonInjectedRoleBindingDetails = observer(({ roleBindingStore, object: roleBinding, openConfirmDialog, openRoleBindingDialog }: Dependencies & RoleBindingDetailsProps) => {
  const [selectedSubjects] = useState(new ObservableHashSet<RoleBindingSubject>([], hashRoleBindingSubject));

  useEffect(() => selectedSubjects.clear(), [roleBinding]);

  const removeSelectedSubjects = () => {
    openConfirmDialog({
      ok: () => roleBindingStore.removeSubjects(roleBinding, selectedSubjects.toJSON()),
      labelOk: `Remove`,
      message: (
        <p>Remove selected bindings for <b>{roleBinding.getName()}</b>?</p>
      ),
    });
  };

  if (!roleBinding) {
    return null;
  }

  if (!(roleBinding instanceof RoleBinding)) {
    logger.error("[RoleBindingDetails]: passed object that is not an instanceof RoleBinding", roleBinding);

    return null;
  }

  const { roleRef } = roleBinding;
  const subjects = roleBinding.getSubjects();

  return (
    <div className="RoleBindingDetails">
      <KubeObjectMeta object={roleBinding} />

      <DrawerTitle title="Reference" />
      <Table>
        <TableHead>
          <TableCell>Kind</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>API Group</TableCell>
        </TableHead>
        <TableRow>
          <TableCell>{roleRef.kind}</TableCell>
          <TableCell>{roleRef.name}</TableCell>
          <TableCell>{roleRef.apiGroup}</TableCell>
        </TableRow>
      </Table>

      <DrawerTitle title="Bindings" />
      {subjects.length > 0 && (
        <Table selectable className="bindings box grow">
          <TableHead>
            <TableCell checkbox />
            <TableCell className="type">Type</TableCell>
            <TableCell className="binding">Name</TableCell>
            <TableCell className="ns">Namespace</TableCell>
          </TableHead>
          {
            subjects.map((subject, i) => {
              const { kind, name, namespace } = subject;
              const isSelected = selectedSubjects.has(subject);

              return (
                <TableRow
                  key={i}
                  selected={isSelected}
                  onClick={prevDefault(() => selectedSubjects.toggle(subject))}
                >
                  <TableCell checkbox isChecked={isSelected} />
                  <TableCell className="type">{kind}</TableCell>
                  <TableCell className="binding">{name}</TableCell>
                  <TableCell className="ns">{namespace || "-"}</TableCell>
                </TableRow>
              );
            })
          }
        </Table>
      )}

      <AddRemoveButtons
        onAdd={() => openRoleBindingDialog(roleBinding)}
        onRemove={selectedSubjects.size ? removeSelectedSubjects : null}
        addTooltip={`Edit bindings of ${roleRef.name}`}
        removeTooltip={`Remove selected bindings from ${roleRef.name}`}
      />
    </div>
  );
});

export const RoleBindingDetails = withInjectables<Dependencies, RoleBindingDetailsProps>(NonInjectedRoleBindingDetails, {
  getProps: (di, props) => ({
    roleBindingStore: di.inject(roleBindingStoreInjectable),
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
    openRoleBindingDialog: di.inject(openRoleBindingDialogInjectable),
    ...props,
  }),
});
