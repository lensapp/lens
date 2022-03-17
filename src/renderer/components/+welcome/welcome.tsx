/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
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
  welcomeMenuItems: IComputedValue<WelcomeMenuRegistration[]>;
  welcomeBannerItems: IComputedValue<WelcomeBannerRegistration[]>;
}

const NonInjectedWelcome = observer(({ welcomeMenuItems, welcomeBannerItems }: Dependencies) => {
  const welcomeBanners = welcomeBannerItems.get();

  // if there is banner with specified width, use it to calculate the width of the container
  const maxWidth = Math.max(
    ...welcomeBanners.map(banner => banner.width ?? 0),
    defaultWidth,
  );

  return (
    <div className="flex justify-center Welcome align-center" data-testid="welcome-page">
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
            <h2>
              {`Welcome to ${productName} 5!`}
            </h2>

            <p>
              To get you started we have auto-detected your clusters in your
              {" "}
              kubeconfig file and added them to the catalog, your centralized
              {" "}
              view for managing all your cloud-native resources.
              <br />
              <br />
              {"If you have any questions or feedback, please join our "}
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
});

export const Welcome = withInjectables<Dependencies>(NonInjectedWelcome, {
  getProps: (di) => ({
    welcomeMenuItems: di.inject(welcomeMenuItemsInjectable),
    welcomeBannerItems: di.inject(welcomeBannerItemsInjectable),
  }),
});
