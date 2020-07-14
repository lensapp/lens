import "./add-cluster.scss"
import React from "react";
import { observable } from "mobx";

interface Props {
}

@observable
export class AddCluster extends React.Component<Props> {
  render() {
    return (
      <div className="AddCluster">
        AddCluster
      </div>
    )
  }
}
