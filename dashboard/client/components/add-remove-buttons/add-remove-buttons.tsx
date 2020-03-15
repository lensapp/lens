import "./add-remove-buttons.scss";

import * as React from "react";
import { cssNames } from "../../utils";
import { Button } from "../button";
import { Icon } from "../icon";

export interface AddRemoveButtonsProps extends React.HTMLAttributes<any> {
  onAdd?: () => void;
  onRemove?: () => void;
  addTooltip?: React.ReactNode;
  removeTooltip?: React.ReactNode;
}

export class AddRemoveButtons extends React.PureComponent<AddRemoveButtonsProps> {
  renderButtons() {
    const { onRemove, onAdd, addTooltip, removeTooltip } = this.props
    const buttons = [
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
    ];
    return buttons.map(button => {
      if (!button.onClick) {
        return null;
      }
      const { onClick, className, icon, tooltip } = button
      return (
        <Button key={icon} big round primary onClick={onClick} className={className} tooltip={tooltip}>
          <Icon material={icon}/>
        </Button>
      )
    })
  }

  render() {
    return (
      <div className={cssNames("AddRemoveButtons flex gaps", this.props.className)}>
        {this.renderButtons()}
      </div>
    )
  }
}
