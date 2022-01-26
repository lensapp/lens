/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { Icon } from "../../icon";

export function ToBottom({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="absolute top-3 right-3 z-10 rounded-md flex align-center px-1.5 py-1.5 pl-3.5"
      style={{ backgroundColor: "var(--blue)" }}
      onClick={evt => {
        evt.currentTarget.blur();
        onClick();
      }}
    >
      To bottom
      <Icon small material="expand_more" />
    </button>
  );
}
