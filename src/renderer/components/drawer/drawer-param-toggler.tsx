/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./drawer-param-toggler.scss";
import React from "react";
import { Icon } from "../icon";
import { cssNames } from "../../utils";

export interface DrawerParamTogglerProps {
  label: string | number;
  children: React.ReactNode | React.ReactNode[];
}

interface State {
  open?: boolean;
}
export class DrawerParamToggler extends React.Component<DrawerParamTogglerProps, State> {
  public state: State = {};

  toggle = () => {
    this.setState({ open: !this.state.open });
  };

  render() {
    const { label, children } = this.props;
    const { open } = this.state;
    const icon = `arrow_drop_${open ? "up" : "down"}`;
    const link = open ? `Hide` : `Show`;

    return (
      <div className="DrawerParamToggler">
        <div className="flex gaps align-center params">
          <div className="param-label">{label}</div>
          <div className="param-link" onClick={this.toggle}>
            <span className="param-link-text">{link}</span>
            <Icon material={icon}/>
          </div>
        </div>
        <div className={cssNames("param-content", { open })}>
          {children}
        </div>
      </div>
    );
  }
}
