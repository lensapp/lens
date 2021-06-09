/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./login-layout.scss";

import React from "react";
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
      <section className={cssNames("LoginLayout flex", className)}>
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
