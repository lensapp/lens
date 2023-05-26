import { getInjectionToken } from "@ogre-tools/injectable";

export const storesAndApisCanBeCreatedInjectionToken = getInjectionToken<boolean>({
  id: "stores-and-apis-can-be-created-token",
});
