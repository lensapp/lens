import "./hotbar-menu.scss";
import "./hotbar.commands";

import React, { ReactNode } from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { HotbarIcon } from "./hotbar-icon";
import { cssNames, cssVar, IClassName } from "../../utils";
import { catalogEntityRegistry } from "../../api/catalog-entity-registry";
import { HotbarItem, HotbarStore } from "../../../common/hotbar-store";
import { catalogEntityRunContext } from "../../api/catalog-entity";
import { Icon } from "../icon";
import { Badge } from "../badge";
import { CommandOverlay } from "../command-palette";
import { HotbarSwitchCommand } from "./hotbar-switch-command";
import { action, reaction } from "mobx";

interface Props {
  className?: IClassName;
}

@observer
export class HotbarMenu extends React.Component<Props> {
  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.hotbar, () => this.createInitialCells(), { fireImmediately: true })
    ]);
  }

  get hotbar() {
    return HotbarStore.getInstance().getActive();
  }

  getEntity(item: HotbarItem) {
    const hotbar = HotbarStore.getInstance().getActive();

    if (!hotbar) {
      return null;
    }

    return item ? catalogEntityRegistry.items.find((entity) => entity.metadata.uid === item.entity.uid) : null;
  }

  previous() {
    HotbarStore.getInstance().switchToPrevious();
  }

  next() {
    HotbarStore.getInstance().switchToNext();
  }

  openSelector() {
    CommandOverlay.open(<HotbarSwitchCommand />);
  }

  @action
  createInitialCells() {
    if (this.hotbar.items.length) {
      return;
    }

    const element = document.querySelector<HTMLDivElement>(".HotbarItems");
    const height = element.offsetHeight;
    const cellHeight = cssVar(element).get("--cellHeight").toString();
    const cellsFit = Math.floor(height / parseInt(cellHeight)) - 1;

    this.hotbar.items = [...Array.from(Array(cellsFit).fill(null))];
  }

  renderGrid() {
    if (!this.hotbar.items.length) return;

    return this.hotbar.items.map((item, index) => {
      const entity = this.getEntity(item);

      return (
        <HotbarCell key={index}>
          {entity && (
            <HotbarIcon
              key={index}
              index={index}
              entity={entity}
              isActive={entity.status.active}
              onClick={() => entity.onRun(catalogEntityRunContext)}
            />
          )}
        </HotbarCell>
      );
    });
  }

  renderAddCellButton() {
    return (
      <button className="AddCellButton">
        <Icon material="add"/>
      </button>
    );
  }

  render() {
    const { className } = this.props;
    const hotbarIndex = HotbarStore.getInstance().activeHotbarIndex + 1;

    return (
      <div className={cssNames("HotbarMenu flex column", className)}>
        <div className="HotbarItems flex column gaps">
          {this.renderGrid()}
          {this.renderAddCellButton()}
        </div>
        <div className="HotbarSelector flex gaps auto">
          <Icon material="chevron_left" className="previous box" onClick={() => this.previous()} />
          <div className="box">
            <Badge small label={hotbarIndex} onClick={() => this.openSelector()} />
          </div>
          <Icon material="chevron_right" className="next box" onClick={() => this.next()} />
        </div>
      </div>
    );
  }
}

interface HotbarCellProps {
  children?: ReactNode;
}

function HotbarCell(props: HotbarCellProps) {
  return (
    <div className="HotbarCell">{props.children}</div>
  );
}
