/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";
import type { RoleBinding } from "../../../../common/k8s-api/endpoints";
import { prevDefault } from "../../../utils";
import { AddRemoveButtons } from "../../add-remove-buttons";
import { ConfirmDialog } from "../../confirm-dialog";
import { DrawerTitle } from "../../drawer";
import type { KubeObjectDetailsProps } from "../../kube-object-details";
import { KubeObjectMeta } from "../../kube-object-meta";
import { Table, TableCell, TableHead, TableRow } from "../../table";
import { RoleBindingDialog } from "./dialog";
import { roleBindingStore } from "./store";
import { ObservableHashSet } from "../../../../common/utils/hash-set";
import { hashSubject } from "../hashers";

export interface RoleBindingDetailsProps extends KubeObjectDetailsProps<RoleBinding> {
}

@observer
export class RoleBindingDetails extends React.Component<RoleBindingDetailsProps> {
  selectedSubjects = new ObservableHashSet([], hashSubject);

  async componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.object, () => {
        this.selectedSubjects.clear();
      }),
    ]);
  }

  removeSelectedSubjects = () => {
    const { object: roleBinding } = this.props;
    const { selectedSubjects } = this;

    ConfirmDialog.open({
      ok: () => roleBindingStore.removeSubjects(roleBinding, selectedSubjects.toJSON()),
      labelOk: `Remove`,
      message: (
        <p>
          Remove selected bindings for
          <b>{roleBinding.getName()}</b>
          ?
        </p>
      ),
    });
  };

  render() {
    const { selectedSubjects } = this;
    const { object: roleBinding } = this.props;

    if (!roleBinding) {
      return null;
    }
    const { roleRef } = roleBinding;
    const subjects = roleBinding.getSubjects();

    return (
      <div className="RoleBindingDetails">
        <KubeObjectMeta object={roleBinding} />

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
          onAdd={() => RoleBindingDialog.open(roleBinding)}
          onRemove={selectedSubjects.size ? this.removeSelectedSubjects : undefined}
          addTooltip={`Edit bindings of ${roleRef.name}`}
          removeTooltip={`Remove selected bindings from ${roleRef.name}`}
        />
      </div>
    );
  }
}
