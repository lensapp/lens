/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { StrictReactNode } from "@k8slens/utilities";
import type { HTMLAttributes } from "react";
import React, { useState } from "react";
import { Menu } from "../menu";

interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  contentForToggle: StrictReactNode;
  children?: StrictReactNode;
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
        {children}
      </Menu>
    </div>
  );
}
