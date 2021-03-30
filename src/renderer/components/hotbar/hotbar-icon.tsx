import "./hotbar-icon.scss";

import React, { DOMAttributes } from "react";
import { observer } from "mobx-react";
import { cssNames, IClassName } from "../../utils";
import { Tooltip } from "../tooltip";
import { Avatar } from "@material-ui/core";
import { CatalogEntity } from "../../../common/catalog-entity";

interface Props extends DOMAttributes<HTMLElement> {
  entity: CatalogEntity;
  className?: IClassName;
  errorClass?: IClassName;
  isActive?: boolean;
}

@observer
export class HotbarIcon extends React.Component<Props> {
  get iconString() {
    let splittedName = this.props.entity.metadata.name.split(" ");

    if (splittedName.length === 1) {
      splittedName = splittedName[0].split("-");
    }

    if (splittedName.length === 1) {
      splittedName = splittedName[0].split("@");
    }

    splittedName = splittedName.map((part) => part.replace(/\W/g, ""));

    if (splittedName.length === 1) {
      return splittedName[0].substring(0, 2);
    } else {
      return splittedName[0].substring(0, 1) + splittedName[1].substring(0, 1);
    }
  }

  render() {
    const {
      entity, errorClass, isActive,
      children, ...elemProps
    } = this.props;
    const entityIconId = `hotbar-icon-${entity.metadata.uid}`;
    const className = cssNames("HotbarIcon flex inline", this.props.className, {
      interactive: true,
      active: isActive,
    });

    return (
      <div {...elemProps} className={className} id={entityIconId}>
        <Tooltip targetId={entityIconId}>{entity.metadata.name}</Tooltip>
        <Avatar variant="square" className={isActive ? "active" : "default"}>{this.iconString}</Avatar>
        {children}
      </div>
    );
  }
}
