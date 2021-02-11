import "./events.scss";

import React, { Fragment } from "react";
import { observer } from "mobx-react";
import { TabLayout } from "../layout/tab-layout";
import { eventStore } from "./event.store";
import { getDetailsUrl, KubeObjectListLayout, KubeObjectListLayoutProps } from "../kube-object";
import { KubeEvent } from "../../api/endpoints/events.api";
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

  get store() {
    return eventStore;
  }

  get items() {
    return eventStore.contextItems;
  }

  render() {
    const { store, items } = this;
    const { compact, compactLimit, className, ...layoutProps } = this.props;
    const visibleItems = compact ? items.slice(0, compactLimit) : items;
    const allEventsAreShown = visibleItems.length === items.length;

    const compactModeHeader = <>
      Events <small>({visibleItems.length} of <Link to={eventsURL()}>{items.length}</Link>)</small>
    </>;

    const events = (
      <KubeObjectListLayout
        {...layoutProps}
        isConfigurable
        tableId="events"
        store={store}
        className={cssNames("Events", className, { compact })}
        isSelectable={false}
        items={visibleItems}
        virtual={!compact}
        renderHeaderTitle={compact && !allEventsAreShown ? compactModeHeader : "Events"}
        tableProps={{
          sortSyncWithUrl: false,
          sortByDefault: {
            sortBy: columnId.type,
            orderBy: "desc", // show "Warning" events at the top
          },
        }}
        sortingCallbacks={{
          [columnId.namespace]: (event: KubeEvent) => event.getNs(),
          [columnId.type]: (event: KubeEvent) => event.type,
          [columnId.object]: (event: KubeEvent) => event.involvedObject.name,
          [columnId.count]: (event: KubeEvent) => event.count,
          [columnId.age]: (event: KubeEvent) => event.metadata.creationTimestamp,
        }}
        searchFilters={[
          (event: KubeEvent) => event.getSearchFields(),
          (event: KubeEvent) => event.message,
          (event: KubeEvent) => event.getSource(),
          (event: KubeEvent) => event.involvedObject.name,
        ]}
        customizeHeader={({ title, info }) => (
          compact ? title : ({
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
            )
          })
        )}
        renderTableHeader={[
          { title: "Type", className: "type", sortBy: columnId.type, id: columnId.type },
          { title: "Message", className: "message", id: columnId.message },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Involved Object", className: "object", sortBy: columnId.object, id: columnId.object },
          { title: "Source", className: "source", id: columnId.source },
          { title: "Count", className: "count", sortBy: columnId.count, id: columnId.count },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
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
