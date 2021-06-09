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

import "./app-init.scss";

import React from "react";
import { render } from "react-dom";
import { CubeSpinner } from "../spinner";
import { apiBase } from "../../api";

interface Props {
  serviceWaitingList?: string[];
}

export class AppInit extends React.Component<Props> {
  static async start(rootElem: HTMLElement) {
    render(<AppInit/>, rootElem); // show loading indicator asap
    await AppInit.readyStateCheck(rootElem); // wait while all good to run
  }

  protected static async readyStateCheck(rootElem: HTMLElement) {
    const waitingList = await apiBase.get<string[]>("/ready");

    if (waitingList.length > 0) {
      // update waiting state
      render(<AppInit serviceWaitingList={waitingList}/>, rootElem);

      // check again in 1-5 seconds
      return new Promise(resolve => {
        const timeoutDelay = 1000 + Math.random() * 4000;

        setTimeout(() => resolve(AppInit.readyStateCheck(rootElem)), timeoutDelay);
      });
    }
  }

  render() {
    const { serviceWaitingList = [] } = this.props;
    const serviceNames = serviceWaitingList.join(", ");

    return (
      <div className="AppInit flex column center">
        <div className="box flex column gaps">
          <h5>Lens - Loading..</h5>
          {serviceWaitingList.length > 0 && (
            <p className="waiting-services">
              Waiting services to be running: <em className="text-secondary">{serviceNames}</em>
            </p>
          )}
          <CubeSpinner/>
        </div>
      </div>
    );
  }
}
