import "./page-layout.scss"

import React from "react";
import { observer } from "mobx-react";
import { cssNames, IClassName } from "../../utils";
import { Icon } from "../icon";
import { navigation } from "../../navigation";

export interface PageLayoutProps extends React.DOMAttributes<any> {
  className?: IClassName;
  header: React.ReactNode;
  headerClass?: IClassName;
  contentClass?: IClassName;
  provideBackButtonNavigation?: boolean;
  contentGaps?: boolean;
  fullScreen?: boolean; // covers whole app view
}

const defaultProps: Partial<PageLayoutProps> = {
  provideBackButtonNavigation: true,
  contentGaps: true,
}

@observer
export class PageLayout extends React.Component<PageLayoutProps> {
  static defaultProps = defaultProps as object;

  back = () => navigation.goBack();

  async componentDidMount() {
    window.addEventListener('keydown', this.onEscapeKey);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onEscapeKey);
  }

  onEscapeKey = (evt: KeyboardEvent) => {
    if (!this.props.provideBackButtonNavigation) {
      return;
    }
    if (evt.code === "Escape") {
      evt.stopPropagation();
      this.back();
    }
  }

  render() {
    const {
      className, contentClass, header, headerClass, provideBackButtonNavigation,
      contentGaps, fullScreen, children, ...elemProps
    } = this.props;
    return (
      <div {...elemProps} className={cssNames("PageLayout", className, { global: fullScreen })}>
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
        <div className="content-wrapper">
          <div className={cssNames("content", contentGaps && "flex column gaps", contentClass)}>
            {children}
          </div>
        </div>
      </div>
    )
  }
}
