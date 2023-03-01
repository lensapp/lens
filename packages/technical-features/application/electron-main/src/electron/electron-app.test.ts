import electronAppInjectable from "./electron-app.injectable";
import { app } from 'electron';
import { createContainer } from "@ogre-tools/injectable";
import { feature } from "../feature";
import { registerFeature } from "@k8slens/feature-core";

describe('electron-app', () => {
  it('is electron app', () => {
    const di = createContainer('irrelevant');

    registerFeature(di, feature)

    const actual = di.inject(electronAppInjectable);

    expect(actual).toBe(app);
  });
});
