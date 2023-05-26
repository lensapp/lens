import { pipeline } from "@ogre-tools/fp";
import { DiContainer, getInjectable } from "@ogre-tools/injectable";
import { requireInjectionToken } from "../index";
import { map } from "lodash/fp";
import { Feature, registerFeature } from "@k8slens/feature-core";
import type React from "react";
import { runInAction } from "mobx";

export const installFeaturesInjectable = getInjectable({
  id: "install-features",
  instantiate: (di) => {
    const requireAsd = di.inject(requireInjectionToken);

    const getDynamicFeature = (featureJsString: string) => {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const sandbox = new Function("module", "require", featureJsString);
      const moduleFake = {};

      sandbox(moduleFake, requireAsd);

      console.log("mikko", { moduleFake });

      // @ts-ignore
      return moduleFake.exports.default;
    };

    return async (event: React.ChangeEvent<HTMLInputElement>) => {
      await pipeline(
        event.target.files,
        map((file) => file.text()),
        (x) => Promise.all(x),
        map(getDynamicFeature),
        (y) => {
          runInAction(() => {
            y.forEach((x) => registerFeature(di as unknown as DiContainer, x as Feature));
          });
        },
      );
    };
  },
});
