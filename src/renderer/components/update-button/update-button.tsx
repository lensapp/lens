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
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import appUpdateWarningLevelInjectable from "../../app-update-warning/app-update-warning-level.injectable";
import type { IComputedValue } from "mobx";

interface UpdateButtonProps extends HTMLAttributes<HTMLButtonElement> {
  update: () => void;
}

interface Dependencies {
  warningLevel?: IComputedValue<"light" | "medium" | "high" | "">;
}

export const NonInjectedUpdateButton = observer(({ warningLevel, update, id }: UpdateButtonProps & Dependencies) => {
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
          [styles.warningHigh]: warningLevel.get() === "high",
          [styles.warningMedium]: warningLevel.get() === "medium",
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
});

export const UpdateButton = withInjectables<Dependencies, UpdateButtonProps>(NonInjectedUpdateButton, {
  getProps: (di, props) => {
    return {
      ...props,
      warningLevel: di.inject(appUpdateWarningLevelInjectable),
    };
  },
});
