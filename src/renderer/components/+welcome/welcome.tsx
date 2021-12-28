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

import "./welcome.scss";
import React from "react";
import { observer } from "mobx-react";
import type { IComputedValue } from "mobx";
import Carousel from "react-material-ui-carousel";
import { Icon } from "../icon";
import { productName, slackUrl } from "../../../common/vars";
import { withInjectables } from "@ogre-tools/injectable-react";
import welcomeMenuItemsInjectable from "./welcome-menu-items/welcome-menu-items.injectable";
import type { WelcomeMenuRegistration } from "./welcome-menu-items/welcome-menu-registration";
import welcomeBannerItemsInjectable from "./welcome-banner-items/welcome-banner-items.injectable";
import type { WelcomeBannerRegistration } from "./welcome-banner-items/welcome-banner-registration";

export const defaultWidth = 320;

interface Dependencies {
  welcomeMenuItems: IComputedValue<WelcomeMenuRegistration[]>
  welcomeBannerItems: IComputedValue<WelcomeBannerRegistration[]>
}

const NonInjectedWelcome: React.FC<Dependencies> = ({ welcomeMenuItems, welcomeBannerItems }) => {
  const welcomeBanners = welcomeBannerItems.get();

  // if there is banner with specified width, use it to calculate the width of the container
  const maxWidth = welcomeBanners.reduce((acc, curr) => {
    const currWidth = curr.width ?? 0;

    if (acc > currWidth) {
      return acc;
    }

    return currWidth;
  }, defaultWidth);

  return (
    <div className="flex justify-center Welcome align-center">
      <div
        style={{ width: `${maxWidth}px` }}
        data-testid="welcome-banner-container"
      >
        {welcomeBanners.length > 0 ? (
          <Carousel
            stopAutoPlayOnHover={true}
            indicators={welcomeBanners.length > 1}
            autoPlay={true}
            navButtonsAlwaysInvisible={true}
            indicatorIconButtonProps={{
              style: {
                color: "var(--iconActiveBackground)",
              },
            }}
            activeIndicatorIconButtonProps={{
              style: {
                color: "var(--iconActiveColor)",
              },
            }}
            interval={8000}
          >
            {welcomeBanners.map((item, index) => (
              <item.Banner key={index} />
            ))}
          </Carousel>
        ) : (
          <Icon svg="logo-lens" className="logo" />
        )}

        <div className="flex justify-center">
          <div
            style={{ width: `${defaultWidth}px` }}
            data-testid="welcome-text-container"
          >
            <h2>Welcome to {productName} 5!</h2>

            <p>
              To get you started we have auto-detected your clusters in your
              kubeconfig file and added them to the catalog, your centralized
              view for managing all your cloud-native resources.
              <br />
              <br />
              If you have any questions or feedback, please join our{" "}
              <a
                href={slackUrl}
                target="_blank"
                rel="noreferrer"
                className="link"
              >
                Lens Community slack channel
              </a>
              .
            </p>

            <ul
              className="block"
              style={{ width: `${defaultWidth}px` }}
              data-testid="welcome-menu-container"
            >
              {welcomeMenuItems.get().map((item, index) => (
                <li
                  key={index}
                  className="flex grid-12"
                  onClick={() => item.click()}
                >
                  <Icon material={item.icon} className="box col-1" />
                  <a className="box col-10">
                    {typeof item.title === "string"
                      ? item.title
                      : item.title()}
                  </a>
                  <Icon material="navigate_next" className="box col-1" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Welcome = withInjectables<Dependencies>(
  observer(NonInjectedWelcome),

  {
    getProps: (di) => ({
      welcomeMenuItems: di.inject(welcomeMenuItemsInjectable),
      welcomeBannerItems: di.inject(welcomeBannerItemsInjectable),
    }),
  },
);
