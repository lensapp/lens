import './menu-picker.scss'

import React, { useRef, useState } from "react";
import { cssNames } from "../../utils";
import { Menu, MenuProps } from "./menu";
import { Icon } from "../icon";
import { Button } from "../button";
import uniqueId from "lodash/uniqueId";

interface Props extends Partial<MenuProps> {
  title: React.ReactNode;
  waiting?: boolean;
}

export function MenuPicker(props: Props) {
  const id = useRef(uniqueId("menu_picker_")).current;
  const { className, title, waiting, children, ...menuProps } = props;
  const [isOpen, setOpen] = useState(false);

  const toggle = () => setOpen(!isOpen);

  return (
    <div className={cssNames("MenuPicker", className, { waiting })}>
      <Button primary id={id}>
        {title}
        <Icon material="arrow_drop_down"/>
      </Button>
      <Menu
        htmlFor={id}
        isOpen={isOpen} open={toggle} close={toggle}
        closeOnClickItem={false}
        {...menuProps}
      >
        <div className="menu-header flex gaps">
          <span className="box grow">{title}</span>
          <Icon small material="close" onClick={toggle}/>
        </div>
        {children}
      </Menu>
    </div>
  )
}
