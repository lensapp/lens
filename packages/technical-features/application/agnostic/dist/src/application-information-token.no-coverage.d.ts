export type ApplicationInformation = {
    name: string;
    version: string;
    productName: string;
    copyright: string;
    description: string;
    k8sProxyVersion: string;
    bundledKubectlVersion: string;
    bundledHelmVersion: string;
    sentryDsn: string;
    contentSecurityPolicy: string;
    welcomeRoute: string;
    updatingIsEnabled: boolean;
    dependencies: Partial<Record<string, string>>;
};
export declare const applicationInformationToken: import("@ogre-tools/injectable").InjectionToken<ApplicationInformation, void>;
