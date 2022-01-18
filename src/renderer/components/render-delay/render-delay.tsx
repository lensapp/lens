/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import { boundMethod } from "../../utils";

interface Props {
  placeholder?: React.ReactNode;
  children: unknown;
}

@observer
export class RenderDelay extends React.Component<Props> {
  @observable isVisible = false;

  constructor(props: Props) {
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

  @boundMethod
  showContents() {
    this.isVisible = true;
  }

  render() {
    if (!this.isVisible) {
      return this.props.placeholder || null;
    }

    return this.props.children;
  }
}
