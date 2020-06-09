import { KubeObject } from "../../api/kube-object";
import { observer } from "mobx-react";
import React from "react";
import { Table, TableHead, TableCell, TableRow } from "../table";
import { prevDefault } from "../../utils";
import { showDetails } from "../../navigation";
import { Trans } from "@lingui/macro";
import { endpointStore } from "../+network-endpoints/endpoints.store";
import { Spinner } from "../spinner";

interface Props {
  endpoint: KubeObject;
}

@observer
export class ServiceDetailsEndpoint extends React.Component<Props> {
  render() {
    const { endpoint } = this.props
    if (!endpoint && !endpointStore.isLoaded) return (
      <div className="PodDetailsList flex justify-center"><Spinner/></div>
    );
    if (!endpoint) {
      return null
    }
    return (
        <div className="EndpointList flex column">
        <Table
        selectable
        virtual={false}
        scrollable={false}
        className="box grow"
        >
        <TableHead>
          <TableCell className="name" ><Trans>Name</Trans></TableCell>
          <TableCell className="endpoints"><Trans>Endpoints</Trans></TableCell>
        </TableHead>
        <TableRow
        key={endpoint.getId()}
        nowrap
        onClick={prevDefault(() => showDetails(endpoint.selfLink, false))}
        >
        <TableCell className="name">{endpoint.getName()}</TableCell>
        <TableCell className="endpoints">{ endpoint.toString()}</TableCell>
        </TableRow>
        </Table>
      </div>
    )
  }
}
