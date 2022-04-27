/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./dialog.scss";

import React from "react";
import { createPortal } from "react-dom";
import { disposeOnUnmount, observer } from "mobx-react";
import { reaction } from "mobx";
import { Animate } from "../animate";
import { cssNames, noop, stopPropagation } from "../../utils";
import type { ObservableHistory } from "mobx-observable-history";
import { withInjectables } from "@ogre-tools/injectable-react";
import observableHistoryInjectable from "../../navigation/observable-history.injectable";

// todo: refactor + handle animation-end in props.onClose()?

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
  "data-testid"?: string;
  children?: React.ReactNode | React.ReactNode[];
}

interface DialogState {
  isOpen: boolean;
}

interface Dependencies {
  navigation: ObservableHistory<unknown>;
}

@observer
class NonInjectedDialog extends React.PureComponent<DialogProps & Dependencies & typeof NonInjectedDialog.defaultProps, DialogState> {
  private readonly contentElem = React.createRef<HTMLDivElement>();
  private readonly ref = React.createRef<HTMLDivElement>();

  static defaultProps = {
    isOpen: false,
    open: noop,
    close: noop,
    onOpen: noop,
    onClose: noop,
    modal: true,
    animated: true,
    pinned: false,
  };

  public state: DialogState = {
    isOpen: this.props.isOpen ?? false,
  };

  get elem() {
    return this.ref.current;
  }

  get isOpen() {
    return this.state.isOpen;
  }

  componentDidMount() {
    if (this.isOpen) {
      this.onOpen();
    }

    disposeOnUnmount(this, [
      reaction(() => this.props.navigation.toString(), () => this.close()),
    ]);
  }

  componentDidUpdate(prevProps: DialogProps) {
    const { isOpen } = this.props;

    if (isOpen !== prevProps.isOpen) {
      this.toggle(isOpen ?? false);
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
    this.props.open?.();
  }

  close() {
    this.onClose(); // must be first to get access to dialog's content from outside
    this.setState({ isOpen: false });
    this.props.close?.();
  }

  onOpen = () => {
    this.props.onOpen?.();

    if (!this.props.pinned) {
      if (this.elem) this.elem.addEventListener("click", this.onClickOutside);
      // Using document.body target to handle keydown event before Drawer does
      document.body.addEventListener("keydown", this.onEscapeKey);
    }
  };

  onClose = () => {
    this.props.onClose?.();

    if (!this.props.pinned) {
      if (this.elem) this.elem.removeEventListener("click", this.onClickOutside);
      document.body.removeEventListener("keydown", this.onEscapeKey);
    }
  };

  onEscapeKey = (evt: KeyboardEvent) => {
    const escapeKey = evt.code === "Escape";

    if (escapeKey) {
      this.close();
      evt.stopPropagation();
    }
  };

  onClickOutside = (evt: MouseEvent) => {
    const target = evt.target as HTMLElement;

    if (!this.contentElem.current?.contains(target)) {
      this.close();
      evt.stopPropagation();
    }
  };

  render() {
    const { modal, animated, pinned, "data-testid": testId } = this.props;
    let { className } = this.props;

    className = cssNames("Dialog flex center", className, { modal, pinned });
    let dialog = (
      <div
        className={className}
        onClick={stopPropagation}
        ref={this.ref}
        data-testid={testId}
      >
        <div
          className="box"
          ref={this.contentElem}
        >
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
    } else if (!this.isOpen) {
      return null;
    }

    return createPortal(dialog, document.body);
  }
}

export const Dialog = withInjectables<Dependencies, DialogProps>((props) => <NonInjectedDialog {...props} />, {
  getProps: (di, props) => ({
    ...props,
    navigation: di.inject(observableHistoryInjectable),
  }),
});
