import "./closing-page.scss"
import React from "react";
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { Icon } from "../icon"

@observer
export class ClosingPage extends React.Component {

  render() {
    return (
      <div className="ClosingPage flex">
        {(
          <div className="no-clusters flex column gaps box center">
            <Icon size={72} material="emoji_people" />
            <h1>
              <Trans>Bye bye, see you soon!</Trans>
            </h1>
          </div>
        )}
      </div>
    )
  }
}
