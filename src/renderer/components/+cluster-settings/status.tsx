import React from "react";
import { Spinner } from "../spinner";
import { Cluster } from "../../../main/cluster";

interface Props {
  cluster: Cluster;
}

export class Status extends React.Component<Props> {
  renderStatusRows(): JSX.Element[] {
    const { cluster } = this.props;

    const rows: [string, React.ReactNode][] = [
      ["Online Status", cluster.online ? "online" : `offline (${cluster.failureReason || "unknown reason"}`],
      ["Distribution", cluster.distribution],
      ["Kerbel Version", cluster.version],
      ["API Address", cluster.apiUrl],
    ];

    if (cluster.nodes > 0) {
      rows.push(["Nodes Count", cluster.nodes]);
    }

    return rows
      .map(([header, value]) => [
        <h5 key={header+"-header"}>{header}</h5>,
        <span key={header + "-value"}>{value}</span>
      ])
      .flat();
  }

  render() {
    const { cluster } = this.props;

    return <div>
      <h2>Status</h2>
      <hr/>
      <h4>Cluster status</h4>
      <p>
        Cluster status information including: detected distribution, kernel version, and online status.
      </p>
      <div className="status-table">
        {this.renderStatusRows()}
      </div>
    </div>;
  }
}