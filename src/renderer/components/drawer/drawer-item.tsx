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

import "./drawer-item.scss";
import React from "react";
import { cssNames, displayBooleans } from "../../utils";

export interface DrawerItemProps extends React.HTMLAttributes<any> {
  name: React.ReactNode;
  className?: string;
  title?: string;
  labelsOnly?: boolean;
  hidden?: boolean;
  renderBoolean?: boolean; // show "true" or "false" for all of the children elements are "typeof boolean"
}

export class DrawerItem extends React.Component<DrawerItemProps> {
  render() {
    const { name, title, labelsOnly, children, hidden, className, renderBoolean, ...elemProps } = this.props;

    if (hidden) return null;

    const classNames = cssNames("DrawerItem", className, { labelsOnly });
    const content = displayBooleans(renderBoolean, children);

    return (
      <div {...elemProps} className={classNames} title={title}>
        <span className="name">{name}</span>
        <span className="value">{content}</span>
      </div>
    );
  }
}
