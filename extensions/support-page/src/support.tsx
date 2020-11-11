// TODO: support localization / figure out how to extract / consume i18n strings

import "./support.scss"
import React from "react"
import { observer } from "mobx-react"
import { App, Component } from "@k8slens/extensions";

@observer
export class Support extends React.Component {
  render() {
    const { PageLayout } = Component;
    const { slackUrl, issuesTrackerUrl } = App;
    return (
      <PageLayout showOnTop className="Support" header={<h2>Support</h2>}>
        <h2>Community Slack Channel</h2>
        <p>
          Ask a question, see what's being discussed, join the conversation <a href={slackUrl} target="_blank">here</a>
        </p>

        <h2>Report an Issue</h2>
        <p>
          Review existing issues or open a new one <a href={issuesTrackerUrl} target="_blank">here</a>
        </p>

        {/*<h2><Trans>Commercial Support</Trans></h2>*/}
      </PageLayout>
    );
  }
}
