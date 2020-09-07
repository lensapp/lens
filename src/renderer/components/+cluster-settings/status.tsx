import React from "react";
import { Cluster } from "../../../main/cluster";
import { SubTitle } from "../layout/sub-title";
import { Table, TableCell, TableRow } from "../table";
import { autobind } from "../../utils";
import { shell } from "electron";

interface Props {
  cluster: Cluster;
}

export class Status extends React.Component<Props> {

  @autobind()
  openKubeconfig() {
    const { cluster } = this.props;
    shell.showItemInFolder(cluster.kubeConfigPath)
  }

  renderStatusRows() {
    const { cluster } = this.props;
    const rows = [
      ["Online Status", cluster.online ? "online" : `offline (${cluster.failureReason || "unknown reason"})`],
      ["Distribution", cluster.distribution],
      ["Kernel Version", cluster.version],
      ["API Address", cluster.apiUrl],
      ["Nodes Count", cluster.nodes || "0"]
    ];
    return (
      <Table scrollable={false}>
        {rows.map(([name, value]) => {
          return (
            <TableRow key={name}>
              <TableCell>{name}</TableCell>
              <TableCell className="value">{value}</TableCell>
            </TableRow>
          );
        })}
        <TableRow>
          <TableCell>Kubeconfig</TableCell>
          <TableCell className="link value" onClick={this.openKubeconfig}>{cluster.kubeConfigPath}</TableCell>
        </TableRow>
      </Table>
    );
  }

  render() {
    return <div>
      <h2>Status</h2>
      <SubTitle title="Cluster Status"/>
      <p>
        Cluster status information including: detected distribution, kernel version, and online status.
      </p>
      <div className="status-table">
        {this.renderStatusRows()}
      </div>
    </div>;
  }
}