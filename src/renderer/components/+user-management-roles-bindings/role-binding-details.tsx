import "./role-binding-details.scss"

import React from "react";
import { t, Trans } from "@lingui/macro";
import { AddRemoveButtons } from "../add-remove-buttons";
import { IRoleBindingSubject, RoleBinding } from "../../api/endpoints";
import { autobind, prevDefault } from "../../utils";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { ConfirmDialog } from "../confirm-dialog";
import { DrawerTitle } from "../drawer";
import { KubeEventDetails } from "../+events/kube-event-details";
import { disposeOnUnmount, observer } from "mobx-react";
import { observable, reaction } from "mobx";
import { roleBindingsStore } from "./role-bindings.store";
import { AddRoleBindingDialog } from "./add-role-binding-dialog";
import { KubeObjectDetailsProps } from "../kube-object";
import { _i18n } from "../../i18n";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";

interface Props extends KubeObjectDetailsProps<RoleBinding> {
}

@observer
export class RoleBindingDetails extends React.Component<Props> {
  @observable selectedSubjects = observable.array<IRoleBindingSubject>([], { deep: false });

  async componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.object, (obj) => {
        this.selectedSubjects.clear();
      })
    ])
  }

  selectSubject(subject: IRoleBindingSubject) {
    const { selectedSubjects } = this;
    const isSelected = selectedSubjects.includes(subject);
    selectedSubjects.replace(
      isSelected
        ? selectedSubjects.filter(sub => sub !== subject) // unselect
        : selectedSubjects.concat(subject) // select
    )
  }

  @autobind()
  removeSelectedSubjects() {
    const { object: roleBinding } = this.props;
    const { selectedSubjects } = this;
    ConfirmDialog.open({
      ok: () => roleBindingsStore.updateSubjects({ roleBinding, removeSubjects: selectedSubjects }),
      labelOk: _i18n._(t`Remove`),
      message: (
        <p><Trans>Remove selected bindings for <b>{roleBinding.getName()}</b>?</Trans></p>
      )
    })
  }

  render() {
    const { selectedSubjects } = this;
    const { object: roleBinding } = this.props;
    if (!roleBinding) {
      return null;
    }
    const name = roleBinding.getName();
    const { roleRef } = roleBinding;
    const subjects = roleBinding.getSubjects();
    return (
      <div className="RoleBindingDetails">
        <KubeObjectMeta object={roleBinding}/>

        <DrawerTitle title={<Trans>Reference</Trans>}/>
        <Table>
          <TableHead>
            <TableCell><Trans>Kind</Trans></TableCell>
            <TableCell><Trans>Name</Trans></TableCell>
            <TableCell><Trans>API Group</Trans></TableCell>
          </TableHead>
          <TableRow>
            <TableCell>{roleRef.kind}</TableCell>
            <TableCell>{roleRef.name}</TableCell>
            <TableCell>{roleRef.apiGroup}</TableCell>
          </TableRow>
        </Table>

        <DrawerTitle title={<Trans>Bindings</Trans>}/>
        {subjects.length > 0 && (
          <Table selectable className="bindings box grow">
            <TableHead>
              <TableCell checkbox/>
              <TableCell className="binding"><Trans>Binding</Trans></TableCell>
              <TableCell className="type"><Trans>Type</Trans></TableCell>
              <TableCell className="type"><Trans>Namespace</Trans></TableCell>
            </TableHead>
            {
              subjects.map((subject, i) => {
                const { kind, name, namespace } = subject;
                const isSelected = selectedSubjects.includes(subject);
                return (
                  <TableRow
                    key={i} selected={isSelected}
                    onClick={prevDefault(() => this.selectSubject(subject))}
                  >
                    <TableCell checkbox isChecked={isSelected}/>
                    <TableCell className="binding">{name}</TableCell>
                    <TableCell className="type">{kind}</TableCell>
                    <TableCell className="ns">{namespace || "-"}</TableCell>
                  </TableRow>
                )
              })
            }
          </Table>
        )}

        <KubeEventDetails object={roleBinding}/>

        <AddRemoveButtons
          onAdd={() => AddRoleBindingDialog.open(roleBinding)}
          onRemove={selectedSubjects.length ? this.removeSelectedSubjects : null}
          addTooltip={<Trans>Add bindings to {name}</Trans>}
          removeTooltip={<Trans>Remove selected bindings from ${name}</Trans>}
        />
      </div>
    )
  }
}

kubeObjectDetailRegistry.add({
  kind: "RoleBinding",
  apiVersions: ["rbac.authorization.k8s.io/v1"],
  components: {
    Details: (props) => <RoleBindingDetails {...props} />
  }
})
kubeObjectDetailRegistry.add({
  kind: "ClusterRoleBinding",
  apiVersions: ["rbac.authorization.k8s.io/v1"],
  components: {
    Details: (props) => <RoleBindingDetails {...props} />
  }
})
