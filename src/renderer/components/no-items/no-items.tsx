import "./no-items.scss";

import React from "react";
import { cssNames, IClassName } from "../../utils";

interface Props {
  className?: IClassName;
  children?: React.ReactNode;
}

export function NoItems(props: Props) {
  const { className, children } = props;

  return (
    <div className={cssNames("NoItems flex box grow", className)}>
      <div className="box center">
        {children || "Item list is empty"}
      </div>
    </div>
  );
}
