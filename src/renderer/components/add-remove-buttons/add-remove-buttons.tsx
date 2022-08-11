/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./add-remove-buttons.scss";

import React from "react";
import { cssNames } from "../../utils";
import { OpenLensButton } from "../button";
import { Icon } from "../icon";

export interface AddRemoveButtonsProps extends React.HTMLAttributes<any> {
  onAdd?: () => void;
  onRemove?: () => void;
  addTooltip?: React.ReactNode;
  removeTooltip?: React.ReactNode;
}

export class AddRemoveButtons extends React.PureComponent<AddRemoveButtonsProps> {
  renderButtons() {
    const { onRemove, onAdd, addTooltip, removeTooltip } = this.props;

    return [
      {
        onClick: onRemove,
        className: "remove-button",
        icon: "remove",
        tooltip: removeTooltip,
      },
      {
        onClick: onAdd,
        className: "add-button",
        icon: "add",
        tooltip: addTooltip,
      },
    ]
      .filter(button => button.onClick)
      .map(({ icon, ...props }) => (
        <OpenLensButton
          key={icon}
          big
          round
          primary
          {...props}
        >
          <Icon material={icon} />
        </OpenLensButton>
      ));
  }

  render() {
    return (
      <div className={cssNames("AddRemoveButtons flex gaps", this.props.className)}>
        {this.renderButtons()}
      </div>
    );
  }
}
