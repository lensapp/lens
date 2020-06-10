import "./no-items.scss"

import React from "react";
import { Trans } from "@lingui/macro";
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
        {children || <Trans>Item list is empty</Trans>}
      </div>
    </div>
  )
}
