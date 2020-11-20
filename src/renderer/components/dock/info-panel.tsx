import "./info-panel.scss";

import React, { Component, ReactNode } from "react";
import { computed, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { cssNames } from "../../utils";
import { Button } from "../button";
import { Icon } from "../icon";
import { Spinner } from "../spinner";
import { dockStore, TabId } from "./dock.store";
import { Notifications } from "../notifications";

interface Props extends OptionalProps {
  tabId: TabId;
  submit?: () => Promise<ReactNode | string>;
}

interface OptionalProps {
  className?: string;
  error?: string;
  controls?: ReactNode;
  submitLabel?: ReactNode;
  submittingMessage?: ReactNode;
  disableSubmit?: boolean;
  showButtons?: boolean
  showSubmitClose?: boolean;
  showInlineInfo?: boolean;
  showNotifications?: boolean;
}

@observer
export class InfoPanel extends Component<Props> {
  static defaultProps: OptionalProps = {
    submitLabel: <Trans>Submit</Trans>,
    submittingMessage: <Trans>Submitting..</Trans>,
    showButtons: true,
    showSubmitClose: true,
    showInlineInfo: true,
    showNotifications: true,
  }

  @observable error = "";
  @observable waiting = false;

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.tabId, () => {
        this.waiting = false
      })
    ])
  }

  @computed get errorInfo() {
    return this.props.error;
  }

  submit = async () => {
    const { showNotifications } = this.props;
    this.waiting = true;
    try {
      const result = await this.props.submit();
      if (showNotifications) Notifications.ok(result);
    } catch (error) {
      if (showNotifications) Notifications.error(error.toString());
    } finally {
      this.waiting = false
    }
  }

  submitAndClose = async () => {
    await this.submit();
    this.close();
  }

  close = () => {
    dockStore.closeTab(this.props.tabId);
  }

  renderErrorIcon() {
    if (!this.props.showInlineInfo || !this.errorInfo) {
      return;
    }
    return (
      <div className="error">
        <Icon material="error_outline" tooltip={this.errorInfo}/>
      </div>
    );
  }

  render() {
    const { className, controls, submitLabel, disableSubmit, error, submittingMessage, showButtons, showSubmitClose } = this.props;
    const { submit, close, submitAndClose, waiting } = this;
    const isDisabled = !!(disableSubmit || waiting || error);
    return (
      <div className={cssNames("InfoPanel flex gaps align-center", className)}>
        <div className="controls">
          {controls}
        </div>
        <div className="info flex gaps align-center">
          {waiting ? <><Spinner /> {submittingMessage}</> : this.renderErrorIcon()}
        </div>
        {showButtons && (
          <>
            <Button plain label={<Trans>Cancel</Trans>} onClick={close} />
            <Button
              active
              outlined={showSubmitClose}
              primary={!showSubmitClose}// one button always should be primary (blue)
              label={submitLabel}
              onClick={submit}
              disabled={isDisabled}
            />
            {showSubmitClose && (
              <Button
                primary active
                label={<Trans>{submitLabel} & Close</Trans>}
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
