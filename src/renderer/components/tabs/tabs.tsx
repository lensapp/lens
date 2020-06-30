import "./tabs.scss";
import React, { DOMAttributes } from "react";
import { autobind, cssNames } from "../../utils";
import { Icon } from "../icon";

const TabsContext = React.createContext<TabsContextValue>({});

interface TabsContextValue<D = any> {
  autoFocus?: boolean;
  value?: D;
  onChange?(value: D): void;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export interface TabsProps<D = any> extends TabsContextValue<D>, Omit<DOMAttributes<HTMLElement>, "onChange"> {
  className?: string;
  center?: boolean;
  wrap?: boolean;
  scrollable?: boolean;
}

export class Tabs extends React.PureComponent<TabsProps> {
  public elem: HTMLElement;

  @autobind()
  protected bindRef(elem: HTMLElement) {
    this.elem = elem;
  }

  render() {
    const {
      center, wrap, onChange, value, autoFocus,
      scrollable = true,
      ...elemProps
    } = this.props;
    let { className } = this.props;
    className = cssNames("Tabs", className, {
      "center": center,
      "wrap": wrap,
      "scrollable": scrollable,
    });
    return (
      <TabsContext.Provider value={{ autoFocus, value, onChange }}>
        <div
          {...elemProps}
          className={className}
          ref={this.bindRef}
        />
      </TabsContext.Provider>
    )
  }
}

export interface TabProps<D = any> extends DOMAttributes<HTMLElement> {
  className?: string;
  active?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode | string; // material-ui name or custom icon
  label?: React.ReactNode;
  value: D;
}

export class Tab extends React.PureComponent<TabProps> {
  static contextType = TabsContext;
  public context: TabsContextValue;
  public elem: HTMLElement;

  get isActive() {
    const { active, value } = this.props;
    return typeof active === "boolean" ? active : this.context.value === value;
  }

  focus() {
    this.elem.focus();
  }

  scrollIntoView() {
    this.elem.scrollIntoView({
      behavior: "smooth",
      inline: "center",
    });
  }

  @autobind()
  onClick(evt: React.MouseEvent<HTMLElement>) {
    const { value, active, disabled, onClick } = this.props;
    const { onChange } = this.context;
    if (disabled || active) return;
    if (onClick) onClick(evt);
    if (onChange) onChange(value);
  }

  @autobind()
  onFocus(evt: React.FocusEvent<HTMLElement>) {
    const { onFocus } = this.props;
    if (onFocus) onFocus(evt);
    this.scrollIntoView();
  }

  @autobind()
  onKeyDown(evt: React.KeyboardEvent<HTMLElement>) {
    const ENTER_KEY = evt.keyCode === 13;
    const SPACE_KEY = evt.keyCode === 32;
    if (SPACE_KEY || ENTER_KEY) this.elem.click();
    const { onKeyDown } = this.props;
    if (onKeyDown) onKeyDown(evt);
  }

  componentDidMount() {
    if (this.isActive && this.context.autoFocus) {
      this.focus();
    }
  }

  @autobind()
  protected bindRef(elem: HTMLElement) {
    this.elem = elem;
  }

  render() {
    const { active, disabled, icon, label, value, ...elemProps } = this.props;
    let { className } = this.props;
    className = cssNames("Tab flex gaps align-center", className, {
      "active": this.isActive,
      "disabled": disabled,
    });
    return (
      <div
        {...elemProps}
        className={className}
        tabIndex={0}
        onClick={this.onClick}
        onFocus={this.onFocus}
        onKeyDown={this.onKeyDown}
        ref={this.bindRef}
      >
        {typeof icon === "string" ? <Icon small material={icon}/> : icon}
        <div className="label">
          {label}
        </div>
      </div>
    )
  }
}
