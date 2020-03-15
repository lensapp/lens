import "./login-layout.scss";

import * as React from "react";
import { Link } from "react-router-dom";
import { cssNames } from "../../utils";
import { Icon } from "../icon";

interface Props {
  className?: any;
  header?: any;
  title?: any;
  footer?: any;
}

export class LoginLayout extends React.Component<Props> {
  render() {
    const { className, header, title, footer, children } = this.props;
    return (
      <section className={cssNames('LoginLayout flex', className)}>
        <div className="header">{header}</div>
        <div className="box main">
          <div className="title">
            <Link to="/">
              <Icon svg="logo" className="logo"/>
            </Link>
            {title}
          </div>
          <div className="content">
            {children}
          </div>
        </div>
        <div className="footer">{footer}</div>
      </section>
    );
  }
}