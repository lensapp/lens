import "./landing-page.scss";
import React from "react";
import { observer } from "mobx-react";
import { ItemListLayout } from "../item-object-list";
import { IReactionDisposer, observable } from "mobx";
import { CatalogEntityItem, CatalogEntityStore } from "./catalog-entity.store";
import { navigate } from "../../navigation";
import { kebabCase } from "lodash";
import { PageLayout } from "../layout/page-layout";
import { MenuItem, MenuActions } from "../menu";
import { Icon } from "../icon";
import { CatalogEntityContextMenuContext } from "../../api/catalog-entity-registry";
import { Badge } from "../badge";

enum sortBy {
  name = "name",
  status = "status"
}

@observer
export class LandingPage extends React.Component {
  @observable private catalogEntityStore?: CatalogEntityStore;
  private disposers: IReactionDisposer[] = [];

  componentDidMount() {
    this.catalogEntityStore = new CatalogEntityStore();
    this.disposers.push(this.catalogEntityStore.watch());
  }

  componentWillUnmount() {
    this.disposers.forEach((d) => d());
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
          renderItemMenu={(item: CatalogEntityItem) => {
            const menuOpenContext: CatalogEntityContextMenuContext = {
              menuItems: [],
              navigate: (url: string) => navigate(url)
            };

            item.onContextMenuOpen(menuOpenContext);

            return (
              <MenuActions>
                { menuOpenContext.menuItems.map((menuItem) => {
                  return (
                    <MenuItem key={menuItem.title} onClick={() => menuItem.onClick()}>
                      <Icon material={menuItem.icon} interactive={true} title={menuItem.title}/> {menuItem.title}
                    </MenuItem>
                  );
                })}
              </MenuActions>
            );
          }}
        />
      </PageLayout>
    );
  }
}
