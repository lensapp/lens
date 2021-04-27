import "./catalog.scss";
import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { ItemListLayout } from "../item-object-list";
import { action, observable, reaction } from "mobx";
import { CatalogEntityItem, CatalogEntityStore } from "./catalog-entity.store";
import { navigate } from "../../navigation";
import { kebabCase } from "lodash";
import { PageLayout } from "../layout/page-layout";
import { MenuItem, MenuActions } from "../menu";
import { Icon } from "../icon";
import { CatalogEntityContextMenu, CatalogEntityContextMenuContext, catalogEntityRunContext } from "../../api/catalog-entity";
import { Badge } from "../badge";
import { HotbarStore } from "../../../common/hotbar-store";
import { autobind } from "../../utils";
import { ConfirmDialog } from "../confirm-dialog";
import { Tab, Tabs } from "../tabs";
import { catalogCategoryRegistry } from "../../../common/catalog";
import { CatalogAddButton } from "./catalog-add-button";

enum sortBy {
  name = "name",
  source = "source",
  status = "status"
}
@observer
export class Catalog extends React.Component {
  @observable private catalogEntityStore?: CatalogEntityStore;
  @observable.deep private contextMenu: CatalogEntityContextMenuContext;
  @observable activeTab: string;

  async componentDidMount() {
    this.contextMenu = {
      menuItems: [],
      navigate: (url: string) => navigate(url)
    };
    this.catalogEntityStore = new CatalogEntityStore();
    disposeOnUnmount(this, [
      this.catalogEntityStore.watch(),
      reaction(() => catalogCategoryRegistry.items, (items) => {
        if (!this.activeTab && items.length > 0) {
          this.activeTab = items[0].getId();
          this.catalogEntityStore.activeCategory = items[0];
        }
      }, { fireImmediately: true })
    ]);
  }

  addToHotbar(item: CatalogEntityItem): void {
    HotbarStore.getInstance().addToHotbar(item);
  }

  onDetails(item: CatalogEntityItem) {
    item.onRun(catalogEntityRunContext);
  }

  onMenuItemClick(menuItem: CatalogEntityContextMenu) {
    if (menuItem.confirm) {
      ConfirmDialog.open({
        okButtonProps: {
          primary: false,
          accent: true,
        },
        ok: () => {
          menuItem.onClick();
        },
        message: menuItem.confirm.message
      });
    } else {
      menuItem.onClick();
    }
  }

  get categories() {
    return catalogCategoryRegistry.items;
  }

  @action
  onTabChange = (tabId: string) => {
    this.activeTab = tabId;

    const activeCategory = this.categories.find((category) => category.getId() === tabId);

    if (activeCategory) {
      this.catalogEntityStore.activeCategory = activeCategory;
    }
  };

  renderNavigation() {
    return (
      <Tabs className="flex column" scrollable={false} onChange={this.onTabChange} value={this.activeTab}>
        <div className="sidebarHeader">Catalog</div>
        <div className="sidebarTabs">
          { this.categories.map((category, index) => {
            return <Tab value={category.getId()} key={index} label={category.metadata.name} data-testid={`${category.getId()}-tab`} />;
          })}
        </div>
      </Tabs>
    );
  }

  @autobind()
  renderItemMenu(item: CatalogEntityItem) {
    const menuItems = this.contextMenu.menuItems.filter((menuItem) => !menuItem.onlyVisibleForSource || menuItem.onlyVisibleForSource === item.entity.metadata.source);
    const onOpen = async () => {
      await item.onContextMenuOpen(this.contextMenu);
    };

    return (
      <MenuActions onOpen={() => onOpen()}>
        <MenuItem key="add-to-hotbar" onClick={() => this.addToHotbar(item) }>
          <Icon material="add" small interactive={true} title="Add to hotbar"/> Add to Hotbar
        </MenuItem>
        { menuItems.map((menuItem, index) => {
          return (
            <MenuItem key={index} onClick={() => this.onMenuItemClick(menuItem)}>
              <Icon material={menuItem.icon} small interactive={true} title={menuItem.title}/> {menuItem.title}
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
      <PageLayout
        className="CatalogPage"
        navigation={this.renderNavigation()}
        provideBackButtonNavigation={false}
        contentGaps={false}>
        <ItemListLayout
          renderHeaderTitle={this.catalogEntityStore.activeCategory?.metadata.name}
          isClusterScoped
          isSearchable={true}
          isSelectable={false}
          className="CatalogItemList"
          store={this.catalogEntityStore}
          tableId="catalog-items"
          sortingCallbacks={{
            [sortBy.name]: (item: CatalogEntityItem) => item.name,
            [sortBy.source]: (item: CatalogEntityItem) => item.source,
            [sortBy.status]: (item: CatalogEntityItem) => item.phase,
          }}
          searchFilters={[
            (entity: CatalogEntityItem) => entity.searchFields,
          ]}
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: sortBy.name },
            { title: "Source", className: "source", sortBy: sortBy.source },
            { title: "Labels", className: "labels" },
            { title: "Status", className: "status", sortBy: sortBy.status },
          ]}
          renderTableContents={(item: CatalogEntityItem) => [
            item.name,
            item.source,
            item.labels.map((label) => <Badge key={label} label={label} title={label} />),
            { title: item.phase, className: kebabCase(item.phase) }
          ]}
          onDetails={(item: CatalogEntityItem) => this.onDetails(item) }
          renderItemMenu={this.renderItemMenu}
        />
        <CatalogAddButton category={this.catalogEntityStore.activeCategory} />
      </PageLayout>
    );
  }
}
