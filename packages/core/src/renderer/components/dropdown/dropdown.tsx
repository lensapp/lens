/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { SafeReactNode } from "@k8slens/utilities";
import { toSafeReactChildrenArray } from "@k8slens/utilities";
import type { HTMLAttributes } from "react";
import React, { useState } from "react";
import { Menu } from "../menu";

interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  contentForToggle: SafeReactNode;
  children?: SafeReactNode;
}

export function Dropdown(props: DropdownProps) {
  const { id, contentForToggle, children, ...rest } = props;
  const [opened, setOpened] = useState(false);

  const toggle = () => {
    setOpened(!opened);
  };

  return (
    <div {...rest}>
      <div id={id}>
        {contentForToggle}
      </div>
      <Menu
        usePortal
        htmlFor={id}
        isOpen={opened}
        close={toggle}
        open={toggle}
      >
        {toSafeReactChildrenArray(children)}
      </Menu>
    </div>
  );
}
