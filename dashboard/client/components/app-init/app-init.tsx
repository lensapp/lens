import "./app-init.scss"

import React from "react"
import { render } from "react-dom";
import { t } from "@lingui/macro";
import { CubeSpinner } from "../spinner";
import { apiBase } from "../../api";
import { _i18n } from "../../i18n";

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
          <h5>Kontena Lens - {_i18n._(t`Loading`)}..</h5>
          {serviceWaitingList.length > 0 && (
            <p className="waiting-services">
              {_i18n._(t`Waiting services to be running`)}: <em className="text-secondary">{serviceNames}</em>
            </p>
          )}
          <CubeSpinner/>
        </div>
      </div>
    )
  }
}