import "./namespace-details.scss";

import React from "react";
import { computed } from "mobx";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { DrawerItem } from "../drawer";
import { cssNames } from "../../utils";
import { Namespace } from "../../api/endpoints";
import { KubeObjectDetailsProps } from "../kube-object";
import { Link } from "react-router-dom";
import { getDetailsUrl } from "../../navigation";
import { Spinner } from "../spinner";
import { resourceQuotaStore } from "../+config-resource-quotas/resource-quotas.store";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";

interface Props extends KubeObjectDetailsProps<Namespace> {
}

@observer
export class NamespaceDetails extends React.Component<Props> {
  @computed get quotas() {
    const namespace = this.props.object.getName();
    return resourceQuotaStore.getAllByNs(namespace);
  }

  componentDidMount() {
    resourceQuotaStore.loadAll();
  }

  render() {
    const { object: namespace } = this.props;
    if (!namespace) return;
    const status = namespace.getStatus();
    return (
      <div className="NamespaceDetails">
        <KubeObjectMeta object={namespace}/>

        <DrawerItem name={<Trans>Status</Trans>}>
          <span className={cssNames("status", status.toLowerCase())}>{status}</span>
        </DrawerItem>

        <DrawerItem name={<Trans>Resource Quotas</Trans>} className="quotas flex align-center">
          {!this.quotas && resourceQuotaStore.isLoading && <Spinner/>}
          {this.quotas.map(quota => {
            return (
              <Link key={quota.getId()} to={getDetailsUrl(quota.selfLink)}>
                {quota.getName()}
              </Link>
            );
          })}
        </DrawerItem>
      </div>
    );
  }
}

kubeObjectDetailRegistry.add({
  kind: "Namespace",
  apiVersions: ["v1"],
  components: {
    Details: (props) => <NamespaceDetails {...props} />
  }
})
