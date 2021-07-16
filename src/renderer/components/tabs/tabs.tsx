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

import "./tabs.scss";
import React, { DOMAttributes } from "react";
import { boundMethod, cssNames } from "../../utils";
import { Icon } from "../icon";

const TabsContext = React.createContext<TabsContextValue>({});

interface TabsContextValue<D = any> {
  autoFocus?: boolean;
  withBorder?: boolean;
  value?: D;
  onChange?(value: D): void;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface TabsProps<D = any> extends TabsContextValue<D>, Omit<DOMAttributes<HTMLElement>, "onChange"> {
  className?: string;
  center?: boolean;
  wrap?: boolean;
  scrollable?: boolean;
}

export class Tabs extends React.PureComponent<TabsProps> {
  public elem: HTMLElement;

  @boundMethod
  protected bindRef(elem: HTMLElement) {
    this.elem = elem;
  }

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
          ref={this.bindRef}
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
  value: D;
}

export class Tab extends React.PureComponent<TabProps> {
  static contextType = TabsContext;
  declare context: TabsContextValue;
  public ref = React.createRef<HTMLDivElement>();

  get isActive() {
    const { active, value } = this.props;

    return typeof active === "boolean" ? active : this.context.value === value;
  }

  focus() {
    this.ref.current?.focus();
  }

  scrollIntoView() {
    this.ref.current?.scrollIntoView?.({
      behavior: "smooth",
      inline: "center",
    });
  }

  @boundMethod
  onClick(evt: React.MouseEvent<HTMLElement>) {
    const { value, active, disabled, onClick } = this.props;

    if (disabled || active) {
      return;
    }

    onClick?.(evt);
    this.context.onChange?.(value);
  }

  @boundMethod
  onFocus(evt: React.FocusEvent<HTMLElement>) {
    this.props.onFocus?.(evt);
    this.scrollIntoView();
  }

  @boundMethod
  onKeyDown(evt: React.KeyboardEvent<HTMLElement>) {
    if (evt.key === " " || evt.key === "Enter") {
      this.ref.current?.click();
    }

    this.props?.onKeyDown(evt);
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
