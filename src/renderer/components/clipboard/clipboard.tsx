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

import "./clipboard.scss";
import React from "react";
import { findDOMNode } from "react-dom";
import { boundMethod } from "../../../common/utils";
import { Notifications } from "../notifications";
import { copyToClipboard } from "../../utils/copyToClipboard";
import logger from "../../../main/logger";
import { cssNames } from "../../utils";

export interface CopyToClipboardProps {
  resetSelection?: boolean;
  showNotification?: boolean;
  cssSelectorLimit?: string; // allows to copy partial content with css-selector in children-element context
  getNotificationMessage?(copiedText: string): React.ReactNode;
}

export const defaultProps: Partial<CopyToClipboardProps> = {
  getNotificationMessage(copiedText: string) {
    return <p>Copied to clipboard: <em>{copiedText}</em></p>;
  },
};

export class Clipboard extends React.Component<CopyToClipboardProps> {
  static displayName = "Clipboard";
  static defaultProps = defaultProps as object;

  get rootElem(): HTMLElement {
    // eslint-disable-next-line react/no-find-dom-node
    return findDOMNode(this) as HTMLElement;
  }

  get rootReactElem(): React.ReactElement<React.HTMLProps<any>> {
    return React.Children.only(this.props.children) as React.ReactElement;
  }

  @boundMethod
  onClick(evt: React.MouseEvent) {
    if (this.rootReactElem.props.onClick) {
      this.rootReactElem.props.onClick(evt); // pass event to children-root-element if any
    }
    const { showNotification, resetSelection, getNotificationMessage, cssSelectorLimit } = this.props;
    const contentElem = this.rootElem.querySelector<any>(cssSelectorLimit) || this.rootElem;

    if (contentElem) {
      const { copiedText, copied } = copyToClipboard(contentElem, { resetSelection });

      if (copied && showNotification) {
        Notifications.ok(getNotificationMessage(copiedText));
      }
    }
  }

  render() {
    try {
      const rootElem = this.rootReactElem;

      return React.cloneElement(rootElem, {
        className: cssNames(Clipboard.displayName, rootElem.props.className),
        onClick: this.onClick,
      });
    } catch (err) {
      logger.error(`Invalid usage components/CopyToClick usage. Children must contain root html element.`, { err: String(err) });

      return this.rootReactElem;
    }
  }
}
