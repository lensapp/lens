import "./hpa-details.scss";

import React from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { KubeObjectDetailsProps } from "../kube-object";
import { cssNames } from "../../utils";
import { HorizontalPodAutoscaler, HpaMetricType, IHpaMetric } from "../../api/endpoints/hpa.api";
import { KubeEventDetails } from "../+events/kube-event-details";
import { Trans } from "@lingui/macro";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { getDetailsUrl } from "../../navigation";
import { lookupApiLink } from "../../api/kube-api";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";

interface Props extends KubeObjectDetailsProps<HorizontalPodAutoscaler> {
}

@observer
export class HpaDetails extends React.Component<Props> {
  renderMetrics() {
    const { object: hpa } = this.props;

    const renderName = (metric: IHpaMetric) => {
      switch (metric.type) {
      case HpaMetricType.Resource:
        const addition = metric.resource.targetAverageUtilization ? <Trans>(as a percentage of request)</Trans> : "";
        return <Trans>Resource {metric.resource.name} on Pods {addition}</Trans>;

      case HpaMetricType.Pods:
        return <Trans>{metric.pods.metricName} on Pods</Trans>;

      case HpaMetricType.Object:
        const { target } = metric.object;
        const { kind, name } = target;
        const objectUrl = getDetailsUrl(lookupApiLink(target, hpa));
        return (
          <Trans>
            {metric.object.metricName} on{" "}
            <Link to={objectUrl}>{kind}/{name}</Link>
          </Trans>
        );
      case HpaMetricType.External:
        return (
          <Trans>
            {metric.external.metricName} on{" "}
            {JSON.stringify(metric.external.selector)}
          </Trans>
        );
      }
    }

    return (
      <Table>
        <TableHead>
          <TableCell className="name"><Trans>Name</Trans></TableCell>
          <TableCell className="metrics"><Trans>Current / Target</Trans></TableCell>
        </TableHead>
        {
          hpa.getMetrics().map((metric, index) => {
            const name = renderName(metric);
            const values = hpa.getMetricValues(metric);
            return (
              <TableRow key={index}>
                <TableCell className="name">{name}</TableCell>
                <TableCell className="metrics">{values}</TableCell>
              </TableRow>
            )
          })
        }
      </Table>
    );
  }

  render() {
    const { object: hpa } = this.props;
    if (!hpa) return;
    const { scaleTargetRef } = hpa.spec;
    return (
      <div className="HpaDetails">
        <KubeObjectMeta object={hpa}/>

        <DrawerItem name={<Trans>Reference</Trans>}>
          {scaleTargetRef && (
            <Link to={getDetailsUrl(lookupApiLink(scaleTargetRef, hpa))}>
              {scaleTargetRef.kind}/{scaleTargetRef.name}
            </Link>
          )}
        </DrawerItem>

        <DrawerItem name={<Trans>Min Pods</Trans>}>
          {hpa.getMinPods()}
        </DrawerItem>

        <DrawerItem name={<Trans>Max Pods</Trans>}>
          {hpa.getMaxPods()}
        </DrawerItem>

        <DrawerItem name={<Trans>Replicas</Trans>}>
          {hpa.getReplicas()}
        </DrawerItem>

        <DrawerItem name={<Trans>Status</Trans>} labelsOnly>
          {hpa.getConditions().map(({ type, tooltip, isReady }) => {
            if (!isReady) return null;
            return (
              <Badge
                key={type}
                label={type}
                tooltip={tooltip}
                className={cssNames({ [type.toLowerCase()]: isReady })}
              />
            )
          })}
        </DrawerItem>

        <DrawerTitle title="Metrics"/>
        <div className="metrics">
          {this.renderMetrics()}
        </div>

        <KubeEventDetails object={hpa}/>
      </div>
    );
  }
}

kubeObjectDetailRegistry.add({
  kind: "HorizontalPodAutoscaler",
  apiVersions: ["autoscaling/v1"],
  components: {
    Details: (props) => <HpaDetails {...props} />
  }
})
