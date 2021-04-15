import "./catalog-add-button.scss";
import React from "react";
import { SpeedDial, SpeedDialAction } from "@material-ui/lab";
import { disposeOnUnmount, observer } from "mobx-react";
import { observable, reaction } from "mobx";
import { autobind } from "../../../common/utils";
import { CatalogCategory, CatalogEntityAddMenuContext, CatalogEntityContextMenu } from "../../api/catalog-entity";
import { EventEmitter } from "events";
import { navigate } from "../../navigation";
import { Add } from "@material-ui/icons";

export type CatalogAddButtonProps = {
  category: CatalogCategory
};

@observer
export class CatalogAddButton extends React.Component<CatalogAddButtonProps> {
  @observable protected isOpen = false;
  protected menuItems = observable.array<CatalogEntityContextMenu>([]);

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.category, (category) => {
        this.menuItems.clear();

        if (category && category instanceof EventEmitter) {
          const context: CatalogEntityAddMenuContext = {
            navigate: (url: string) => navigate(url),
            menuItems: this.menuItems
          };

          category.emit("onCatalogAddMenu", context);
        }
      }, { fireImmediately: true })
    ]);
  }

  @autobind()
  onOpen() {
    this.isOpen = true;
  }

  @autobind()
  onClose() {
    this.isOpen = false;
  }

  render() {
    if (this.menuItems.length === 0) {
      return null;
    }

    return (
      <SpeedDial
        className="CatalogAddButton"
        ariaLabel="SpeedDial CatalogAddButton"
        open={this.isOpen}
        onOpen={this.onOpen}
        onClose={this.onClose}
        icon={<Add />}
        direction="up"
      >
        { this.menuItems.map((menuItem, index) => {
          return <SpeedDialAction
            key={index}
            icon={menuItem.icon}
            tooltipTitle={menuItem.title}
            onClick={() => menuItem.onClick()}
          />;
        })}
      </SpeedDial>
    );
  }
}
