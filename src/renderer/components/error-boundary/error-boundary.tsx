/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./error-boundary.scss";

import React, { ErrorInfo } from "react";
import { observer } from "mobx-react";
import { Button } from "../button";
import { navigation } from "../../navigation";
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
  }

  back = () => {
    this.setState({ error: null, errorInfo: null });
    navigation.goBack();
  };

  render() {
    const { error, errorInfo } = this.state;

    if (error) {
      const slackLink = <a href={slackUrl} rel="noreferrer" target="_blank">Slack</a>;
      const githubLink = <a href={issuesTrackerUrl} rel="noreferrer" target="_blank">Github</a>;
      const pageUrl = location.pathname;

      return (
        <div className="ErrorBoundary flex column gaps">
          <h5>
            App crash at <span className="contrast">{pageUrl}</span>
          </h5>
          <p>
            To help us improve the product please report bugs to {slackLink} community or {githubLink} issues tracker.
          </p>
          <div className="wrapper">
            <code className="block">
              <p className="contrast">Component stack:</p>
              {errorInfo.componentStack}
            </code>
            <code className="block">
              <p className="contrast">Error stack:</p>
              {error.stack}
            </code>
          </div>
          <Button
            className="box self-flex-start"
            primary label="Back"
            onClick={this.back}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
