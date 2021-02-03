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

  render() {
    const { compact, compactLimit, className, ...layoutProps } = this.props;
    const events = (
      <KubeObjectListLayout
        {...layoutProps}
        isConfigurable
        tableId="events"
        className={cssNames("Events", className, { compact })}
        store={eventStore}
        isSelectable={false}
        sortingCallbacks={{
          [columnId.namespace]: (event: KubeEvent) => event.getNs(),
          [columnId.type]: (event: KubeEvent) => event.involvedObject.kind,
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
        renderHeaderTitle="Events"
        customizeHeader={({ title, info }) => (
          compact ? title : ({
            info: (
              <>
                {info}
                <Icon
                  small
                  material="help_outline"
                  className="help-icon"
                  tooltip={`Limited to ${eventStore.limit}`}
                />
              </>
            )
          })
        )}
        renderTableHeader={[
          { title: "Message", className: "message", id: columnId.message },
          { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Type", className: "type", sortBy: columnId.type, id: columnId.type },
          { title: "Involved Object", className: "object", sortBy: columnId.object, id: columnId.object },
          { title: "Source", className: "source", id: columnId.source },
          { title: "Count", className: "count", sortBy: columnId.count, id: columnId.count },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        ]}
        renderTableContents={(event: KubeEvent) => {
          const { involvedObject, type, message } = event;
          const { kind, name } = involvedObject;
          const tooltipId = `message-${event.getId()}`;
          const isWarning = type === "Warning";
          const detailsUrl = getDetailsUrl(lookupApiLink(involvedObject, event));

          return [
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
            kind,
            <Link key="link" to={detailsUrl} title={name} onClick={stopPropagation}>{name}</Link>,
            event.getSource(),
            event.count,
            event.getAge(),
          ];
        }}
        virtual={!compact}
        filterItems={[
          items => compact ? items.slice(0, compactLimit) : items,
        ]}
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
