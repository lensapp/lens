import "./extensions.scss";

import React from "react";
import { Trans } from "@lingui/macro";
import { observer } from "mobx-react";
import { PageLayout } from "../layout/page-layout";

@observer
export class Extensions extends React.Component {
  disable() {
    
  }

  render() {
    const header = <h2><Trans>Extensions</Trans></h2>;
    return (
      <PageLayout showOnTop className="Extensions" header={header}>
        <h2><Trans>List</Trans></h2>
      </PageLayout>
    );
  }
}