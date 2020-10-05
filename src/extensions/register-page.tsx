// Extensions-api -> Dynamic pages

import { computed, observable } from "mobx";
import React from "react";
import { RouteProps } from "react-router";
import { IconProps } from "../renderer/components/icon";
import { cssNames, IClassName } from "../renderer/utils";
import { TabLayout, TabRoute } from "../renderer/components/layout/tab-layout";

export enum DynamicPageType {
  GLOBAL = "lens-scope",
  CLUSTER = "cluster-view-scope",
}

export interface PageRegistration extends RouteProps {
  className?: IClassName;
  url?: string; // initial url to be used for building menus and tabs, otherwise "path" applied by default
  path: string; // route-path
  title: React.ReactNode; // used in sidebar's & tabs-layout
  type: DynamicPageType;
  components: PageComponents;
  subPages?: (PageRegistration & TabRoute)[];
}

export interface PageComponents {
  Page: React.ComponentType<any>;
  MenuIcon: React.ComponentType<IconProps>;
}

export class PagesStore {
  protected pages = observable.array<PageRegistration>([], { deep: false });

  @computed get globalPages() {
    return this.pages.filter(page => page.type === DynamicPageType.GLOBAL);
  }

  @computed get clusterPages() {
    return this.pages.filter(page => page.type === DynamicPageType.CLUSTER);
  }

  // todo: verify paths to avoid collision with existing pages
  register(params: PageRegistration) {
    this.pages.push(params);
    return () => {
      this.pages.replace(
        this.pages.filter(page => page.components !== params.components)
      )
    };
  }
}

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

export const dynamicPages = new PagesStore();
