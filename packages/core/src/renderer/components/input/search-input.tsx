/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./search-input.scss";

import React, { createRef } from "react";
import { observer } from "mobx-react";
import { addWindowEventListener, cssNames, disposer } from "@k8slens/utilities";
import { Icon } from "@k8slens/icon";
import type { InputProps } from "./input";
import { Input } from "./input";
import { withInjectables } from "@ogre-tools/injectable-react";
import isMacInjectable from "../../../common/vars/is-mac.injectable";
import autoBindReact from "auto-bind/react";

export interface SearchInputProps extends InputProps {
  compact?: boolean; // show only search-icon when not focused
  bindGlobalFocusHotkey?: boolean;
  showClearIcon?: boolean;
  onClear?(): void;
}

const defaultProps: Partial<SearchInputProps> = {
  autoFocus: true,
  bindGlobalFocusHotkey: true,
  showClearIcon: true,
  placeholder: "Search...",
};

interface Dependencies {
  isMac: boolean;
}

@observer
class NonInjectedSearchInput extends React.Component<SearchInputProps & Dependencies> {
  static defaultProps = defaultProps as object;

  private readonly inputRef = createRef<Input>();
  private readonly removeEventListeners = disposer();

  constructor(props: SearchInputProps & Dependencies) {
    super(props);
    autoBindReact(this);
  }

  componentDidMount() {
    if (this.props.bindGlobalFocusHotkey) {
      this.removeEventListeners.push(addWindowEventListener("keydown", this.onGlobalKey));
    }
  }

  componentWillUnmount() {
    this.removeEventListeners();
  }

  onGlobalKey = (evt: KeyboardEvent) => {
    if (evt.key === "f" && (this.props.isMac ? evt.metaKey : evt.ctrlKey)) {
      this.inputRef.current?.focus();
    }
  };

  onKeyDown = (evt: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    this.props.onKeyDown?.(evt);

    if (evt.nativeEvent.code === "Escape") {
      this.clear();
      evt.stopPropagation();
    }
  };

  clear = () => {
    if (this.props.onClear) {
      this.props.onClear();
    } else {
      this.inputRef.current?.setValue("");
    }
  };

  render() {
    const { className, compact, onClear, showClearIcon, bindGlobalFocusHotkey, value, isMac, ...inputProps } = this.props;
    let rightIcon = <Icon small material="search"/>;

    void onClear;
    void bindGlobalFocusHotkey;
    void isMac;

    if (showClearIcon && value) {
      rightIcon = (
        <Icon
          small
          material="close"
          onClick={this.clear}
        />
      );
    }

    return (
      <Input
        {...inputProps}
        className={cssNames("SearchInput", className, { compact })}
        value={value}
        onKeyDown={this.onKeyDown}
        iconRight={rightIcon}
        ref={this.inputRef}
        blurOnEnter={false}
      />
    );
  }
}

export const SearchInput = withInjectables<Dependencies, SearchInputProps>(NonInjectedSearchInput, {
  getProps: (di, props) => ({
    ...props,
    isMac: di.inject(isMacInjectable),
  }),
});
