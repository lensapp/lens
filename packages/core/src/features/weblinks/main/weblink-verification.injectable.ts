/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getStartableStoppable } from "@k8slens/startable-stoppable";
import type { Disposer } from "@k8slens/utilities";
import { delay, disposer } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import { random } from "lodash";
import { reaction, runInAction } from "mobx";
import { WebLink } from "../../../common/catalog-entities";
import weblinksInjectable from "../common/weblinks.injectable";
import validateWeblinkInjectable from "./validate-weblink.injectable";
import weblinkVerificationsInjectable from "./weblink-verifications.injectable";

const sixtyMinutes = 60 * 60 * 1000;

const weblinkVerificationStartableStoppableInjectable = getInjectable({
  id: "weblink-verification-startable-stoppable",
  instantiate: (di) => {
    const weblinkVerifications = di.inject(weblinkVerificationsInjectable);
    const validateWeblink = di.inject(validateWeblinkInjectable);
    const weblinks = di.inject(weblinksInjectable);

    const startPeriodicallyCheckingWebLink = (link: WebLink): Disposer => {
      const controller = new AbortController();
      const dispose = disposer(() => controller.abort());

      void (async () => {
        for (;;) {
          const newStatus = await validateWeblink(link.spec.url, controller.signal);

          runInAction(() => {
            link.status.phase = newStatus;
          });

          const nextCheckAfter = sixtyMinutes + random(0, 5 * 60 * 1000, false);

          await delay(nextCheckAfter, controller.signal);

          if (controller.signal.aborted) {
            return;
          }
        }
      })();

      return dispose;
    };

    return getStartableStoppable("weblink-verification", () => disposer(
      reaction(
        () => weblinks.get(),
        (links) => {
          const seenWeblinks = new Set<string>();

          for (const weblinkData of links) {
            seenWeblinks.add(weblinkData.id);

            if (!weblinkVerifications.has(weblinkData.id)) {
              const link = new WebLink({
                metadata: {
                  uid: weblinkData.id,
                  name: weblinkData.name,
                  source: "local",
                  labels: {},
                },
                spec: {
                  url: weblinkData.url,
                },
                status: {
                  phase: "available",
                  active: true,
                },
              });

              weblinkVerifications.set(weblinkData.id, [
                link,
                startPeriodicallyCheckingWebLink(link),
              ]);
            }
          }

          // Stop checking and remove weblinks that are no longer in the store
          for (const [weblinkId, [, disposer]] of weblinkVerifications) {
            if (!seenWeblinks.has(weblinkId)) {
              disposer();
              weblinkVerifications.delete(weblinkId);
            }
          }
        },
        {
          fireImmediately: true,
        },
      ),
      () => {
        // Stop the validations
        for (const [, [, disposer]] of weblinkVerifications) {
          disposer();
        }
      },
    ));
  },
});

export default weblinkVerificationStartableStoppableInjectable;
