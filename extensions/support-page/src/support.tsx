// TODO: support localization / figure out how to extract / consume i18n strings

import "./support.scss"
import React from "react"
import { observer } from "mobx-react"
import { App, Component } from "@k8slens/extensions";

@observer
export class SupportPage extends React.Component {
  render() {
    const { PageLayout } = Component;
    const { slackUrl, issuesTrackerUrl } = App;
    return (
      <PageLayout showOnTop className="SupportPage" header={<h2>Welcome to Lens support</h2>}>
        <p>Here you will find different ways of getting support for Lens.</p>
        <h2>Community Slack Channel</h2>
        <p>
        We have an active and growing community! Ask a question, see what's being discussed, get insights to up and coming features, help others, join the conversation on our community slack <a href={slackUrl} target="_blank">here</a>
        </p>

        <h2>Open Source Github Repository</h2>
        <p>
        Search feature requests, submit an idea, review existing issues, or open a new one at our Github repository <a href={issuesTrackerUrl} target="_blank">here</a>
        </p>
        
        <h2>Enterprise Support</h2>
        <p>
        If you are interested in paid support options designed for enterprises to cover Lens usage at scale please see the following links:
        </p>
        <ul>
          <li><a href="https://www.mirantis.com/support/enterprise-support-services" target="_blank">Mirantis</a></li>
        </ul>

        {/*<h2><Trans>Commercial Support</Trans></h2>*/}
      </PageLayout>
    );
  }
}
