/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";

import type { ClusterRoleBinding } from "../../../../common/k8s-api/endpoints";
import { autoBind, ObservableHashSet, prevDefault } from "../../../utils";
import { AddRemoveButtons } from "../../add-remove-buttons";
import { ConfirmDialog } from "../../confirm-dialog";
import { DrawerTitle } from "../../drawer";
import type { KubeObjectDetailsProps } from "../../kube-object-details";
import { KubeObjectMeta } from "../../kube-object-meta";
import { Table, TableCell, TableHead, TableRow } from "../../table";
import { ClusterRoleBindingDialog } from "./dialog";
import { clusterRoleBindingStore } from "./store";
import { hashSubject } from "../hashers";

export interface ClusterRoleBindingDetailsProps extends KubeObjectDetailsProps<ClusterRoleBinding> {
}

@observer
export class ClusterRoleBindingDetails extends React.Component<ClusterRoleBindingDetailsProps> {
  selectedSubjects = new ObservableHashSet([], hashSubject);

  constructor(props: ClusterRoleBindingDetailsProps) {
    super(props);
    autoBind(this);
  }

  async componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.object, () => {
        this.selectedSubjects.clear();
      }),
    ]);
  }

  removeSelectedSubjects() {
    const { object: clusterRoleBinding } = this.props;
    const { selectedSubjects } = this;

    ConfirmDialog.open({
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
    const { object: clusterRoleBinding } = this.props;

    if (!clusterRoleBinding) {
      return null;
    }
    const { roleRef } = clusterRoleBinding;
    const subjects = clusterRoleBinding.getSubjects();

    return (
      <div className="ClusterRoleBindingDetails">
        <KubeObjectMeta object={clusterRoleBinding} />

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
          onAdd={() => ClusterRoleBindingDialog.open(clusterRoleBinding)}
          onRemove={selectedSubjects.size ? this.removeSelectedSubjects : undefined}
          addTooltip={`Add bindings to ${roleRef.name}`}
          removeTooltip={`Remove selected bindings from ${roleRef.name}`}
        />
      </div>
    );
  }
}
