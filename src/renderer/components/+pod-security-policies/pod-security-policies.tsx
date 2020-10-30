import "./pod-security-policies.scss";

import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { KubeObjectListLayout } from "../kube-object";
import { KubeObjectMenu, KubeObjectMenuProps } from "../kube-object/kube-object-menu";
import { podSecurityPoliciesStore } from "./pod-security-policies.store";
import { PodSecurityPolicy, pspApi } from "../../api/endpoints";
import { apiManager } from "../../api/api-manager";

enum sortBy {
  name = "name",
  volumes = "volumes",
  privileged = "privileged",
  age = "age",
}

@observer
export class PodSecurityPolicies extends React.Component {
  render() {
    return (
      <KubeObjectListLayout
        className="PodSecurityPolicies"
        isClusterScoped={true}
        store={podSecurityPoliciesStore}
        sortingCallbacks={{
          [sortBy.name]: (item: PodSecurityPolicy) => item.getName(),
          [sortBy.volumes]: (item: PodSecurityPolicy) => item.getVolumes(),
          [sortBy.privileged]: (item: PodSecurityPolicy) => +item.isPrivileged(),
          [sortBy.age]: (item: PodSecurityPolicy) => item.metadata.creationTimestamp,
        }}
        searchFilters={[
          (item: PodSecurityPolicy) => item.getSearchFields(),
          (item: PodSecurityPolicy) => item.getVolumes(),
          (item: PodSecurityPolicy) => Object.values(item.getRules()),
        ]}
        renderHeaderTitle={<Trans>Pod Security Policies</Trans>}
        renderTableHeader={[
          { title: <Trans>Name</Trans>, className: "name", sortBy: sortBy.name },
          { title: <Trans>Privileged</Trans>, className: "privileged", sortBy: sortBy.privileged },
          { title: <Trans>Volumes</Trans>, className: "volumes", sortBy: sortBy.volumes },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(item: PodSecurityPolicy) => {
          return [
            item.getName(),
            item.isPrivileged() ? <Trans>Yes</Trans> : <Trans>No</Trans>,
            item.getVolumes().join(", "),
            item.getAge(),
          ]
        }}
      />
    )
  }
}
