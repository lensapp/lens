import "./sub-title.scss";
import * as React from "react";
import { cssNames } from "../../utils";

interface Props {
  className?: string;
  title: React.ReactNode;
  compact?: boolean; // no bottom padding
}

export class SubTitle extends React.Component<Props> {
  render(): JSX.Element {
    const { compact, title, children } = this.props;
    let { className } = this.props;
    className = cssNames("SubTitle", className, {
      compact,
    });
    return (
      <div className={className}>
        {title} {children}
      </div>
    );
  }
}
