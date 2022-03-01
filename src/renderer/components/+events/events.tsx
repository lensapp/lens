/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./events.scss";

import React, { Fragment } from "react";
import { computed, observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { orderBy } from "lodash";
import { TabLayout } from "../layout/tab-layout";
import { EventStore, eventStore } from "./event.store";
import { KubeObjectListLayout, KubeObjectListLayoutProps } from "../kube-object-list-layout";
import type { KubeEvent } from "../../../common/k8s-api/endpoints/events.api";
import type { TableSortCallbacks, TableSortParams } from "../table";
import type { HeaderCustomizer } from "../item-object-list";
import { Tooltip } from "../tooltip";
import { Link } from "react-router-dom";
import { cssNames, IClassName, stopPropagation } from "../../utils";
import { Icon } from "../icon";
import { eventsURL } from "../../../common/routes";
import { getDetailsUrl } from "../kube-detail-params";
import { apiManager } from "../../../common/k8s-api/api-manager";

enum columnId {
  message = "message",
  namespace = "namespace",
  object = "object",
  type = "type",
  count = "count",
  source = "source",
  age = "age",
  lastSeen = "last-seen",
}

export interface EventsProps extends Partial<KubeObjectListLayoutProps<KubeEvent>> {
  className?: IClassName;
  compact?: boolean;
  compactLimit?: number;
}

const defaultProps: Partial<EventsProps> = {
  compactLimit: 10,
};

@observer
export class Events extends React.Component<EventsProps> {
  static defaultProps = defaultProps as object;
  now = Date.now();

  @observable sorting: TableSortParams = {
    sortBy: columnId.age,
    orderBy: "asc",
  };

  private sortingCallbacks: TableSortCallbacks<KubeEvent> = {
    [columnId.namespace]: event => event.getNs(),
    [columnId.type]: event => event.type,
    [columnId.object]: event => event.involvedObject.name,
    [columnId.count]: event => event.count,
    [columnId.age]: event => event.getTimeDiffFromNow(),
    [columnId.lastSeen]: event => this.now - new Date(event.lastTimestamp).getTime(),
  };

  constructor(props: EventsProps) {
    super(props);
    makeObservable(this);
  }

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

  customizeHeader: HeaderCustomizer = ({ info, title, ...headerPlaceholders }) => {
    const { compact } = this.props;
    const { store, items, visibleItems } = this;
    const allEventsAreShown = visibleItems.length === items.length;

    // handle "compact"-mode header
    if (compact) {
      if (allEventsAreShown) {
        return { title };
      }

      return {
        title,
        info: <span> ({visibleItems.length} of <Link to={eventsURL()}>{items.length}</Link>)</span>,
      };
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
      </>,
      title,
      ...headerPlaceholders,
    };
  };

  render() {
    const { store } = this;
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
        getItems={() => this.visibleItems}
        virtual={!compact}
        tableProps={{
          sortSyncWithUrl: false,
          sortByDefault: this.sorting,
          onSort: params => this.sorting = params,
        }}
        sortingCallbacks={this.sortingCallbacks}
        searchFilters={[
          event => event.getSearchFields(),
          event => event.message,
          event => event.getSource(),
          event => event.involvedObject.name,
        ]}
        renderTableHeader={[
          { title: "Type", className: "type", sortBy: columnId.type, id: columnId.type },
          { title: "Message", className: "message", id: columnId.message },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Involved Object", className: "object", sortBy: columnId.object, id: columnId.object },
          { title: "Source", className: "source", id: columnId.source },
          { title: "Count", className: "count", sortBy: columnId.count, id: columnId.count },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          { title: "Last Seen", className: "last-seen", sortBy: columnId.lastSeen, id: columnId.lastSeen },
        ]}
        renderTableContents={event => {
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
              ),
            },
            event.getNs(),
            <Link key="link" to={getDetailsUrl(apiManager.lookupApiLink(involvedObject, event))} onClick={stopPropagation}>
              {involvedObject.kind}: {involvedObject.name}
            </Link>,
            event.getSource(),
            event.count,
            event.getAge(),
            event.getLastSeenTime(),
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
