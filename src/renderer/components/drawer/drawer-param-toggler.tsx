import "./drawer-param-toggler.scss";
import React from "react";
import { t } from "@lingui/macro";
import { Icon } from "../icon";
import { cssNames } from "../../utils";
import { _i18n } from "../../i18n";

export interface DrawerParamTogglerProps {
  label: string | number;
}

interface State {
  open?: boolean;
}
export class DrawerParamToggler extends React.Component<DrawerParamTogglerProps, State> {
  public state: State = {}

  toggle = () => {
    this.setState({ open: !this.state.open })
  }

  render() {
    const { label, children } = this.props
    const { open } = this.state
    const icon = `arrow_drop_${open ? "up" : "down"}`
    const link = open ? _i18n._(t`Hide`) : _i18n._(t`Show`)
    return (
      <div className="DrawerParamToggler">
        <div className="flex gaps align-center">
          <div className="param-label">{label}</div>
          <div className="param-link" onClick={this.toggle}>
            <span className="param-link-text">{link}</span>
            <Icon material={icon}/>
          </div>
        </div>
        <div className={cssNames("param-content", { open })}>{children}</div>
      </div>
    )
  }
}