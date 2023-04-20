import { autoRegister } from "@ogre-tools/injectable-extension-for-auto-registration";
import { createContainer } from "@ogre-tools/injectable";

export const getDi = () => {
  const di = createContainer("lens-link");

  autoRegister({
    di,
    targetModule: module,
    getRequireContexts: () => [require.context("./", true, /\.injectable\.(ts|tsx)$/)],
  });

  return di;
};
