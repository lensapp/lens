import "./dock-tab.scss";

import React from "react";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { autobind, cssNames, prevDefault } from "../../utils";
import { dockStore, IDockTab } from "./dock.store";
import { Tab, TabProps } from "../tabs";
import { Icon } from "../icon";
import { Menu, MenuItem } from "../menu";
import { observable } from "mobx";
import { _i18n } from "../../i18n";

export interface DockTabProps extends TabProps<IDockTab> {
  moreActions?: React.ReactNode;
}

@observer
export class DockTab extends React.Component<DockTabProps> {
  @observable menuVisible = false;

  get tabId() {
    return this.props.value.id;
  }

  @autobind()
  close() {
    dockStore.closeTab(this.tabId);
  }

  renderMenu() {
    const { closeTab, closeAllTabs, closeOtherTabs, closeTabsToTheRight } = dockStore;

    return (
      <Menu
        usePortal
        htmlFor={`tab-${this.tabId}`}
        className="DockTabMenu"
        isOpen={this.menuVisible}
        open={() => this.menuVisible = true}
        close={() => this.menuVisible = false}
        toggleEvent="contextmenu"
      >
        <MenuItem onClick={() => closeTab(this.tabId)}>
          <Trans>Close</Trans>
        </MenuItem>
        <MenuItem onClick={() => closeAllTabs()}>
          <Trans>Close all tabs</Trans>
        </MenuItem>
        <MenuItem onClick={() => closeOtherTabs(this.tabId)}>
          <Trans>Close other tabs</Trans>
        </MenuItem>
        <MenuItem onClick={() => closeTabsToTheRight(this.tabId)}>
          <Trans>Close tabs to the right</Trans>
        </MenuItem>
      </Menu>
    );
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
      <>
        <Tab
          {...tabProps}
          id={`tab-${this.tabId}`}
          className={cssNames("DockTab", className, { pinned })}
          onContextMenu={() => this.menuVisible = true}
          label={label}
        />
        {this.renderMenu()}
      </>
    );
  }
}