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
import { clipboard } from "electron";
import { cssNames } from "../../utils";
import { Icon } from "../icon";

export interface DrawerItemProps extends React.HTMLAttributes<any> {
  name: React.ReactNode;
  className?: string;
  title?: string;
  labelsOnly?: boolean;
  hidden?: boolean;
}

interface State {
  isCopied: boolean;
}

export class DrawerItem extends React.Component<DrawerItemProps, State> {
  state = {
    isCopied: false,
  };

  copyValue = (content: string) => {
    clipboard.writeText(content);
    this.setState({ isCopied: true });
    setTimeout(() => {
      this.setState({ isCopied: false });
    }, 3000);
  };

  render() {
    const { name, title, labelsOnly, children, hidden, className, ...elemProps } = this.props;
    const { isCopied } = this.state;

    if (hidden) {
      return null;
    }

    const stringChildren = React.Children.toArray(children).filter(child => typeof child === "string");
    const canCopy = stringChildren.length > 0;

    return (
      <div {...elemProps} className={cssNames("DrawerItem", className, { labelsOnly })} title={title}>
        <span className="name">
          {name}
          {canCopy && (
            <Icon
              material={isCopied ? "done" : "content_copy"}
              tooltip={isCopied ? "Copied!" : "Copy"}
              onClick={() => this.copyValue(stringChildren.join(""))}
            />
          )}
        </span>
        <span className={cssNames("value", { noCopy: canCopy })}>{children}</span>
      </div>
    );
  }
}
