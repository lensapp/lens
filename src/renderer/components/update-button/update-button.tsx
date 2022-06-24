/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./styles.module.scss";

import type { HTMLAttributes } from "react";
import React, { useState } from "react";
import { Menu, MenuItem } from "../menu";
import { cssNames, noop } from "../../utils";
import type { IconProps } from "../icon";
import { Icon } from "../icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import updateWarningLevelInjectable from "../../../main/application-update/update-warning-level/update-warning-level.injectable";

interface UpdateButtonProps extends HTMLAttributes<HTMLButtonElement> {
}

interface Dependencies {
  warningLevel: "light" | "medium" | "high" | "";
  update: () => void;
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
});

export const UpdateButton = withInjectables<Dependencies, UpdateButtonProps>(NonInjectedUpdateButton, {
  getProps: (di, props) => {
    const warnignLevel = di.inject(updateWarningLevelInjectable);

    // TODO: quit and install on update();
    const update = noop;

    return {
      ...props,
      warningLevel: warnignLevel.value.get(),
      update,
    };
  },
});
