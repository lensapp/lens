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
  submit: () => Promise<ReactNode | string>;
}

interface OptionalProps {
  className?: string;
  error?: string;
  controls?: ReactNode;
  submitLabel?: ReactNode;
  submittingMessage?: ReactNode;
  disableSubmit?: boolean;
  showSubmitClose?: boolean;
  showInlineInfo?: boolean;
  showNotifications?: boolean;
}

@observer
export class InfoPanel extends Component<Props> {
  static defaultProps: OptionalProps = {
    submitLabel: <Trans>Submit</Trans>,
    submittingMessage: <Trans>Submitting..</Trans>,
    showSubmitClose: true,
    showInlineInfo: true,
    showNotifications: true,
  }

  @observable.ref result: ReactNode;
  @observable error = "";
  @observable waiting = false;

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.tabId, () => {
        this.result = ""
        this.error = ""
        this.waiting = false
      })
    ])
  }

  @computed get errorInfo() {
    return this.error || this.props.error;
  }

  submit = async () => {
    const { showNotifications } = this.props;
    this.result = "";
    this.error = "";
    this.waiting = true;
    try {
      this.result = await this.props.submit().finally(() => {
        this.waiting = false;
      });
      if (showNotifications) Notifications.ok(this.result);
    } catch (error) {
      this.error = error.toString();
      if (showNotifications) Notifications.error(this.error);
      throw error;
    }
  }

  submitAndClose = async () => {
    await this.submit();
    this.close();
  }

  close = () => {
    dockStore.closeTab(this.props.tabId);
  }

  renderInfo() {
    if (!this.props.showInlineInfo) {
      return;
    }
    const { result, errorInfo } = this;
    return (
      <>
        {result && (
          <div className="success flex align-center">
            <Icon material="done"/> <span>{result}</span>
          </div>
        )}
        {errorInfo && (
          <div className="error flex align-center">
            <Icon material="error_outline"/>
            <span>{errorInfo}</span>
          </div>
        )}
      </>
    )
  }

  render() {
    const { className, controls, submitLabel, disableSubmit, error, submittingMessage, showSubmitClose } = this.props;
    const { submit, close, submitAndClose, waiting } = this;
    const isDisabled = !!(disableSubmit || waiting || error);
    return (
      <div className={cssNames("InfoPanel flex gaps align-center", className)}>
        <div className="controls">
          {controls}
        </div>
        <div className="info flex gaps align-center">
          {waiting ? <><Spinner/> {submittingMessage}</> : this.renderInfo()}
        </div>
        <Button plain label={<Trans>Cancel</Trans>} onClick={close}/>
        <Button
          primary active
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
      </div>
    );
  }
}