import "./clipboard.scss";
import React from "react";
import { findDOMNode } from "react-dom";
import { autobind } from "../../../common/utils";
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
  }
};

export class Clipboard extends React.Component<CopyToClipboardProps> {
  static displayName = "Clipboard";
  static defaultProps = defaultProps as object;

  get rootElem(): HTMLElement {
    return findDOMNode(this) as HTMLElement;
  }

  get rootReactElem(): React.ReactElement<React.HTMLProps<any>> {
    return React.Children.only(this.props.children) as React.ReactElement;
  }

  @autobind()
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