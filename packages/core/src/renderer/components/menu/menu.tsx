/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./menu.scss";

import type { ReactElement } from "react";
import React, { Fragment } from "react";
import { createPortal } from "react-dom";
import type { StrictReactNode } from "@k8slens/utilities";
import { cssNames, noop } from "@k8slens/utilities";
import { Animate, requestAnimationFrameInjectable } from "@k8slens/animate";
import type { IconProps } from "@k8slens/icon";
import { Icon } from "@k8slens/icon";
import isEqual from "lodash/isEqual";
import type { RequestAnimationFrame } from "@k8slens/animate";
import { withInjectables } from "@ogre-tools/injectable-react";
import autoBindReact from "auto-bind/react";

export const MenuContext = React.createContext<MenuContextValue | null>(null);
export interface MenuContextValue {
  readonly props: Readonly<MenuProps>;
  close: () => void;
}

export interface MenuPosition {
  left?: boolean;
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
}

export interface MenuStyle {
  top: string;
  left: string;
}
export interface MenuProps {
  isOpen?: boolean;
  open(): void;
  close(): void;
  id?: string;
  className?: string;
  htmlFor?: string;
  autoFocus?: boolean;
  usePortal?: boolean | HTMLElement;
  closeOnClickItem?: boolean;       // close menu on item click
  closeOnClickOutside?: boolean;    // use false value for sub-menus
  closeOnScroll?: boolean;          // applicable when usePortal={true}
  position?: MenuPosition;          // applicable when usePortal={false}
  children?: StrictReactNode;
  animated?: boolean;
  toggleEvent?: "click" | "contextmenu";
  "data-testid"?: string;
}

interface State {
  position?: MenuPosition;
  menuStyle?: MenuStyle;
}

const defaultPropsMenu: Partial<MenuProps> = {
  position: { right: true, bottom: true },
  autoFocus: false,
  usePortal: false,
  closeOnClickItem: true,
  closeOnClickOutside: true,
  closeOnScroll: false,
  toggleEvent: "click",
  animated: true,
};

interface Dependencies {
  requestAnimationFrame: RequestAnimationFrame;
}

class NonInjectedMenu extends React.Component<MenuProps & Dependencies, State> {
  static defaultProps = defaultPropsMenu as object;

  constructor(props: MenuProps & Dependencies) {
    super(props);
    autoBindReact(this);
  }
  private opener: HTMLElement | null = null;
  private elem: HTMLUListElement | null = null;
  protected items: { [index: number]: MenuItem } = {};
  state: State = {};

  get isOpen() {
    return !!this.props.isOpen;
  }

  get isClosed() {
    return !this.isOpen;
  }

  componentDidMount() {
    const {
      usePortal,
      htmlFor,
      toggleEvent,
    } = this.props;

    if (!usePortal) {
      if (this.elem?.parentElement) {
        const { position } = window.getComputedStyle(this.elem.parentElement);

        if (position === "static") {
          this.elem.parentElement.style.position = "relative";
        }
      }
    } else if (this.isOpen) {
      this.refreshPosition();
    }

    if (htmlFor) {
      this.opener = document.getElementById(htmlFor); // might not exist in sub-menus
    }

    if (this.opener) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.opener.addEventListener(toggleEvent!, this.toggle);
      this.opener.addEventListener("keydown", this.onKeyDown);
    }
    window.addEventListener("resize", this.onWindowResize);
    window.addEventListener("click", this.onClickOutside, true);
    window.addEventListener("scroll", this.onScrollOutside, true);
    window.addEventListener("contextmenu", this.onContextMenu, true);
    window.addEventListener("blur", this.onBlur, true);
  }

  componentWillUnmount() {
    if (this.opener) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.opener.removeEventListener(this.props.toggleEvent!, this.toggle);
      this.opener.removeEventListener("keydown", this.onKeyDown);
    }
    window.removeEventListener("resize", this.onWindowResize);
    window.removeEventListener("click", this.onClickOutside, true);
    window.removeEventListener("scroll", this.onScrollOutside, true);
    window.removeEventListener("blur", this.onBlur, true);
    window.removeEventListener("contextmenu", this.onContextMenu, true);
  }

  componentDidUpdate(prevProps: MenuProps) {
    if (!isEqual(prevProps.children, this.props.children)) {
      this.refreshPosition();
    }
  }

  protected get focusableItems() {
    return Object.values(this.items).filter(item => item.isFocusable);
  }

  protected get focusedItem() {
    return this.focusableItems.find(item => item.elem === document.activeElement);
  }

  protected focusNextItem(reverse = false) {
    const items = this.focusableItems;
    const activeIndex = items.findIndex(item => item === this.focusedItem);

    if (!items.length) {
      return;
    }

    if (activeIndex > -1) {
      let nextItem = reverse ? items[activeIndex - 1] : items[activeIndex + 1];

      if (!nextItem) nextItem = items[activeIndex];
      nextItem.elem?.focus();
    } else {
      items[0].elem?.focus();
    }
  }

  refreshPosition = () => requestAnimationFrame(() => {
    if (!this.props.usePortal || !this.opener || !this.elem) {
      return;
    }

    const openerClientRect = this.opener.getBoundingClientRect();
    let { left: openerLeft, top: openerTop, bottom: openerBottom, right: openerRight } = this.opener.getBoundingClientRect();
    const withScroll = window.getComputedStyle(this.elem).position !== "fixed";

    // window global scroll corrections
    if (withScroll) {
      openerLeft += window.pageXOffset;
      openerTop += window.pageYOffset;
      openerRight = openerLeft + openerClientRect.width;
      openerBottom = openerTop + openerClientRect.height;
    }

    const extraMargin = this.props.usePortal ? 8 : 0;

    const { width: menuWidth, height: menuHeight } = this.elem.getBoundingClientRect();

    const rightSideOfMenu = openerLeft + menuWidth;
    const renderMenuLeft = rightSideOfMenu > window.innerWidth;
    const menuOnLeftSidePosition = `${openerRight - this.elem.offsetWidth}px`;
    const menuOnRightSidePosition = `${openerLeft}px`;

    const bottomOfMenu = openerBottom + extraMargin + menuHeight;
    const renderMenuOnTop = bottomOfMenu > window.innerHeight;
    const menuOnTopPosition = `${openerTop - this.elem.offsetHeight - extraMargin}px`;
    const menuOnBottomPosition = `${openerBottom + extraMargin}px`;

    this.setState({
      position: {
        top: renderMenuOnTop,
        bottom: !renderMenuOnTop,
        left: renderMenuLeft,
        right: !renderMenuLeft,
      },
      menuStyle: {
        top: renderMenuOnTop ? menuOnTopPosition : menuOnBottomPosition,
        left: renderMenuLeft ? menuOnLeftSidePosition : menuOnRightSidePosition,
      },
    });
  });

  open() {
    if (this.isOpen) {
      return;
    }

    this.props.open();
    this.refreshPosition();

    if (this.props.autoFocus) {
      this.focusNextItem();
    }
  }

  close() {
    if (this.isClosed) {
      return;
    }

    this.props.close();
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  onKeyDown(evt: React.KeyboardEvent | KeyboardEvent) {
    if (!this.isOpen) return;

    switch (evt.code) {
      case "Escape":
        this.close();
        break;

      case "Space":
        // fallthrough

      case "Enter": {
        const focusedItem = this.focusedItem;

        if (focusedItem) {
          focusedItem.elem?.click();
          evt.preventDefault();
        }
        break;
      }

      case "ArrowUp":
        this.focusNextItem(true);
        break;

      case "ArrowDown":
        this.focusNextItem();
        break;
    }
  }

  onContextMenu() {
    this.close();
  }

  onWindowResize() {
    if (!this.isOpen) return;
    this.refreshPosition();
  }

  onScrollOutside(evt: Event) {
    if (!this.isOpen) return;
    const target = evt.target as HTMLElement;
    const { usePortal, closeOnScroll } = this.props;

    if (usePortal && closeOnScroll && !target.contains(this.elem)) {
      this.close();
    }
  }

  onClickOutside(evt: MouseEvent) {
    if (!this.props.closeOnClickOutside) return;
    if (!this.isOpen || evt.target === document.body) return;
    const target = evt.target as HTMLElement;
    const clickInsideMenu = this.elem?.contains(target);
    const clickOnOpener = this.opener && this.opener.contains(target);

    if (!clickInsideMenu && !clickOnOpener) {
      this.close();
    }
  }

  onBlur() {
    if (!this.isOpen) return;  // Prevents triggering document.activeElement for each <Menu/> instance

    if (document.activeElement?.tagName == "IFRAME") {
      this.close();
    }
  }

  protected bindRef(elem: HTMLUListElement) {
    this.elem = elem;
  }

  protected bindItemRef(item: MenuItem, index: number) {
    this.items[index] = item;
  }

  render() {
    const { position, id, animated, "data-testid": dataTestId, usePortal, className } = this.props;
    const classNames = cssNames("Menu", className, this.state.position || position, {
      portal: usePortal,
    });

    let children = this.props.children as ReactElement<any>;

    if (children.type === Fragment) {
      children = children.props.children;
    }
    const menuItems = React.Children.toArray(children).map((item, index) => {
      if (typeof item === "object" && (item as ReactElement).type === MenuItem) {
        return React.cloneElement(item as ReactElement, {
          ref: (item: MenuItem) => this.bindItemRef(item, index),
        });
      }

      return item;
    });

    let menu = (
      <ul
        id={id}
        ref={this.bindRef}
        className={classNames}
        style={{
          left: this.state?.menuStyle?.left,
          top: this.state?.menuStyle?.top,
        }}
        onKeyDown={this.onKeyDown}
        data-testid={dataTestId}
      >
        {menuItems}
      </ul>
    );

    if (animated) {
      menu = (
        <Animate enter={this.isOpen}>
          {menu}
        </Animate>
      );
    }

    menu = (
      <MenuContext.Provider value={this}>
        {menu}
      </MenuContext.Provider>
    );

    if (!usePortal) {
      return menu;
    }

    const portal = usePortal === true ? document.body : usePortal;

    return createPortal(menu, portal);
  }
}

export const Menu = withInjectables<Dependencies, MenuProps>(NonInjectedMenu, {
  getProps: (di, props) => ({
    ...props,
    requestAnimationFrame: di.inject(requestAnimationFrameInjectable),
  }),
});

export function SubMenu(props: Partial<MenuProps>) {
  const { className, ...menuProps } = props;

  return (
    <Menu
      className={cssNames("SubMenu", className)}
      isOpen
      open={noop}
      close={noop}
      position={{}} // reset position, must be handled in css
      closeOnClickOutside={false}
      closeOnClickItem={false}
      {...menuProps}
    />
  );
}

export interface MenuItemProps extends React.HTMLProps<any> {
  icon?: string | Partial<IconProps>;
  disabled?: boolean;
  active?: boolean;
  spacer?: boolean;
  href?: string;
}

const defaultPropsMenuItem: Partial<MenuItemProps> = {
  onClick: noop,
};

export class MenuItem extends React.Component<MenuItemProps> {
  static defaultProps = defaultPropsMenuItem as object;
  static contextType = MenuContext;

  declare context: MenuContextValue;
  public elem: HTMLElement | null = null;

  constructor(props: MenuItemProps) {
    super(props);
    autoBindReact(this);
  }

  get isFocusable() {
    const { disabled, spacer } = this.props;

    return !(disabled || spacer);
  }

  get isLink() {
    return !!this.props.href;
  }

  onClick(evt: React.MouseEvent) {
    const menu = this.context;
    const { spacer, onClick } = this.props;

    if (spacer) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    onClick!(evt);

    if (menu.props.closeOnClickItem && !evt.defaultPrevented) {
      menu.close();
    }
  }

  protected bindRef(elem: HTMLElement) {
    this.elem = elem;
  }

  render() {
    const { className, disabled, active, spacer, icon, children, ...props } = this.props;
    const iconProps: Partial<IconProps> = {};

    if (icon) {
      if (typeof icon === "string") {
        iconProps.material = icon;
      } else {
        Object.assign(iconProps, icon);
      }
    }

    const elemProps: React.HTMLProps<any> = {
      tabIndex: this.isFocusable ? 0 : -1,
      ...props,
      className: cssNames("MenuItem", className, { disabled, active, spacer }),
      onClick: this.onClick,
      children: icon ? (
        <>
          <Icon {...iconProps}/>
          {" "}
          {children}
        </>
      ) : children,
      ref: this.bindRef,
    };

    if (this.isLink) {
      return <a {...elemProps}/>;
    }

    return <li {...elemProps}/>;
  }
}
