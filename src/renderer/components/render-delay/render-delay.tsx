/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import type { SingleOrMany } from "../../utils";

export interface RenderDelayProps {
  placeholder?: React.ReactNode;
  children: SingleOrMany<React.ReactNode>;
}

@observer
export class RenderDelay extends React.Component<RenderDelayProps> {
  @observable isVisible = false;

  constructor(props: RenderDelayProps) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    const guaranteedFireTime = 1000;

    window.requestIdleCallback(this.showContents, { timeout: guaranteedFireTime });
  }

  componentWillUnmount() {
    window.cancelIdleCallback(this.showContents);
  }

  showContents = () => this.isVisible = true;

  render() {
    if (!this.isVisible) {
      return this.props.placeholder || null;
    }

    return this.props.children;
  }
}
