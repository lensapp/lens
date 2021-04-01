import "./landing-page.scss";
import React from "react";
import { observer } from "mobx-react";
import { ItemListLayout } from "../item-object-list";
import { IReactionDisposer, observable, reaction, toJS } from "mobx";
import { CatalogEntityItem, CatalogEntityStore } from "./catalog-entity.store";
import { navigate } from "../../navigation";
import { kebabCase } from "lodash";
import { PageLayout } from "../layout/page-layout";
import { MenuItem, MenuActions } from "../menu";
import { Icon } from "../icon";
import { CatalogEntityContextMenuContext } from "../../api/catalog-entity-registry";
import { Badge } from "../badge";
import { hotbarStore } from "../../../common/hotbar-store";
import { addClusterURL } from "../+add-cluster";
import { autobind } from "../../utils";

enum sortBy {
  name = "name",
  status = "status"
}

@observer
export class LandingPage extends React.Component {
  @observable private catalogEntityStore?: CatalogEntityStore;
  @observable.deep private contextMenu: CatalogEntityContextMenuContext;
  private disposers: IReactionDisposer[] = [];

  componentDidMount() {
    this.contextMenu = {
      menuItems: [],
      navigate: (url: string) => navigate(url)
    };
    this.catalogEntityStore = new CatalogEntityStore();
    this.disposers.push(this.catalogEntityStore.watch());
  }

  componentWillUnmount() {
    this.disposers.forEach((d) => d());
  }

  addToHotbar(item: CatalogEntityItem) {
    const hotbar = hotbarStore.getByName("default"); // FIXME

    if (!hotbar) {
      return;
    }

    hotbar.items.push({ entity: { uid: item.id }});
  }

  removeFromHotbar(item: CatalogEntityItem) {
    const hotbar = hotbarStore.getByName("default"); // FIXME

    if (!hotbar) {
      return;
    }

    hotbar.items = hotbar.items.filter((i) => i.entity.uid !== item.id);
  }

  @autobind()
  renderItemMenu(item: CatalogEntityItem) {
    const onOpen = async () => {
      await item.onContextMenuOpen(this.contextMenu);
    };

    return (
      <MenuActions onOpen={() => onOpen()}>
        <MenuItem key="add-to-hotbar" onClick={() => this.addToHotbar(item) }>
          <Icon material="add" interactive={true} title="Add to hotbar"/> Add to Hotbar
        </MenuItem>
        <MenuItem key="remove-from-hotbar" onClick={() => this.removeFromHotbar(item) }>
          <Icon material="clear" interactive={true} title="Remove from hotbar"/> Remove from Hotbar
        </MenuItem>
        { this.contextMenu.menuItems.map((menuItem) => {
          return (
            <MenuItem key={menuItem.title} onClick={() => menuItem.onClick()}>
              <Icon material={menuItem.icon} interactive={true} title={menuItem.title}/> {menuItem.title}
            </MenuItem>
          );
        })}
      </MenuActions>
    );
  }

  render() {
    if (!this.catalogEntityStore) {
      return null;
    }

    return (
      <PageLayout className="LandingPage">
        <ItemListLayout
          renderHeaderTitle="Catalog"
          isClusterScoped
          isSearchable={true}
          isSelectable={false}
          className="CatalogItemList"
          store={this.catalogEntityStore}
          sortingCallbacks={{
            [sortBy.name]: (item: CatalogEntityItem) => item.name,
            [sortBy.status]: (item: CatalogEntityItem) => item.phase,
          }}
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: sortBy.name },
            { title: "Labels", className: "labels" },
            { title: "Status", className: "status", sortBy: sortBy.status },
          ]}
          renderTableContents={(item: CatalogEntityItem) => [
            item.name,
            item.labels.map((label) => <Badge key={label} label={label} title={label} />),
            { title: item.phase, className: kebabCase(item.phase) }
          ]}
          onDetails={(item: CatalogEntityItem) => item.onRun({ navigate: (url: string) => navigate(url)})}
          renderItemMenu={this.renderItemMenu}
          addRemoveButtons={{
            addTooltip: "Add Kubernetes Cluster",
            onAdd: () => navigate(addClusterURL()),
          }}
        />
      </PageLayout>
    );
  }
}
