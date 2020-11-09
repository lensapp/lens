import React from "react";
import { observer } from "mobx-react";
import { Cluster } from "../../../../main/cluster";
import { SubTitle } from "../../layout/sub-title";
import { EditableList } from "../../editable-list";
import { observable } from "mobx";
import { _i18n } from "../../../i18n";
import { Trans } from "@lingui/macro";

interface Props {
  cluster: Cluster;
}

@observer
export class ClusterAccessibleNamespaces extends React.Component<Props> {
  @observable namespaces = new Set(this.props.cluster.accessibleNamespaces);

  render() {
    return (
      <>
        <SubTitle title="Accessible Namespaces" />
        <p><Trans>This setting is useful for manually specifying which namespaces you have access to. This is useful when you don't have permissions to list namespaces.</Trans></p>
        <EditableList
          placeholder={_i18n._("Add new namespace...")}
          add={(newNamespace) => {
            this.namespaces.add(newNamespace);
            this.props.cluster.accessibleNamespaces = Array.from(this.namespaces);
          }}
          items={Array.from(this.namespaces)}
          remove={({ oldItem: oldNamesapce }) => {
            this.namespaces.delete(oldNamesapce);
            this.props.cluster.accessibleNamespaces = Array.from(this.namespaces);
          }}
        />
      </>
    );
  }
}
