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
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import {
  captureEvent,
  captureException,
  eventFromException,
} from "@sentry/browser";
import type { Event } from "@sentry/types";
import { parseSemver } from "@sentry/utils";
import { Button } from "../button";
import { navigation } from "../../navigation";
import { issuesTrackerUrl, slackUrl } from "../../../common/vars";

interface Props {
}

interface State {
  error?: Error;
  errorInfo?: ErrorInfo;
}

const reactVersion = parseSemver(React.version);

/**
 * Logs react error boundary errors to Sentry.
 * 
 * @param error An error captured by React Error Boundary
 * @param componentStack The component stacktrace
 * 
 * edited from https://github.com/getsentry/sentry-javascript/blob/master/packages/react/src/errorboundary.tsx
 */
function captureReactErrorBoundaryError(error: Error, componentStack: string) {
  const errorBoundaryError = new Error(error.message);

  errorBoundaryError.name = `React ErrorBoundary ${errorBoundaryError.name}`;
  errorBoundaryError.stack = componentStack;

  let errorBoundaryEvent: Event = {};

  void eventFromException({}, errorBoundaryError).then(e => {
    errorBoundaryEvent = e;
  });

  if (
    errorBoundaryEvent.exception &&
    Array.isArray(errorBoundaryEvent.exception.values) &&
    reactVersion.major &&
    reactVersion.major >= 17
  ) {
    let originalEvent: Event = {};

    void eventFromException({}, error).then(e => {
      originalEvent = e;
    });

    if (originalEvent.exception && Array.isArray(originalEvent.exception.values)) {
      originalEvent.exception.values = [...errorBoundaryEvent.exception.values, ...originalEvent.exception.values];
    }

    return captureEvent(originalEvent);
  }

  return captureException(error, { contexts: { react: { componentStack } } });
}

@observer
export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {};

  @disposeOnUnmount
  resetOnNavigate = reaction(
    () => navigation.toString(),
    () => this.setState({ error: null, errorInfo: null })
  );

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureReactErrorBoundaryError(error, errorInfo.componentStack);
    this.setState({ error, errorInfo });
  }

  back = () => {
    navigation.goBack();
  };

  render() {
    const { error, errorInfo } = this.state;

    if (error) {
      const slackLink = <a href={slackUrl} rel="noreferrer" target="_blank">Slack</a>;
      const githubLink = <a href={issuesTrackerUrl} rel="noreferrer" target="_blank">Github</a>;
      const pageUrl = location.pathname;

      return (
        <div className="flex ErrorBoundary column gaps">
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
            <code className="box grow">
              <p className="contrast">Error stack:</p> <br/>
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
