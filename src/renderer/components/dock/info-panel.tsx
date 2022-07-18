/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./info-panel.scss";

import type { ReactNode } from "react";
import React, { Component } from "react";
import { computed, observable, reaction, makeObservable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { cssNames } from "../../utils";
import { Button } from "../button";
import { Icon } from "../icon";
import { Spinner } from "../spinner";
import type { DockStore, TabId } from "./dock/store";
import type { ShowNotification } from "../notifications";
import { withInjectables } from "@ogre-tools/injectable-react";
import dockStoreInjectable from "./dock/store.injectable";
import type { ShowCheckedErrorNotification } from "../notifications/show-checked-error.injectable";
import showSuccessNotificationInjectable from "../notifications/show-success-notification.injectable";
import showCheckedErrorNotificationInjectable from "../notifications/show-checked-error.injectable";

export interface InfoPanelProps extends OptionalProps {
  tabId: TabId;
  submit?: () => Promise<string | React.ReactElement | React.ReactElement[] | null | undefined | false | void>;
}

export interface OptionalProps {
  className?: string;
  error?: string;
  controls?: ReactNode;
  submitLabel?: ReactNode;
  submittingMessage?: ReactNode;
  disableSubmit?: boolean;
  showButtons?: boolean;
  showSubmitClose?: boolean;
  showInlineInfo?: boolean;
  showNotifications?: boolean;
  showStatusPanel?: boolean;
  submitTestId?: string;
  cancelTestId?: string;
  submittingTestId?: string;
}

interface Dependencies {
  dockStore: DockStore;
  showSuccessNotification: ShowNotification;
  showCheckedErrorNotification: ShowCheckedErrorNotification;
}

@observer
class NonInjectedInfoPanel extends Component<InfoPanelProps & Dependencies> {
  static defaultProps: OptionalProps = {
    submitLabel: "Submit",
    submittingMessage: "Submitting..",
    showButtons: true,
    showSubmitClose: true,
    showInlineInfo: true,
    showNotifications: true,
    showStatusPanel: true,
  };

  @observable error = "";
  @observable waiting = false;

  constructor(props: InfoPanelProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.tabId, () => {
        this.waiting = false;
      }),
    ]);
  }

  @computed get errorInfo() {
    return this.props.error;
  }

  submit = async () => {
    const { showNotifications } = this.props;

    this.waiting = true;

    try {
      const result = await this.props.submit?.();

      if (showNotifications && result) {
        this.props.showSuccessNotification(result);
      }
    } catch (error) {
      if (showNotifications) {
        this.props.showCheckedErrorNotification(error, "Unknown error while submitting");
      }
    } finally {
      this.waiting = false;
    }
  };

  submitAndClose = async () => {
    await this.submit();
    this.close();
  };

  close = () => {
    this.props.dockStore.closeTab(this.props.tabId);
  };

  renderErrorIcon() {
    if (!this.props.showInlineInfo || !this.errorInfo) {
      return null;
    }

    return (
      <div className="error">
        <Icon material="error_outline" tooltip={this.errorInfo}/>
      </div>
    );
  }

  render() {
    const { className, controls, submitLabel, disableSubmit, error, submittingMessage, showButtons, showSubmitClose, showStatusPanel } = this.props;
    const { submit, close, submitAndClose, waiting } = this;
    const isDisabled = !!(disableSubmit || waiting || error);

    return (
      <div className={cssNames("InfoPanel flex gaps align-center", className)}>
        <div className="controls">
          {controls}
        </div>
        {showStatusPanel && (
          <div className="flex gaps align-center">
            {waiting ? (
              <>
                <Spinner data-testid={this.props.submittingTestId} />
                {" "}
                {submittingMessage}
              </>
            ) : this.renderErrorIcon()}
          </div>
        )}
        {showButtons && (
          <>
            <Button
              plain
              label="Cancel"
              onClick={close}
              data-testid={this.props.cancelTestId}
            />
            <Button
              active
              outlined={showSubmitClose}
              primary={!showSubmitClose}// one button always should be primary (blue)
              label={submitLabel}
              onClick={submit}
              disabled={isDisabled}
              data-testid={this.props.submitTestId}
            />
            {showSubmitClose && (
              <Button
                primary
                active
                label={`${submitLabel} & Close`}
                onClick={submitAndClose}
                disabled={isDisabled}
              />
            )}
          </>
        )}
      </div>
    );
  }
}

export const InfoPanel = withInjectables<Dependencies, InfoPanelProps>(
  NonInjectedInfoPanel,

  {
    getProps: (di, props) => ({
      dockStore: di.inject(dockStoreInjectable),
      showSuccessNotification: di.inject(showSuccessNotificationInjectable),
      showCheckedErrorNotification: di.inject(showCheckedErrorNotificationInjectable),
      ...props,
    }),
  },
);
