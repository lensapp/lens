import React from "react";
import { IconButton } from "@material-ui/core";

export interface MaybeInteractiveProps {
  isInteractive?: boolean;
}

export class MaybeInteractive extends React.Component<MaybeInteractiveProps> {
  render() {
    const { isInteractive, children } = this.props;

    if (isInteractive) {
      return (
        <IconButton disableRipple={false}>
          {children}
        </IconButton>
      );
    }

    return <>{children}</>;
  }
}
