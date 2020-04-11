import "./error-boundary.scss"

import React, { ErrorInfo } from "react";
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { Button } from "../button";
import { configStore } from "../../config.store";
import { navigation } from "../../navigation";
import { _i18n } from "../../i18n";

interface Props {
}

interface State {
  error?: Error;
  errorInfo?: ErrorInfo;
}

@observer
export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {};

  @disposeOnUnmount
  resetOnNavigate = reaction(
    () => navigation.getPath(),
    () => this.setState({ error: null, errorInfo: null })
  )

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
  }

  back = () => {
    navigation.goBack();
  }

  render() {
    const { error, errorInfo } = this.state;
    if (error) {
      const slackLink = <a href="https://join.slack.com/t/kontenacommunity/shared_invite/enQtOTc5NjAyNjYyOTk4LWU1NDQ0ZGFkOWJkNTRhYTc2YjVmZDdkM2FkNGM5MjhiYTRhMDU2NDQ1MzIyMDA4ZGZlNmExOTc0N2JmY2M3ZGI" target="_blank">Slack</a>
      const githubLink = <a href="https://github.com/lensapp/lens/issues" target="_blank">Github</a>
      const pageUrl = location.href;
      return (
        <div className="ErrorBoundary flex column gaps">
          <h5>
            <Trans>App crash at <span className="contrast">{pageUrl}</span></Trans>
            {configStore.buildVersion && <p><Trans>Build version</Trans>: {configStore.buildVersion}</p>}
          </h5>
          <p>
            <Trans>
              To help us improve the product please report bugs to {slackLink} community or {githubLink} issues tracker.
            </Trans>
          </p>
          <div className="flex gaps">
            <code>
              <p className="contrast"><Trans>Component stack</Trans>:</p>
              {errorInfo.componentStack}
            </code>
            <code className="box grow">
              <p className="contrast"><Trans>Error stack</Trans>:</p> <br/>
              {error.stack}
            </code>
          </div>
          <Button
            className="box self-flex-start"
            primary label={_i18n._(t`Back`)}
            onClick={this.back}
          />
        </div>
      )
    }
    return this.props.children;
  }
}