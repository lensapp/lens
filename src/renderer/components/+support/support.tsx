import "./support.scss"
import React from "react"
import { observer } from "mobx-react"
import { Icon } from "../icon"
import { WizardLayout } from "../layout/wizard-layout"
import { history } from "../../navigation"
import { Trans } from "@lingui/macro"
import { shell } from "electron"
import { issuesTrackerUrl, slackUrl } from "../../../common/vars";
import { t } from "@lingui/macro";
import { _i18n } from "../../i18n";

@observer
export class Support extends React.Component {

  async componentDidMount() {
    window.addEventListener('keydown', this.onEscapeKey);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onEscapeKey);
  }

  onEscapeKey = (evt: KeyboardEvent) => {
    if (evt.code === "Escape") {
      evt.stopPropagation();
      history.goBack();
    }
  }

  render() {
    const header = (
      <>
        <h2>Support</h2>
        <Icon material="close" big onClick={history.goBack}/>
      </>
    );
    return (
      <div className="Support">
        <WizardLayout header={header} centered>
          <h2><Trans>Community Slack Channel</Trans></h2>
          <p>{_i18n._(t`Ask a question, see what's being discussed, join the conversation`)} <span className="supportLink" title={_i18n._(t`here`)} onClick={() => shell.openExternal(slackUrl) }>here</span></p>
          <h2><Trans>Report an Issue</Trans></h2>
          <p>{_i18n._(t`Review existing issues or open a new one`)} <span className="supportLink" title={_i18n._(t`here`)} onClick={() => shell.openExternal(issuesTrackerUrl) }>here</span></p>
          <h2><Trans>Commercial Support</Trans></h2>
          <p>TBD</p>
        </WizardLayout>
      </div>
    );
  }
}
