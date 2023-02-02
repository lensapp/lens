
import { getInjectable } from "@ogre-tools/injectable";
import { applicationInformationToken, ApplicationInformation } from "@k8slens/core/main";
import packageJson from "../../package.json";

const applicationInformationInjectable = getInjectable({
  id: "application-information",
  injectionToken: applicationInformationToken,
  instantiate: () => {
    const { version, config, productName, build, copyright, description, name } = packageJson;

    return { version, config, productName, build, copyright, description, name } as ApplicationInformation;
  },
  causesSideEffects: true,
});

export default applicationInformationInjectable;
