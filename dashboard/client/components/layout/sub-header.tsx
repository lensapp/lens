import "./sub-header.scss"
import * as React from "react";
import { cssNames } from "../../utils";

export interface SubHeaderProps {
  className?: string;
  withLine?: boolean; // add bottom line
  compact?: boolean; // no extra padding around content
}

export class SubHeader extends React.Component<SubHeaderProps> {
  render() {
    const { withLine, compact, children } = this.props;
    let { className } = this.props;
    className = cssNames("SubHeader", {
      withLine,
      compact,
    }, className)
    return (
      <div className={className}>
        {children}
      </div>
    )
  }
}
