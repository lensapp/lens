import "./no-items.scss";

import * as React from "react";
import { Trans } from "@lingui/macro";
import { cssNames, ClassName } from "../../utils";

interface Props {
  className?: ClassName;
  children?: React.ReactNode;
}

export function NoItems(props: Props): JSX.Element {
  const { className, children } = props;
  return (
    <div className={cssNames("NoItems flex box grow", className)}>
      <div className="box center">
        {children || <Trans>Item list is empty</Trans>}
      </div>
    </div>
  );
}
