import "./dialog.scss";

import * as React from "react";
import { createPortal, findDOMNode } from "react-dom";
import { disposeOnUnmount, observer } from "mobx-react";
import { reaction } from "mobx";
import { Animate } from "../animate";
import { cssNames, noop, stopPropagation } from "../../utils";
import { navigation } from "../../navigation";

export interface DialogProps {
  className?: string;
  isOpen?: boolean;
  open?: () => void;
  close?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
  modal?: boolean;
  pinned?: boolean;
  animated?: boolean;
}

interface DialogState {
  isOpen: boolean;
}

// fixme: handle animation end props.onClose() (await props.close()?)
@observer
export class Dialog extends React.PureComponent<DialogProps, DialogState> {
  private contentElem: HTMLElement;

  static defaultProps: DialogProps = {
    isOpen: false,
    open: noop,
    close: noop,
    onOpen: noop,
    onClose: noop,
    modal: true,
    animated: true,
    pinned: false,
  };

  @disposeOnUnmount
  closeOnNavigate = reaction(() => navigation.getPath(), () => this.close())

  public state: DialogState = {
    isOpen: this.props.isOpen,
  }

  get elem() {
    return findDOMNode(this) as HTMLElement;
  }

  get isOpen() {
    return this.state.isOpen;
  }

  componentDidMount() {
    if (this.isOpen) this.onOpen();
  }

  componentDidUpdate(prevProps: DialogProps) {
    const { isOpen } = this.props;
    if (isOpen !== prevProps.isOpen) {
      this.toggle(isOpen);
    }
  }

  componentWillUnmount() {
    if (this.isOpen) this.onClose();
  }

  toggle(isOpen: boolean) {
    if (isOpen) this.open();
    else this.close();
  }

  open() {
    requestAnimationFrame(this.onOpen); // wait for render(), bind close-event to this.elem
    this.setState({ isOpen: true });
    this.props.open();
  }

  close() {
    this.onClose(); // must be first to get access to dialog's content from outside
    this.setState({ isOpen: false });
    this.props.close();
  }

  onOpen = () => {
    this.props.onOpen();
    if (!this.props.pinned) {
      if (this.elem) this.elem.addEventListener('click', this.onClickOutside);
      window.addEventListener('keydown', this.onEscapeKey);
    }
  }

  onClose = () => {
    this.props.onClose();
    if (!this.props.pinned) {
      if (this.elem) this.elem.removeEventListener('click', this.onClickOutside);
      window.removeEventListener('keydown', this.onEscapeKey);
    }
  }

  onEscapeKey = (evt: KeyboardEvent) => {
    const escapeKey = evt.code === "Escape";
    if (escapeKey) {
      this.close();
      evt.stopPropagation();
    }
  }

  onClickOutside = (evt: MouseEvent) => {
    const target = evt.target as HTMLElement;
    if (!this.contentElem.contains(target)) {
      this.close();
      evt.stopPropagation();
    }
  }

  render() {
    const { modal, animated, pinned } = this.props;
    let { className } = this.props;
    className = cssNames("Dialog flex center", className, { modal, pinned });
    let dialog = (
      <div className={className} onClick={stopPropagation}>
        <div className="box" ref={e => this.contentElem = e}>
          {this.props.children}
        </div>
      </div>
    );
    if (animated) {
      dialog = (
        <Animate enter={this.isOpen} name="opacity-scale">
          {dialog}
        </Animate>
      );
    }
    else if (!this.isOpen) {
      return null;
    }
    return createPortal(dialog, document.body);
  }
}
