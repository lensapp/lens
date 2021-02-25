import "./page-layout.scss";

import React from "react";
import { observer } from "mobx-react";
import { autobind, cssNames, IClassName } from "../../utils";
import { Icon } from "../icon";
import { navigation } from "../../navigation";
import { ScrollSpy } from "../scroll-spy/scroll-spy";

export interface PageLayoutProps extends React.DOMAttributes<any> {
  className?: IClassName;
  header: React.ReactNode;
  headerClass?: IClassName;
  contentClass?: IClassName;
  provideBackButtonNavigation?: boolean;
  contentGaps?: boolean;
  showOnTop?: boolean; // covers whole app view
  showNavigation?: boolean;
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
      contentClass, header, headerClass, provideBackButtonNavigation,
      contentGaps, showOnTop, showNavigation, children, ...elemProps
    } = this.props;
    const className = cssNames("PageLayout", { showOnTop, showNavigation }, this.props.className);

    return (
      <ScrollSpy render={navigation => (
        <div {...elemProps} className={className}>
          <div className={cssNames("header flex gaps align-center", headerClass)}>
            {header}
            {provideBackButtonNavigation && (
              <Icon
                big material="close"
                className="back box right"
                onClick={this.back}
              />
            )}
          </div>
          <div className="content-scrollable-area">
            <div className="content-wrapper">
              { showNavigation && (
                <div className="content-navigation">
                  <ul>
                    <li>Section 1</li>
                    <li>Section 2</li>
                    <li>{navigation.toString()}</li>
                  </ul>
                </div>
              )}
              <div className={cssNames("content", contentGaps && "flex column gaps", contentClass)}>
                {children}
              </div>
            </div>
          </div>
        </div>
      )} />);
  }
}
