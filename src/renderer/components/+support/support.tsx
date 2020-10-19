import "./support.scss"

import React from "react"
import { observer } from "mobx-react"
import { Trans } from "@lingui/macro"
import { issuesTrackerUrl, slackUrl } from "../../../common/vars";
import { PageLayout } from "../layout/page-layout";

@observer
export class Support extends React.Component {
  render() {
    return (
      <PageLayout fullScreen className="Support" header={<h2>Support</h2>}>
        <h2><Trans>Community Slack Channel</Trans></h2>
        <p>
          <Trans>Ask a question, see what's being discussed, join the conversation <a className="supportLink" href={slackUrl} target="_blank">here</a></Trans>{" "}
        </p>

        <h2><Trans>Report an Issue</Trans></h2>
        <p>
          <Trans>Review existing issues or open a new one <a className="supportLink" href={issuesTrackerUrl} target="_blank">here</a></Trans>
        </p>

        {/*<h2><Trans>Commercial Support</Trans></h2>*/}
      </PageLayout>
    );
  }
}
