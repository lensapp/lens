/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";

import { ClusterRoleBinding, ClusterRoleBindingSubject } from "../../../common/k8s-api/endpoints";
import { ObservableHashSet, prevDefault } from "../../utils";
import { AddRemoveButtons } from "../add-remove-buttons";
import type { ConfirmDialogParams } from "../confirm-dialog";
import { DrawerTitle } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { KubeObjectMeta } from "../kube-object-meta";
import { Table, TableCell, TableHead, TableRow } from "../table";
import type { ClusterRoleBindingStore } from "./store";
import { hashClusterRoleBindingSubject } from "./hashers";
import { withInjectables } from "@ogre-tools/injectable-react";
import clusterRoleBindingStoreInjectable from "./store.injectable";
import openConfirmDialogInjectable from "../confirm-dialog/dialog-open.injectable";
import logger from "../../../common/logger";
import openClusterRoleBindingDialogInjectable from "./open-dialog.injectable";

export interface ClusterRoleBindingDetailsProps extends KubeObjectDetailsProps<ClusterRoleBinding> {
}

interface Dependencies {
  clusterRoleBindingStore: ClusterRoleBindingStore;
  openConfirmDialog: (params: ConfirmDialogParams) => void;
  openClusterRoleBindingDialog: (clusterRoleBinding: ClusterRoleBinding) => void;
}

const NonInjectedClusterRoleBindingDetails = observer(({ openClusterRoleBindingDialog, clusterRoleBindingStore, object: clusterRoleBinding, openConfirmDialog }: Dependencies & ClusterRoleBindingDetailsProps) => {
  const [selectedSubjects] = useState(new ObservableHashSet<ClusterRoleBindingSubject>([], hashClusterRoleBindingSubject));

  useEffect(() => selectedSubjects.clear(), [clusterRoleBinding]);

  const removeSelectedSubjects = () => {
    openConfirmDialog({
      ok: () => clusterRoleBindingStore.removeSubjects(clusterRoleBinding, selectedSubjects),
      labelOk: "Remove",
      message: (
        <p>Remove selected bindings for <b>{clusterRoleBinding.getName()}</b>?</p>
      ),
    });
  };

  if (!clusterRoleBinding) {
    return null;
  }

  if (!(clusterRoleBinding instanceof ClusterRoleBinding)) {
    logger.error("[ClusterRoleBindingDetails]: passed object that is not an instanceof ClusterRoleBinding", clusterRoleBinding);

    return null;
  }

  const { roleRef } = clusterRoleBinding;
  const subjects = clusterRoleBinding.getSubjects();

  return (
    <div className="ClusterRoleBindingDetails">
      <KubeObjectMeta object={clusterRoleBinding} />

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
        onAdd={() => openClusterRoleBindingDialog(clusterRoleBinding)}
        onRemove={selectedSubjects.size ? removeSelectedSubjects : null}
        addTooltip={`Add bindings to ${roleRef.name}`}
        removeTooltip={`Remove selected bindings from ${roleRef.name}`}
      />
    </div>
  );
});

export const ClusterRoleBindingDetails = withInjectables<Dependencies, ClusterRoleBindingDetailsProps>(NonInjectedClusterRoleBindingDetails, {
  getProps: (di, props) => ({
    clusterRoleBindingStore: di.inject(clusterRoleBindingStoreInjectable),
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
    openClusterRoleBindingDialog: di.inject(openClusterRoleBindingDialogInjectable),
    ...props,
  }),
});

