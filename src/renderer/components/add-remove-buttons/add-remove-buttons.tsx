/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./add-remove-buttons.scss";

import React from "react";
import { cssNames } from "../../utils";
import { Button } from "../button";
import { Icon } from "../icon";

export interface AddRemoveButtonsProps {
  onAdd?: () => void;
  onRemove?: () => void;
  addTooltip?: React.ReactNode;
  removeTooltip?: React.ReactNode;
  className?: string;
  "data-testid"?: string;
}

export const AddRemoveButtons = ({
  onRemove,
  onAdd,
  addTooltip,
  removeTooltip,
  className,
  "data-testid": dataTestid,
}: AddRemoveButtonsProps) => (
  <div className={cssNames("AddRemoveButtons flex gaps", className)}>
    {onRemove && (
      <Button
        big
        round
        primary
        className="remove-button"
        tooltip={removeTooltip}
        onClick={onRemove}
        data-testid={dataTestid && `${dataTestid}-remove-button`}
      >
        <Icon material="remove" />
      </Button>
    )}
    {onAdd && (
      <Button
        big
        round
        primary
        className="add-button"
        tooltip={addTooltip}
        onClick={onAdd}
        data-testid={dataTestid && `${dataTestid}-add-button`}
      >
        <Icon material="add" />
      </Button>
    )}
  </div>
);
