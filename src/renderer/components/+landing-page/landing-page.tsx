import "./landing-page.scss";
import React from "react";
import { observer } from "mobx-react";
import { ItemListLayout } from "../item-object-list";
import { IReactionDisposer, observable } from "mobx";
import { CatalogEntityItem, CatalogEntityStore } from "./catalog-entity.store";
import { navigate } from "../../navigation";
import { kebabCase } from "lodash";
import { PageLayout } from "../layout/page-layout";

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
            { title: "Status", className: "status", sortBy: sortBy.status },
          ]}
          renderTableContents={(item: CatalogEntityItem) => [
            item.name,
            { title: item.phase, className: kebabCase(item.phase) }
          ]}
          onDetails={(item: CatalogEntityItem) => item.onRun({ navigate: (url: string) => navigate(url)})}
        />
      </PageLayout>
    );
  }
}
