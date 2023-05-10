/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./error-boundary.scss";

import type { ErrorInfo } from "react";
import React from "react";
import { observer } from "mobx-react";
import { Button } from "@k8slens/button";
import type { StrictReactNode } from "@k8slens/utilities";
import type { ObservableHistory } from "mobx-observable-history";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observableHistoryInjectionToken } from "@k8slens/routing";

const issuesTrackerUrl = "https://github.com/lensapp/lens/issues";
const forumsUrl = "https://forums.k8slens.dev";

export interface ErrorBoundaryProps {
  children?: StrictReactNode;
}

interface State {
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface Dependencies {
  observableHistory: ObservableHistory<unknown>;
}

@observer
class NonInjectedErrorBoundary extends React.Component<
  ErrorBoundaryProps & Dependencies,
  State
> {
  public state: State = {};

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
  }

  back = () => {
    this.setState({ error: undefined, errorInfo: undefined });
    this.props.observableHistory.goBack();
  };

  render() {
    const { error, errorInfo } = this.state;

    if (error) {
      return (
        <div className="ErrorBoundary flex column gaps">
          <h5>
            {"App crash at "}
            <span className="contrast">{window.location.pathname}</span>
          </h5>
          <p>
            {"To help us improve the product please report bugs on"}
            <a href={forumsUrl} rel="noreferrer" target="_blank">
              Lens Forums
            </a>
            {" or on our"}
            <a href={issuesTrackerUrl} rel="noreferrer" target="_blank">
              Github
            </a>
            {" issues tracker."}
          </p>
          <div className="wrapper">
            <code className="block">
              <p className="contrast">Component stack:</p>
              {errorInfo?.componentStack}
            </code>
            <code className="block">
              <p className="contrast">Error stack:</p>
              {error.stack}
            </code>
          </div>
          <Button
            className="box self-flex-start"
            primary
            label="Back"
            onClick={this.back}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withInjectables<Dependencies, ErrorBoundaryProps>(
  NonInjectedErrorBoundary,
  {
    getProps: (di, props) => ({
      ...props,
      observableHistory: di.inject(observableHistoryInjectionToken),
    }),
  }
);
