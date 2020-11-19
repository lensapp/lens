import "./dock-tab.scss";

import React from "react";
import { observer } from "mobx-react";
import { t } from "@lingui/macro";
import { autobind, cssNames, prevDefault } from "../../utils";
import { dockStore, IDockTab } from "./dock.store";
import { Tab, TabProps } from "../tabs";
import { Icon } from "../icon";
import { _i18n } from "../../i18n";

export interface DockTabProps extends TabProps<IDockTab> {
  moreActions?: React.ReactNode;
}

@observer
export class DockTab extends React.Component<DockTabProps> {
  get tabId() {
    return this.props.value.id;
  }

  @autobind()
  close() {
    dockStore.closeTab(this.tabId);
  }

  render() {
    const { className, moreActions, ...tabProps } = this.props;
    const { title, pinned } = tabProps.value;
    const label = (
      <div className="flex gaps align-center">
        <span className="title" title={title}>{title}</span>
        {moreActions}
        {!pinned && (
          <Icon
            small material="close"
            title={_i18n._(t`Close (Ctrl+W)`)}
            onClick={prevDefault(this.close)}
          />
        )}
      </div>
    );
    return (
      <Tab
        {...tabProps}
        className={cssNames("DockTab", className, { pinned })}
        label={label}
      />
    );
  }
}