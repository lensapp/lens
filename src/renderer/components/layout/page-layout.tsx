import "./page-layout.scss";

import React from "react";
import { observer } from "mobx-react";
import { autobind, cssNames, IClassName } from "../../utils";
import { navigation } from "../../navigation";
import { Icon } from "../icon";

export interface PageLayoutProps extends React.DOMAttributes<any> {
  className?: IClassName;
  header?: React.ReactNode;
  headerClass?: IClassName;
  contentClass?: IClassName;
  provideBackButtonNavigation?: boolean;
  contentGaps?: boolean;
  showOnTop?: boolean; // covers whole app view
  navigation?: React.ReactNode;
  back?: (evt: React.MouseEvent | KeyboardEvent) => void;
}

const defaultProps: Partial<PageLayoutProps> = {
  provideBackButtonNavigation: true,
  contentGaps: true,
};

@observer
export class PageLayout extends React.Component<PageLayoutProps> {
  static defaultProps = defaultProps as object;

  @autobind()
  back(evt?: React.MouseEvent | KeyboardEvent) {
    if (this.props.back) {
      this.props.back(evt);
    } else {
      navigation.goBack();
    }
  }

  async componentDidMount() {
    window.addEventListener("keydown", this.onEscapeKey);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.onEscapeKey);
  }

  onEscapeKey = (evt: KeyboardEvent) => {
    if (!this.props.provideBackButtonNavigation) {
      return;
    }

    if (evt.code === "Escape") {
      evt.stopPropagation();
      this.back(evt);
    }
  };

  render() {
    const {
      contentClass, headerClass, provideBackButtonNavigation,
      contentGaps, showOnTop, navigation, children, ...elemProps
    } = this.props;
    const className = cssNames("PageLayout", { showOnTop, showNavigation: navigation }, this.props.className);

    return (
      <div {...elemProps} className={className}>
        { navigation && (
          <nav className="sidebarRegion">
            <div className="sidebar">
              {navigation}
            </div>
          </nav>
        )}
        <div className="contentRegion" id="ScrollSpyRoot">
          <div className={cssNames("content", contentClass, contentGaps && "flex column gaps")}>
            {children}
          </div>
          <div className="toolsRegion">
            <div className="fixedTools">
              <div className="closeBtn" role="button" aria-label="Close" onClick={this.back}>
                <Icon material="close"/>
              </div>
              <div className="esc" aria-hidden="true">
                ESC
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
