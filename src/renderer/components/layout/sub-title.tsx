import "./sub-title.scss";
import React from "react";
import { cssNames } from "../../utils";

interface Props {
  className?: string;
  title: React.ReactNode;
  compact?: boolean; // no bottom padding
  id?: string;
}

export class SubTitle extends React.Component<Props> {
  render() {
    const { className, compact, title, children, id } = this.props;
    const classNames = cssNames("SubTitle", className, {
      compact,
    });

    return (
      <div className={classNames} id={id}>
        {title} {children}
      </div>
    );
  }
}
