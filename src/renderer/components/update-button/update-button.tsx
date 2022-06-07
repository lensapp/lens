/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./styles.module.scss";

import type { HTMLAttributes } from "react";
import React, { useState } from "react";
import { Menu, MenuItem } from "../menu";
import { cssNames } from "../../utils";
import type { IconProps } from "../icon";
import { Icon } from "../icon";

interface UpdateButtonProps extends HTMLAttributes<HTMLButtonElement> {
  warningLevel?: "light" | "medium" | "high";
  update: () => void;
}

export function UpdateButton({ warningLevel, update, id }: UpdateButtonProps) {
  const buttonId = id ?? "update-lens-button";
  const menuIconProps: IconProps = { material: "update", small: true };
  const [opened, setOpened] = useState(false);

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
        data-warning-level={warningLevel}
        id={buttonId}
        className={cssNames(styles.updateButton, {
          [styles.warningHigh]: warningLevel === "high",
          [styles.warningMedium]: warningLevel === "medium",
        })}
      >
        Update
        <Icon material="arrow_drop_down" className={styles.icon}/>
      </button>
      <Menu
        usePortal
        htmlFor={buttonId}
        isOpen={opened}
        close={toggle}
        open={toggle}
      >
        <MenuItem
          icon={menuIconProps}
          onClick={update}
          data-testid="update-lens-menu-item"
        >
          Relaunch to Update Lens
        </MenuItem>
      </Menu>
    </>
  );
}
