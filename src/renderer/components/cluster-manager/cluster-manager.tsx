import "./cluster-manager.scss"
import React from "react";
import { App } from "../app";
import { ClustersMenu } from "./clusters-menu";
import { BottomBar } from "./bottom-bar";
import { cssNames, IClassName } from "../../utils";
import { Terminal } from "../dock/terminal";
import { i18nStore } from "../../i18n";

interface Props {
  className?: IClassName;
  contentClass?: IClassName;
}

export class ClusterManager extends React.Component<Props> {
  static async init() {
    await i18nStore.init()
    await Terminal.preloadFonts()
  }

  render() {
    const { className, contentClass } = this.props;
    return (
      <div className={cssNames("ClusterManager", className)}>
        <div id="draggable-top"/>
        <div id="lens-view" className={cssNames("flex column", contentClass)}>
          <App/>
        </div>
        <ClustersMenu/>
        <BottomBar/>
      </div>
    )
  }
}
