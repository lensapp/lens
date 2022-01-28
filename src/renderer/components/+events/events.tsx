/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./events.scss";

import React, { Fragment, useState } from "react";
import { action, observable } from "mobx";
import { observer } from "mobx-react";
import { orderBy } from "lodash";
import { TabLayout } from "../layout/tab-layout";
import type { EventStore } from "./store";
import { KubeObjectListLayout, KubeObjectListLayoutProps } from "../kube-object-list-layout";
import type { Event } from "../../../common/k8s-api/endpoints/event.api";
import type { TableSortCallbacks, TableSortParams } from "../table";
import type { HeaderCustomizer } from "../item-object-list";
import { Tooltip } from "../tooltip";
import { Link } from "react-router-dom";
import { cssNames, IClassName, stopPropagation } from "../../utils";
import { Icon } from "../icon";
import { eventsURL } from "../../../common/routes";
import { getDetailsUrl } from "../kube-detail-params";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import { withInjectables } from "@ogre-tools/injectable-react";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import eventStoreInjectable from "./store.injectable";

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

export interface EventsProps extends Partial<KubeObjectListLayoutProps<Event>> {
  className?: IClassName;

  /**
   * @default false
   */
  compact?: boolean;

  /**
   * @default 10
   */
  compactLimit?: number;
}

interface Dependencies {
  eventStore: EventStore;
  apiManager: ApiManager;
}

const NonInjectedEvents = observer(({ apiManager, eventStore, className, compact = false, compactLimit = 10, ...layoutProps }: Dependencies & EventsProps) => {
  const [sorting] = useState(observable.object({
    sortBy: columnId.age,
    orderBy: "asc",
  } as TableSortParams));

  const sortingCallbacks: TableSortCallbacks<Event> = {
    [columnId.namespace]: event => event.getNs(),
    [columnId.type]: event => event.type,
    [columnId.object]: event => event.involvedObject.name,
    [columnId.count]: event => event.count,
    [columnId.age]: event => event.getTimeDiffFromNow(),
    [columnId.lastSeen]: event => new Date(event.lastTimestamp).getTime(),
  };

  /**
   * we must sort items before passing to "KubeObjectListLayout -> Table"
   * to make it work with "compact=true" (proper table sorting actions + initial items)
   */
  const items = orderBy(eventStore.contextItems, sortingCallbacks[sorting.sortBy], sorting.orderBy);
  const visibleItems = items.slice(0, compact ? compactLimit : items.length);

  const customizeHeader: HeaderCustomizer = ({ info, title, ...headerPlaceholders }) => {
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
          tooltip={`Limited to ${eventStore.limit}`}
        />
      </>,
      title,
      ...headerPlaceholders,
    };
  };

  const events = (
    <KubeObjectListLayout
      {...layoutProps}
      isConfigurable
      tableId="events"
      store={eventStore}
      className={cssNames("Events", className, { compact })}
      renderHeaderTitle="Events"
      customizeHeader={customizeHeader}
      isSelectable={false}
      items={visibleItems}
      virtual={!compact}
      tableProps={{
        sortSyncWithUrl: false,
        sortByDefault: sorting,
        onSort: action(({ sortBy, orderBy }) => {
          sorting.orderBy = orderBy;
          sorting.sortBy = sortBy;
        }),
      }}
      sortingCallbacks={sortingCallbacks}
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
});

export const Events = withInjectables<Dependencies, EventsProps>(NonInjectedEvents, {
  getProps: (di, props) => ({
    eventStore: di.inject(eventStoreInjectable),
    apiManager: di.inject(apiManagerInjectable),
    ...props,
  }),
});
