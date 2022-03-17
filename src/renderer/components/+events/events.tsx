/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./events.scss";

import React from "react";
import { computed, observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { orderBy } from "lodash";
import { TabLayout } from "../layout/tab-layout-2";
import type { EventStore } from "./event.store";
import { eventStore } from "./event.store";
import type { KubeObjectListLayoutProps } from "../kube-object-list-layout";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import type { KubeEvent, KubeEventApi, KubeEventData } from "../../../common/k8s-api/endpoints/events.api";
import type { TableSortCallbacks, TableSortParams } from "../table";
import type { HeaderCustomizer } from "../item-object-list";
import { Tooltip } from "../tooltip";
import { Link } from "react-router-dom";
import type { IClassName } from "../../utils";
import { cssNames, stopPropagation } from "../../utils";
import { Icon } from "../icon";
import { getDetailsUrl } from "../kube-detail-params";
import { apiManager } from "../../../common/k8s-api/api-manager";
import { withInjectables } from "@ogre-tools/injectable-react";
import navigateToEventsInjectable  from "../../../common/front-end-routing/routes/cluster/events/navigate-to-events.injectable";
import { KubeObjectAge } from "../kube-object/age";
import { ReactiveDuration } from "../duration/reactive-duration";

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

export interface EventsProps extends Partial<KubeObjectListLayoutProps<KubeEvent, KubeEventApi, KubeEventData>> {
  className?: IClassName;
  compact?: boolean;
  compactLimit?: number;
}

const defaultProps: Partial<EventsProps> = {
  compactLimit: 10,
};

interface Dependencies {
  navigateToEvents: () => void;
}

@observer
class NonInjectedEvents extends React.Component<Dependencies & EventsProps> {
  static defaultProps = defaultProps as object;

  @observable sorting: TableSortParams = {
    sortBy: columnId.age,
    orderBy: "asc",
  };

  private sortingCallbacks: TableSortCallbacks<KubeEvent> = {
    [columnId.namespace]: event => event.getNs(),
    [columnId.type]: event => event.type,
    [columnId.object]: event => event.involvedObject.name,
    [columnId.count]: event => event.count,
    [columnId.age]: event => -event.getCreationTimestamp(),
    [columnId.lastSeen]: event => event.lastTimestamp ? -new Date(event.lastTimestamp).getTime() : 0,
  };

  constructor(props: Dependencies & EventsProps) {
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
    return orderBy(items, this.sortingCallbacks[sortBy], order);
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
        info: (
          <span>
            {"("}
            {visibleItems.length}
            {" of "}
            <a onClick={this.props.navigateToEvents}>{items.length}</a>
            {")"}
          </span>
        ),
      };
    }

    return {
      info: (
        <>
          {info}
          <Icon
            small
            material="help_outline"
            className="help-icon"
            tooltip={`Limited to ${store.limit}`}
          />
        </>
      ),
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
                <>
                  <span id={tooltipId}>{message}</span>
                  <Tooltip targetId={tooltipId} formatters={{ narrow: true, warning: isWarning }}>
                    {message}
                  </Tooltip>
                </>
              ),
            },
            event.getNs(),
            <Link
              key="link"
              to={getDetailsUrl(apiManager.lookupApiLink(involvedObject, event))}
              onClick={stopPropagation}
            >
              {`${involvedObject.kind}: ${involvedObject.name}`}
            </Link>,
            event.getSource(),
            event.count,
            <KubeObjectAge key="age" object={event} />,
            event.lastTimestamp
              ? <ReactiveDuration key="last-seen" timestamp={event.lastTimestamp} />
              : "<unknown>",
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

export const Events = withInjectables<Dependencies, EventsProps>(
  NonInjectedEvents,

  {
    getProps: (di, props) => ({
      navigateToEvents: di.inject(navigateToEventsInjectable),
      ...props,
    }),
  },
);
