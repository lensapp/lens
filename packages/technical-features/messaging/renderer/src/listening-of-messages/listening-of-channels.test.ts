import { createContainer, getInjectable } from "@ogre-tools/injectable";
import { registerFeature } from "@k8slens/feature-core";
import { feature } from "../feature";
import { listeningOfChannelsInjectionToken } from "@k8slens/messaging";
import { getStartableStoppable } from "@k8slens/startable-stoppable";
import { runManyFor } from "@k8slens/run-many";
import { onLoadOfApplicationInjectionToken } from "@k8slens/application";

describe("listening-of-channels", () => {
  it("when before frame starts, starts listening of channels", async () => {
    const di = createContainer("irrelevant");

    registerFeature(di, feature);

    const listeningOfChannelsMock = jest.fn(() => () => {});

    const listeningOfChannelsInjectableStub = getInjectable({
      id: "some-runnable",

      instantiate: () =>
        getStartableStoppable("some-listening-of-channels-implementation", () =>
          listeningOfChannelsMock()
        ),

      injectionToken: listeningOfChannelsInjectionToken,
    });

    di.register(listeningOfChannelsInjectableStub);

    const onLoadOfApplication = runManyFor(di)(
      onLoadOfApplicationInjectionToken
    );

    await onLoadOfApplication();

    expect(listeningOfChannelsMock).toHaveBeenCalled();
  });
});
