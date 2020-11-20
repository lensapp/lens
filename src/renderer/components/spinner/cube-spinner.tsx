import './cube-spinner.scss'
import React from 'react'
import { cssNames } from "../../utils";

export interface CubeSpinnerProps {
  className?: string;
  center?: boolean;
}

export class CubeSpinner extends React.Component<CubeSpinnerProps> {
  render() {
    const { className, center } = this.props;
    return (
      <div className={cssNames("CubeSpinner ", className, { center })}>
        <div className="sk-cube-grid">
          <div className="sk-cube sk-cube1"></div>
          <div className="sk-cube sk-cube2"></div>
          <div className="sk-cube sk-cube3"></div>
          <div className="sk-cube sk-cube4"></div>
          <div className="sk-cube sk-cube5"></div>
          <div className="sk-cube sk-cube6"></div>
          <div className="sk-cube sk-cube7"></div>
          <div className="sk-cube sk-cube8"></div>
          <div className="sk-cube sk-cube9"></div>
        </div>
      </div>
    )
  }
}
