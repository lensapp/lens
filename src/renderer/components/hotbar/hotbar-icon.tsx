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

import "./hotbar-icon.scss";

import React, { DOMAttributes, useState } from "react";
import { Avatar } from "@material-ui/core";
import randomColor from "randomcolor";
import GraphemeSplitter from "grapheme-splitter";

import { CatalogEntityContextMenu } from "../../../common/catalog";
import { cssNames, IClassName, iter } from "../../utils";
import { ConfirmDialog } from "../confirm-dialog";
import { Icon } from "../icon";
import { Menu, MenuItem } from "../menu";
import { MaterialTooltip } from "../+catalog/material-tooltip/material-tooltip";

interface Props extends DOMAttributes<HTMLElement> {
  uid: string;
  title: string;
  source: string;
  remove: (uid: string) => void;
  onMenuOpen?: () => void;
  className?: IClassName;
  active?: boolean;
  menuItems?: CatalogEntityContextMenu[];
  disabled?: boolean;
}

function generateAvatarStyle(seed: string): React.CSSProperties {
  return {
    "backgroundColor": randomColor({ seed, luminosity: "dark" })
  };
}

function onMenuItemClick(menuItem: CatalogEntityContextMenu) {
  if (menuItem.confirm) {
    ConfirmDialog.open({
      okButtonProps: {
        primary: false,
        accent: true,
      },
      ok: () => {
        menuItem.onClick();
      },
      message: menuItem.confirm.message
    });
  } else {
    menuItem.onClick();
  }
}

function getNameParts(name: string): string[] {
  const byWhitespace = name.split(/\s+/);

  if (byWhitespace.length > 1) {
    return byWhitespace;
  }

  const byDashes = name.split(/[-_]+/);

  if (byDashes.length > 1) {
    return byDashes;
  }

  return name.split(/@+/);
}

export function HotbarIcon(props: Props) {
  const { uid, title, className, source, active, remove, disabled, menuItems, onMenuOpen, children, ...rest } = props;
  const id = `hotbarIcon-${uid}`;
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const getIconString = () => {
    const [rawFirst, rawSecond, rawThird] = getNameParts(title);
    const splitter = new GraphemeSplitter();
    const first = splitter.iterateGraphemes(rawFirst);
    const second = rawSecond ? splitter.iterateGraphemes(rawSecond): first;
    const third = rawThird ? splitter.iterateGraphemes(rawThird) : iter.newEmpty();

    return [
      ...iter.take(first, 1),
      ...iter.take(second, 1),
      ...iter.take(third, 1),
    ].filter(Boolean).join("");
  };

  return (
    <div className={cssNames("HotbarIcon flex inline", className, { disabled })}>
      <MaterialTooltip title={`${title} (${source})`} placement="right">
        <div id={id}>
          <Avatar
            {...rest}
            variant="square"
            className={active ? "active" : "default"}
            style={generateAvatarStyle(`${title}-${source}`)}
          >
            {getIconString()}
          </Avatar>
          {children}
        </div>
      </MaterialTooltip>
      <Menu
        usePortal
        htmlFor={id}
        className="HotbarIconMenu"
        isOpen={menuOpen}
        toggleEvent="contextmenu"
        position={{right: true, bottom: true }} // FIXME: position does not work
        open={() => {
          onMenuOpen?.();
          toggleMenu();
        }}
        close={() => toggleMenu()}>
        <MenuItem key="remove-from-hotbar" onClick={(evt) => {
          evt.stopPropagation();
          remove(uid);
        }}>
          <Icon material="clear" small interactive={true} title="Remove from hotbar"/> Remove from Hotbar
        </MenuItem>
        { menuItems.map((menuItem) => {
          return (
            <MenuItem key={menuItem.title} onClick={() => onMenuItemClick(menuItem) }>
              <Icon material={menuItem.icon} small interactive={true} title={menuItem.title}/> {menuItem.title}
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
}

HotbarIcon.defaultProps = {
  menuItems: []
};
