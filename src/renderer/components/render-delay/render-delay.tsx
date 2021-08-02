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
