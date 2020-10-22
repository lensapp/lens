import React from "react";
import { cssNames } from "../renderer/utils";
import { TabLayout } from "../renderer/components/layout/tab-layout";
import { PageRegistration } from "./registries/page-registry"

export class DynamicPage extends React.Component<{ page: PageRegistration }> {
  render() {
    const { className, components: { Page }, subPages = [] } = this.props.page;
    return (
      <TabLayout className={cssNames("ExtensionPage", className)} tabs={subPages}>
        <Page/>
      </TabLayout>
    )
  }
}
