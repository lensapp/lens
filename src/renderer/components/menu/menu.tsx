import './menu.scss'

import React, { Fragment, ReactElement, ReactNode } from "react";
import { createPortal } from "react-dom";
import { autobind, cssNames, noop } from "../../utils";
import { Animate } from "../animate";
import { Icon, IconProps } from "../icon";
import debounce from "lodash/debounce"

export const MenuContext = React.createContext<MenuContextValue>(null);
export type MenuContextValue = Menu;

export interface MenuPosition {
  left?: boolean;
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
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
  children?: ReactNode;
}

interface State {
  position?: MenuPosition;
}

const defaultPropsMenu: Partial<MenuProps> = {
  position: { right: true, bottom: true },
  autoFocus: false,
  usePortal: false,
  closeOnClickItem: true,
  closeOnClickOutside: true,
  closeOnScroll: false,
};

@autobind()
export class Menu extends React.Component<MenuProps, State> {
  static defaultProps = defaultPropsMenu as object;

  public opener: HTMLElement;
  public elem: HTMLUListElement;
  protected items: { [index: number]: MenuItem } = {};

  public state: State = {};

  get isOpen() {
    return !!this.props.isOpen;
  }

  componentDidMount() {
    if (!this.props.usePortal) {
      const parent = this.elem.parentElement;
      const position = window.getComputedStyle(parent).position;
      if (position === 'static') parent.style.position = 'relative';
    } else if (this.isOpen) {
      this.refreshPosition();
    }
    this.opener = document.getElementById(this.props.htmlFor); // might not exist in sub-menus
    if (this.opener) {
      this.opener.addEventListener('click', this.toggle);
      this.opener.addEventListener('keydown', this.onKeyDown);
    }
    this.elem.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('click', this.onClickOutside, true);
    window.addEventListener('scroll', this.onScrollOutside, true);
  }

  componentWillUnmount() {
    if (this.opener) {
      this.opener.removeEventListener('click', this.toggle);
      this.opener.removeEventListener('keydown', this.onKeyDown);
    }
    this.elem.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('click', this.onClickOutside, true);
    window.removeEventListener('scroll', this.onScrollOutside, true);
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
      nextItem.elem.focus();
    } else {
      items[0].elem.focus();
    }
  }

  refreshPosition = debounce(() => {
    if (!this.props.usePortal || !this.opener) return;
    const { width, height } = this.opener.getBoundingClientRect();
    let { left, top, bottom, right } = this.opener.getBoundingClientRect();
    const withScroll = window.getComputedStyle(this.elem).position !== "fixed";

    // window global scroll corrections
    if (withScroll) {
      left += window.pageXOffset;
      top += window.pageYOffset;
      right = left + width;
      bottom = top + height;
    }

    // setup initial position
    const position: MenuPosition = { left: true, bottom: true };
    this.elem.style.left = left + "px"
    this.elem.style.top = bottom + "px"

    // correct position if menu doesn't fit to viewport
    const menuPos = this.elem.getBoundingClientRect();
    if (menuPos.right > window.innerWidth) {
      this.elem.style.left = (right - this.elem.offsetWidth) + "px";
      position.right = true;
      delete position.left;
    }
    if (menuPos.bottom > window.innerHeight) {
      this.elem.style.top = (top - this.elem.offsetHeight) + "px";
      position.top = true;
      delete position.bottom;
    }
    this.setState({ position });
  }, Animate.VISIBILITY_DELAY_MS);

  open() {
    if (this.isOpen) return;
    this.props.open();
    this.refreshPosition();
    if (this.props.autoFocus) this.focusNextItem();
  }

  close() {
    if (!this.isOpen) return;
    this.props.close();
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  onKeyDown(evt: KeyboardEvent) {
    if (!this.isOpen) return;
    switch (evt.code) {
    case "Escape":
      this.close();
      break;

    case "Space":
    case "Enter":
      const focusedItem = this.focusedItem;
      if (focusedItem) {
        focusedItem.elem.click();
        evt.preventDefault();
      }
      break;

    case "ArrowUp":
      this.focusNextItem(true);
      break;
    case "ArrowDown":
      this.focusNextItem();
      break;
    }
  }

  onWindowResize(evt: UIEvent) {
    if (!this.isOpen) return;
    this.refreshPosition();
  }

  onScrollOutside(evt: UIEvent) {
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
    const clickInsideMenu = this.elem.contains(target);
    const clickOnOpener = this.opener && this.opener.contains(target);
    if (!clickInsideMenu && !clickOnOpener) {
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
    const { position, id } = this.props;
    let { className, usePortal } = this.props;
    className = cssNames('Menu', className, this.state.position || position, {
      portal: usePortal,
    });

    let children = this.props.children as ReactElement<any>;
    if (children.type === Fragment) {
      children = children.props.children;
    }
    const menuItems = React.Children.toArray(children).map((item: ReactElement<MenuItemProps>, index) => {
      if (item.type === MenuItem) {
        return React.cloneElement(item, {
          ref: (item: MenuItem) => this.bindItemRef(item, index)
        });
      }
      return item;
    });

    const menu = (
      <MenuContext.Provider value={this}>
        <Animate enter={this.isOpen}>
          <ul id={id} className={className} ref={this.bindRef}>
            {menuItems}
          </ul>
        </Animate>
      </MenuContext.Provider>
    );
    if (usePortal === true) usePortal = document.body;
    return usePortal instanceof HTMLElement ? createPortal(menu, usePortal) : menu;
  }
}

export function SubMenu(props: Partial<MenuProps>) {
  const { className, ...menuProps } = props;
  return (
    <Menu
      className={cssNames("SubMenu", className)}
      isOpen open={noop} close={noop}
      position={{}} // reset position, must be handled in css
      closeOnClickOutside={false}
      closeOnClickItem={false}
      {...menuProps}
    />
  )
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

@autobind()
export class MenuItem extends React.Component<MenuItemProps> {
  static defaultProps = defaultPropsMenuItem as object;
  static contextType = MenuContext;

  public context: MenuContextValue;
  public elem: HTMLElement;

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
    onClick(evt);
    if (menu.props.closeOnClickItem && !evt.defaultPrevented) {
      menu.close();
    }
  }

  protected bindRef(elem: HTMLElement) {
    this.elem = elem;
  }

  render() {
    const { className, disabled, active, spacer, icon, children, ...props } = this.props;
    let iconProps: Partial<IconProps>;
    if (icon) {
      iconProps = {};
      if (typeof icon === "string") iconProps.material = icon;
      else Object.assign(iconProps, icon);
    }
    const elemProps: React.HTMLProps<any> = {
      tabIndex: this.isFocusable ? 0 : -1,
      ...props,
      className: cssNames("MenuItem", className, { disabled, active, spacer }),
      onClick: this.onClick,
      children: icon ? <><Icon {...iconProps}/> {children}</> : children,
      ref: this.bindRef,
    }
    if (this.isLink) {
      return <a {...elemProps}/>
    }
    return <li {...elemProps}/>
  }
}
