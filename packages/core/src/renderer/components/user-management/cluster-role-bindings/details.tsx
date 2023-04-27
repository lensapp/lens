/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";

import type { ClusterRoleBinding } from "@k8slens/kube-object";
import { ObservableHashSet, prevDefault } from "@k8slens/utilities";
import { AddRemoveButtons } from "../../add-remove-buttons";
import { DrawerTitle } from "../../drawer";
import type { KubeObjectDetailsProps } from "../../kube-object-details";
import { Table, TableCell, TableHead, TableRow } from "../../table";
import { hashSubject } from "../hashers";
import type { OpenConfirmDialog } from "../../confirm-dialog/open.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import openConfirmDialogInjectable from "../../confirm-dialog/open.injectable";
import type { ClusterRoleBindingStore } from "./store";
import type { OpenClusterRoleBindingDialog } from "./dialog/open.injectable";
import openClusterRoleBindingDialogInjectable from "./dialog/open.injectable";
import clusterRoleBindingStoreInjectable from "./store.injectable";
import autoBindReact from "auto-bind/react";

export interface ClusterRoleBindingDetailsProps extends KubeObjectDetailsProps<ClusterRoleBinding> {
}

interface Dependencies {
  openConfirmDialog: OpenConfirmDialog;
  openClusterRoleBindingDialog: OpenClusterRoleBindingDialog;
  clusterRoleBindingStore: ClusterRoleBindingStore;
}

@observer
class NonInjectedClusterRoleBindingDetails extends React.Component<ClusterRoleBindingDetailsProps & Dependencies> {
  selectedSubjects = new ObservableHashSet([], hashSubject);

  constructor(props: ClusterRoleBindingDetailsProps & Dependencies) {
    super(props);
    autoBindReact(this);
  }

  async componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.object, () => {
        this.selectedSubjects.clear();
      }),
    ]);
  }

  removeSelectedSubjects() {
    const { object: clusterRoleBinding, openConfirmDialog, clusterRoleBindingStore } = this.props;
    const { selectedSubjects } = this;

    openConfirmDialog({
      ok: () => clusterRoleBindingStore.removeSubjects(clusterRoleBinding, selectedSubjects),
      labelOk: `Remove`,
      message: (
        <p>
          Remove selected bindings for
          <b>{clusterRoleBinding.getName()}</b>
          ?
        </p>
      ),
    });
  }

  render() {
    const { selectedSubjects } = this;
    const { object: clusterRoleBinding, openClusterRoleBindingDialog } = this.props;

    if (!clusterRoleBinding) {
      return null;
    }
    const { roleRef } = clusterRoleBinding;
    const subjects = clusterRoleBinding.getSubjects();

    return (
      <div className="ClusterRoleBindingDetails">
        <DrawerTitle>Reference</DrawerTitle>
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

        <DrawerTitle>Bindings</DrawerTitle>
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
                    onClick={prevDefault(() => this.selectedSubjects.toggle(subject))}
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
          onRemove={selectedSubjects.size ? this.removeSelectedSubjects : undefined}
          addTooltip={`Add bindings to ${roleRef.name}`}
          removeTooltip={`Remove selected bindings from ${roleRef.name}`}
        />
      </div>
    );
  }
}

export const ClusterRoleBindingDetails = withInjectables<Dependencies, ClusterRoleBindingDetailsProps>(NonInjectedClusterRoleBindingDetails, {
  getProps: (di, props) => ({
    ...props,
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
    openClusterRoleBindingDialog: di.inject(openClusterRoleBindingDialogInjectable),
    clusterRoleBindingStore: di.inject(clusterRoleBindingStoreInjectable),
  }),
});
