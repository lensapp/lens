import "./add-remove-buttons.scss";

import React from "react";
import { cssNames } from "../../utils";
import { Add, Remove } from "@material-ui/icons";
import { IconButton, Tooltip } from "@material-ui/core";

export interface AddRemoveButtonsProps extends React.HTMLAttributes<any> {
  onAdd?: () => void;
  onRemove?: () => void;
  addTooltip?: React.ReactNode;
  removeTooltip?: React.ReactNode;
}

export class AddRemoveButtons extends React.PureComponent<AddRemoveButtonsProps> {
  renderButtons() {
    const { onRemove, onAdd, addTooltip, removeTooltip } = this.props;
    const buttons = [
      {
        onClick: onRemove,
        className: "remove-button",
        Icon: Remove,
        tooltip: removeTooltip,
      },
      {
        onClick: onAdd,
        className: "add-button",
        Icon: Add,
        tooltip: addTooltip,
      },
    ];

    return buttons.map(button => {
      if (!button.onClick) {
        return null;
      }
      const { onClick, className, Icon, tooltip } = button;

      return (
        <Tooltip key={className} title={tooltip}>
          <IconButton onClick={onClick} className={className}>
            <Icon />
          </IconButton>
        </Tooltip>
      );
    });
  }

  render() {
    return (
      <div className={cssNames("AddRemoveButtons flex gaps", this.props.className)}>
        {this.renderButtons()}
      </div>
    );
  }
}
