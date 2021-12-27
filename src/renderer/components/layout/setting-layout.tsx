/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import "./setting-layout.scss";

import React from "react";
import { observer } from "mobx-react";
import { cssNames, IClassName } from "../../utils";
import { navigation } from "../../navigation";
import { Icon } from "../icon";
import { catalogURL } from "../../../common/routes";

export interface SettingLayoutProps extends React.DOMAttributes<any> {
  className?: IClassName;
  contentClass?: IClassName;
  provideBackButtonNavigation?: boolean;
  contentGaps?: boolean;
  navigation?: React.ReactNode;
  back?: (evt: React.MouseEvent | KeyboardEvent) => void;
}

const defaultProps: Partial<SettingLayoutProps> = {
  provideBackButtonNavigation: true,
  contentGaps: true,
  back: () => {
    if (navigation.length <= 1) {
      navigation.push(catalogURL());
    } else {
      navigation.goBack();
    }
  },
};

/**
 * Layout for settings like pages with navigation
 */
@observer
export class SettingLayout extends React.Component<SettingLayoutProps> {
  static defaultProps = defaultProps as object;

  async componentDidMount() {
    const { hash } = window.location;

    if (hash) {
      document.querySelector(hash)?.scrollIntoView();
    }

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
      this.props.back(evt);
    }
  };

  render() {
    const {
      contentClass, provideBackButtonNavigation,
      contentGaps, navigation, children, back, ...elemProps
    } = this.props;
    const className = cssNames("SettingLayout", { showNavigation: navigation }, this.props.className);

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
            {
              this.props.provideBackButtonNavigation && (
                <div className="fixed top-[60px]">
                  <div
                    className="w-[35px] h-[35px] grid place-items-center pointer border-2 rounded-full border-solid border-textDimmed hover:bg-[#72767d25] active:translate-y-px"
                    role="button"
                    aria-label="Close"
                    onClick={back}
                  >
                    <Icon material="close" className="text-textAccent opacity-60" />
                  </div>
                  <div
                    className="text-center mt-3 font-bold text-lg select-none text-textDimmed pointer-events-none"
                    aria-hidden="true"
                  >
                    ESC
                  </div>
                </div>
              )
            }
          </div>
        </div>
      </div>
    );
  }
}
