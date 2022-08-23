/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./tabs.scss";
import type { DOMAttributes } from "react";
import React from "react";
import { autoBind, cssNames } from "../../utils";
import { Icon } from "../icon";

const TabsContext = React.createContext<TabsContextValue>({});

interface TabsContextValue<D = any> {
  autoFocus?: boolean;
  withBorder?: boolean;
  value?: D;
  onChange?(value: D): void;
}

export interface TabsProps<D = any> extends TabsContextValue<D>, Omit<DOMAttributes<HTMLElement>, "onChange"> {
  className?: string;
  center?: boolean;
  wrap?: boolean;
  scrollable?: boolean;
}

export class Tabs extends React.PureComponent<TabsProps> {
  public elem: HTMLDivElement | null = null;

  render() {
    const { center, wrap, onChange, value, autoFocus, scrollable = true, withBorder, ...elemProps } = this.props;
    const className = cssNames("Tabs", this.props.className, {
      center,
      wrap,
      scrollable,
      withBorder,
    });

    return (
      <TabsContext.Provider value={{ autoFocus, value, onChange }}>
        <div
          {...elemProps}
          className={className}
          ref={elem => this.elem = elem}
        />
      </TabsContext.Provider>
    );
  }
}

export interface TabProps<D = any> extends DOMAttributes<HTMLElement> {
  id?: string;
  className?: string;
  active?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode | string; // material-ui name or custom icon
  label?: React.ReactNode;
  value?: D;
}

export class Tab extends React.PureComponent<TabProps> {
  static contextType = TabsContext;
  declare context: TabsContextValue;
  public ref = React.createRef<HTMLDivElement>();

  constructor(props: TabProps) {
    super(props);
    autoBind(this);
  }

  get isActive() {
    const { active, value } = this.props;

    return typeof active === "boolean" ? active : this.context.value === value;
  }

  focus() {
    this.ref.current?.focus();
  }

  scrollIntoView() {
    // Note: .scrollIntoViewIfNeeded() is non-standard and thus not present in js-dom.
    this.ref.current?.scrollIntoViewIfNeeded?.();
  }

  onClick(evt: React.MouseEvent<HTMLElement>) {
    const { value, active, disabled, onClick } = this.props;

    if (disabled || active) {
      return;
    }

    onClick?.(evt);
    this.context.onChange?.(value);
  }

  onFocus(evt: React.FocusEvent<HTMLElement>) {
    this.props.onFocus?.(evt);
    this.scrollIntoView();
  }

  onKeyDown(evt: React.KeyboardEvent<HTMLElement>) {
    if (evt.key === " " || evt.key === "Enter") {
      this.ref.current?.click();
    }

    this.props.onKeyDown?.(evt);
  }

  componentDidMount() {
    if (this.isActive && this.context.autoFocus) {
      this.focus();
    }
  }

  render() {
    const { active, disabled, icon, label, value, ...elemProps } = this.props;
    let { className } = this.props;

    className = cssNames("Tab flex gaps align-center", className, {
      "active": this.isActive,
      disabled,
    });

    return (
      <div
        {...elemProps}
        className={className}
        tabIndex={0}
        onClick={this.onClick}
        onFocus={this.onFocus}
        onKeyDown={this.onKeyDown}
        role="tab"
        ref={this.ref}
      >
        {typeof icon === "string" ? <Icon small material={icon}/> : icon}
        <div className="label">
          {label}
        </div>
      </div>
    );
  }
}
