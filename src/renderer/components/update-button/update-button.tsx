/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./styles.module.scss";

import React, { useState } from "react";
import { Icon } from "../icon";
import { Menu, MenuItem } from "../menu";
import uniqueId from "lodash/uniqueId";
import { noop } from "lodash";
import { cssNames } from "../../utils";

interface UpdateButtonProps {
  warningLevel?: "light" | "medium" | "high";
  update: () => void;
}

export function UpdateButton({ warningLevel, update }: UpdateButtonProps) {
  const id = uniqueId("update_button_");
  const [opened, setOpened] = useState(false);

  const onKeyDown = (evt: React.KeyboardEvent<HTMLButtonElement>) => {
    if (evt.code == "Space" || evt.code == "Enter") {
      toggle();
    }
  };

  const toggle = () => {
    setOpened(!opened);
  };

  if (!warningLevel) {
    return null;
  }

  return (
    <>
      <button
        data-testid="update-button"
        id={id}
        className={cssNames(styles.updateButton, {
          [styles.warningHigh]: warningLevel === "high",
          [styles.warningMedium]: warningLevel === "medium",
        })}
        onClick={toggle}
        onKeyDown={onKeyDown}
      >
        Update
        <Icon material="update"/>
      </button>
      <Menu
        usePortal
        htmlFor={id}
        isOpen={opened}
        closeOnClickItem
        closeOnClickOutside
        close={toggle}
        open={noop}
      >
        <MenuItem onClick={update} data-testid="update-lens-menu-item">
          Relaunch to Update Lens
        </MenuItem>
      </Menu>
    </>
  );
}
