import "./error-boundary.scss"

import React, { ErrorInfo } from "react";
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { Button } from "../button";
import { navigation } from "../../navigation";
import { _i18n } from "../../i18n";
import { issuesTrackerUrl, slackUrl } from "../../../common/vars";

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
      const slackLink = <a href={slackUrl} target="_blank">Slack</a>
      const githubLink = <a href={issuesTrackerUrl} target="_blank">Github</a>
      const pageUrl = location.href;
      return (
        <div className="ErrorBoundary flex column gaps">
          <h5>
            <Trans>App crash at <span className="contrast">{pageUrl}</span></Trans>
          </h5>
          <p>
            <Trans>
              To help us improve the product please report bugs to {slackLink} community or {githubLink} issues tracker.
            </Trans>
          </p>
          <div className="flex gaps">
            <code className="block">
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
