/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import * as styles from "./drawer-param-toggler.module.scss";
import React from "react";
import { Icon } from "../icon";

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
      <div className={styles.DrawerParamToggler}>
        <div className="flex gaps align-center params">
          <div className={styles.label}>{label}</div>
          <div
            className={styles.link}
            onClick={this.toggle}
            data-testid="drawer-param-toggler"
          >
            <span className={styles.linkText}>{link}</span>
            <Icon material={icon}/>
          </div>
        </div>
        {open && (
          <div className={styles.content}>
            {children}
          </div>
        )}
      </div>
    );
  }
}
