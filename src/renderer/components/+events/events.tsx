import "./events.scss";

import React, { Fragment } from "react";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import { orderBy } from "lodash";
import { TabLayout } from "../layout/tab-layout";
import { EventStore, eventStore } from "./event.store";
import { getDetailsUrl, KubeObjectListLayout, KubeObjectListLayoutProps } from "../kube-object";
import { KubeEvent } from "../../api/endpoints/events.api";
import { TableSortCallbacks, TableSortParams, TableProps } from "../table";
import { IHeaderPlaceholders } from "../item-object-list";
import { Tooltip } from "../tooltip";
import { Link } from "react-router-dom";
import { cssNames, IClassName, stopPropagation } from "../../utils";
import { Icon } from "../icon";
import { lookupApiLink } from "../../api/kube-api";
import { eventsURL } from "./events.route";

enum columnId {
  message = "message",
  namespace = "namespace",
  object = "object",
  type = "type",
  count = "count",
  source = "source",
  age = "age",
}

interface Props extends Partial<KubeObjectListLayoutProps> {
  className?: IClassName;
  compact?: boolean;
  compactLimit?: number;
}

const defaultProps: Partial<Props> = {
  compactLimit: 10,
};

@observer
export class Events extends React.Component<Props> {
  static defaultProps = defaultProps as object;

  @observable sorting: TableSortParams = {
    sortBy: columnId.age,
    orderBy: "asc",
  };

  private sortingCallbacks: TableSortCallbacks = {
    [columnId.namespace]: (event: KubeEvent) => event.getNs(),
    [columnId.type]: (event: KubeEvent) => event.type,
    [columnId.object]: (event: KubeEvent) => event.involvedObject.name,
    [columnId.count]: (event: KubeEvent) => event.count,
    [columnId.age]: (event: KubeEvent) => event.getTimeDiffFromNow(),
  };

  private tableConfiguration: TableProps = {
    sortSyncWithUrl: false,
    sortByDefault: this.sorting,
    onSort: params => this.sorting = params,
  };

  get store(): EventStore {
    return eventStore;
  }

  @computed get items(): KubeEvent[] {
    const items = this.store.contextItems;
    const { sortBy, orderBy: order } = this.sorting;

    // we must sort items before passing to "KubeObjectListLayout -> Table"
    // to make it work with "compact=true" (proper table sorting actions + initial items)
    return orderBy(items, this.sortingCallbacks[sortBy], order as any);
  }

  @computed get visibleItems(): KubeEvent[] {
    const { compact, compactLimit } = this.props;

    if (compact) {
      return this.items.slice(0, compactLimit);
    }

    return this.items;
  }

  customizeHeader = ({ info, title }: IHeaderPlaceholders) => {
    const { compact } = this.props;
    const { store, items, visibleItems } = this;
    const allEventsAreShown = visibleItems.length === items.length;

    // handle "compact"-mode header
    if (compact) {
      if (allEventsAreShown) return title; // title == "Events"

      return <>
        {title}
        <span> ({visibleItems.length} of <Link to={eventsURL()}>{items.length}</Link>)</span>
      </>;
    }

    return {
      info: <>
        {info}
        <Icon
          small
          material="help_outline"
          className="help-icon"
          tooltip={`Limited to ${store.limit}`}
        />
      </>
    };
  };

  render() {
    const { store, visibleItems } = this;
    const { compact, compactLimit, className, ...layoutProps } = this.props;

    const events = (
      <KubeObjectListLayout
        {...layoutProps}
        isConfigurable
        tableId="events"
        store={store}
        className={cssNames("Events", className, { compact })}
        renderHeaderTitle="Events"
        customizeHeader={this.customizeHeader}
        isSelectable={false}
        items={visibleItems}
        virtual={!compact}
        tableProps={this.tableConfiguration}
        sortingCallbacks={this.sortingCallbacks}
        searchFilters={[
          (event: KubeEvent) => event.getSearchFields(),
          (event: KubeEvent) => event.message,
          (event: KubeEvent) => event.getSource(),
          (event: KubeEvent) => event.involvedObject.name,
        ]}
        renderTableHeader={[
          { title: "Type", className: "type", sortBy: columnId.type, id: columnId.type },
          { title: "Message", className: "message", id: columnId.message },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Involved Object", className: "object", sortBy: columnId.object, id: columnId.object },
          { title: "Source", className: "source", id: columnId.source },
          { title: "Count", className: "count", sortBy: columnId.count, id: columnId.count },
          { title: "Last Seen", className: "age", sortBy: columnId.age, id: columnId.age },
        ]}
        renderTableContents={(event: KubeEvent) => {
          const { involvedObject, type, message } = event;
          const tooltipId = `message-${event.getId()}`;
          const isWarning = event.isWarning();

          return [
            type, // type of event: "Normal" or "Warning"
            {
              className: { warning: isWarning },
              title: (
                <Fragment>
                  <span id={tooltipId}>{message}</span>
                  <Tooltip targetId={tooltipId} formatters={{ narrow: true, warning: isWarning }}>
                    {message}
                  </Tooltip>
                </Fragment>
              )
            },
            event.getNs(),
            <Link key="link" to={getDetailsUrl(lookupApiLink(involvedObject, event))} onClick={stopPropagation}>
              {involvedObject.kind}: {involvedObject.name}
            </Link>,
            event.getSource(),
            event.count,
            event.getAge(),
          ];
        }}
      />
    );

    if (compact) {
      return events;
    }

    return (
      <TabLayout>
        {events}
      </TabLayout>
    );
  }
}
