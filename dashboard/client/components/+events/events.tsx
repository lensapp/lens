import "./events.scss";

import React from "react";
import { observer } from "mobx-react";
import { MainLayout } from "../layout/main-layout";
import { eventStore } from "./event.store";
import { KubeObjectListLayout, KubeObjectListLayoutProps } from "../kube-object";
import { Trans } from "@lingui/macro";
import { KubeEvent } from "../../api/endpoints/events.api";
import { Tooltip, TooltipContent } from "../tooltip";
import { Link } from "react-router-dom";
import { cssNames, ClassName, stopPropagation } from "../../utils";
import { Icon } from "../icon";
import { getDetailsUrl } from "../../navigation";
import { lookupApiLink } from "../../api/kube-api";
import { ItemObject } from "client/item.store";

enum sortBy {
  namespace = "namespace",
  object = "object",
  type = "type",
  count = "count",
  age = "age",
}

interface Props extends Partial<KubeObjectListLayoutProps> {
  className?: ClassName;
  compact?: boolean;
  compactLimit?: number;
}

const defaultProps: Partial<Props> = {
  compactLimit: 10,
};

@observer
export class Events extends React.Component<Props> {
  static defaultProps = defaultProps as object;

  render(): JSX.Element {
    const { compact, compactLimit, className, ...layoutProps } = this.props;
    const events = (
      <KubeObjectListLayout
        {...layoutProps}
        className={cssNames("Events", className, { compact })}
        store={eventStore}
        isSelectable={false}
        sortingCallbacks={{
          [sortBy.namespace]: (event: KubeEvent): string => event.getNs(),
          [sortBy.type]: (event: KubeEvent): string => event.involvedObject.kind,
          [sortBy.object]: (event: KubeEvent): string => event.involvedObject.name,
          [sortBy.count]: (event: KubeEvent): number => event.count,
          [sortBy.age]: (event: KubeEvent): string => event.metadata.creationTimestamp,
        }}
        searchFilters={[
          (event: KubeEvent): string[] => event.getSearchFields(),
          (event: KubeEvent): string => event.message,
          (event: KubeEvent): string => event.getSource(),
          (event: KubeEvent): string => event.involvedObject.name,
        ]}
        renderHeaderTitle={<Trans>Events</Trans>}
        customizeHeader={({ title, info }): React.ReactNode => (
          compact ? title : ({
            info: (
              <>
                {info}
                <Icon
                  small
                  material="help_outline"
                  className="help-icon"
                  tooltip={<Trans>Limited to {eventStore.limit}</Trans>}
                />
              </>
            )
          })
        )}
        renderTableHeader={[
          { title: <Trans>Message</Trans>, className: "message" },
          { title: <Trans>Namespace</Trans>, className: "namespace", sortBy: sortBy.namespace },
          { title: <Trans>Type</Trans>, className: "type", sortBy: sortBy.type },
          { title: <Trans>Involved Object</Trans>, className: "object", sortBy: sortBy.object },
          { title: <Trans>Source</Trans>, className: "source" },
          { title: <Trans>Count</Trans>, className: "count", sortBy: sortBy.count },
          { title: <Trans>Age</Trans>, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(event: KubeEvent): (string | React.ReactNode | JSX.Element)[] => {
          const { involvedObject, type, message } = event;
          const { kind, name } = involvedObject;
          const tooltipId = `message-${event.getId()}`;
          const isWarning = type === "Warning";
          const detailsUrl = getDetailsUrl(lookupApiLink(involvedObject, event));
          return [
            {
              className: {
                warning: isWarning
              },
              title: (
                <>
                  <span id={tooltipId}>{message}</span>
                  <Tooltip htmlFor={tooltipId} following>
                    <TooltipContent narrow warning={isWarning}>
                      {message}
                    </TooltipContent>
                  </Tooltip>
                </>
              )
            },
            event.getNs(),
            kind,
            <Link key="name" to={detailsUrl} title={name} onClick={stopPropagation}>{name}</Link>,
            event.getSource(),
            event.count,
            event.getAge(),
          ];
        }}
        virtual={!compact}
        filterItems={[
          (items): ItemObject[] => compact ? items.slice(0, compactLimit) : items,
        ]}
      />
    );
    if (compact) {
      return events;
    }
    return (
      <MainLayout>
        {events}
      </MainLayout>
    );
  }
}
