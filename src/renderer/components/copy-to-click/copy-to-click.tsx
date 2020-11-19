import React from "react"
import { findDOMNode } from "react-dom";
import { autobind } from "../../../common/utils";
import { Notifications } from "../notifications";
import { copyToClipboard } from "../../utils/copyToClipboard";
import logger from "../../../main/logger";

export interface CopyToClickProps {
  resetSelection?: boolean
  showNotification?: boolean
  getNotificationMessage?(copiedText: string): React.ReactNode;
}

export const defaultProps: Partial<CopyToClickProps> = {
  getNotificationMessage(copiedText: string) {
    return <p>Copied to clipboard: <em className="contrast">{copiedText}</em></p>
  }
}

export class CopyToClick extends React.Component<CopyToClickProps> {
  static defaultProps = defaultProps as object;

  get rootElem(): HTMLElement {
    return findDOMNode(this) as HTMLElement;
  }

  get rootReactElem(): React.ReactElement<React.DOMAttributes<any>> {
    return React.Children.only(this.props.children) as React.ReactElement;
  }

  @autobind()
  onClick(evt: React.MouseEvent<HTMLElement>) {
    if (!this.rootElem || !this.rootElem.contains(evt.target as any)) {
      return;
    }
    const { showNotification, resetSelection, getNotificationMessage } = this.props;
    const { copiedText, copied } = copyToClipboard(this.rootElem, { resetSelection });
    if (copied && showNotification) {
      Notifications.ok(getNotificationMessage(copiedText));
    }
    if (this.rootReactElem.props.onClick) {
      this.rootReactElem.props.onClick(evt); // pass event to content element as well when provided
    }
  }

  render() {
    try {
      const rootElem = this.rootReactElem;
      return React.cloneElement(rootElem, {
        ...(rootElem || {}).props,
        onClick: this.onClick,
      })
    } catch (err) {
      logger.error(`Invalid usage components/CopyToClick usage. Children must contain root html element.`, { err: String(err) })
      return this.rootReactElem;
    }
  }
}