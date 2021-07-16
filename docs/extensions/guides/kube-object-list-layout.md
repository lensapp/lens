# KubeObjectListLayout Sample

In this guide we will learn how to list Kubernetes CRD objects on the cluster dashboard.
You can see the complete source code for this guide [here](https://github.com/lensapp/lens-extension-samples/tree/master/custom-resource-page).

![](./images/certificates-crd-list.png)

Next, we will go the implementation through in steps.
To achieve our goal, we need to:

1. [Register ClusterPage and ClusterPageMenu objects](#register-objects-for-clustepages-and-clusterpagemenus)
2. [List Certificate Objects on the Cluster Page](#list-certificate-objects-on-the-cluster-page)
3. [Customize Details Panel](#customize-details-panel)

## Register `clusterPage` and `clusterPageMenu` Objects

First thing we need to do with our extension is to register new menu item in the cluster menu and create a cluster page that is opened when clicking the menu item.
We will do this in our extension class `CrdSampleExtension` that is derived `LensRendererExtension` class:

```typescript
export default class CrdSampleExtension extends Renderer.LensExtension {
}
```

To register menu item in the cluster menu we need to register `PageMenuRegistration` object.
This object will register a menu item with "Certificates" text.
It will also use `CertificateIcon` component to render an icon and navigate to cluster page that is having `certificates` page id.

```typescript
import { Renderer } from "@k8slens/extensions";

type IconProps = Renderer.Component.IconProps;

const {
  Component: {
    Icon,
  },
} = Renderer;

export function CertificateIcon(props: IconProps) {
  return <Icon {...props} material="security" tooltip="Certificates"/>
}

export default class CrdSampleExtension extends Renderer.LensExtension {

  clusterPageMenus = [
    {
      target: { pageId: "certificates" },
      title: "Certificates",
      components: {
        Icon: CertificateIcon,
      }
    },
  ]
}
```

Then we need to register `PageRegistration` object with `certificates` id and define `CertificatePage` component to render certificates.

```typescript
export default class CrdSampleExtension extends Renderer.LensExtension {
  ...

  clusterPages = [{
    id: "certificates",
    components: {
      Page: () => <CertificatePage extension={this} />,
      MenuIcon: CertificateIcon,
    }
  }]
}
```

## List Certificate Objects on the Cluster Page

In the previous step we defined `CertificatePage` component to render certificates.
In this step we will actually implement that.
`CertificatePage` is a React component that will render `Renderer.Component.KubeObjectListLayout` component to list `Certificate` CRD objects.

### Get CRD objects

In order to list CRD objects, we need first fetch those from Kubernetes API.
Lens Extensions API provides easy mechanism to do this.
We just need to define `Certificate` class derived from `Renderer.K8sApi.KubeObject`, `CertificatesApi`derived from `Renderer.K8sApi.KubeApi` and `CertificatesStore` derived from `Renderer.K8sApi.KubeObjectStore`.

`Certificate` class defines properties found in the CRD object:

```typescript
import { Renderer } from "@k8slens/extensions";

const {
  K8sApi: {
    KubeObject,
    KubeObjectStore,
    KubeApi,
    apiManager,
  },
} = Renderer;

export class Certificate extends KubeObject {
  static kind = "Certificate"
  static namespaced = true
  static apiBase = "/apis/cert-manager.io/v1alpha2/certificates"

  kind: string
  apiVersion: string
  metadata: {
    name: string;
    namespace: string;
    selfLink: string;
    uid: string;
    resourceVersion: string;
    creationTimestamp: string;
    labels: {
      [key: string]: string;
    };
    annotations: {
      [key: string]: string;
    };
  }
  spec: {
    dnsNames: string[];
    issuerRef: {
      group: string;
      kind: string;
      name: string;
    }
    secretName: string
  }
  status: {
    conditions: {
      lastTransitionTime: string;
      message: string;
      reason: string;
      status: string;
      type?: string;
    }[];
  }
}
```

With `CertificatesApi` class we are able to manage `Certificate` objects in Kubernetes API:

```typescript
export class CertificatesApi extends KubeApi<Certificate> {}

export const certificatesApi = new CertificatesApi({
  objectConstructor: Certificate
});
```

`CertificateStore` defines storage for `Certificate` objects

```typescript
export class CertificatesStore extends KubeObjectStore<Certificate> {
  api = certificatesApi
}

export const certificatesStore = new CertificatesStore();
```

And, finally, we register this store to Lens's API manager.

```typescript
apiManager.registerStore(certificatesStore);
```


### Create CertificatePage component

Now we have created mechanism to manage `Certificate` objects in Kubernetes API.
Then we need to fetch those and render them in the UI.

First we define `CertificatePage` class that extends `React.Component`.

```typescript
import { Renderer } from "@k8slens/extensions";
import React from "react";
import { certificatesStore } from "../certificate-store";
import { Certificate } from "../certificate"

export class CertificatePage extends React.Component<{ extension: Renderer.LensExtension }> {

}
```

Next we will implement `render` method that will display certificates in a list.
To do that, we just need to add `Renderer.Component.KubeObjectListLayout` component inside `Renderer.Component.TabLayout` component in render method.
To define which objects the list is showing, we need to pass `certificateStore` object to `Renderer.Component.KubeObjectListLayout` in `store` property.
`Renderer.Component.KubeObjectListLayout` will fetch automatically items from the given store when component is mounted.
Also, we can define needed sorting callbacks and search filters for the list:

```typescript
import { Renderer } from "@k8slens/extensions";

const {
  Component: {
    TabLayout,
    KubeObjectListLayout,
  },
} = Renderer;

enum sortBy {
  name = "name",
  namespace = "namespace",
  issuer = "issuer"
}

export class CertificatePage extends React.Component<{ extension: LensRendererExtension }> {
  // ...

  render() {
    return (
      <TabLayout>
        <KubeObjectListLayout
          className="Certificates" store={certificatesStore}
          sortingCallbacks={{
            [sortBy.name]: (certificate: Certificate) => certificate.getName(),
            [sortBy.namespace]: (certificate: Certificate) => certificate.metadata.namespace,
            [sortBy.issuer]: (certificate: Certificate) => certificate.spec.issuerRef.name
          }}
          searchFilters={[
            (certificate: Certificate) => certificate.getSearchFields()
          ]}
          renderHeaderTitle="Certificates"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: sortBy.name },
            { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
            { title: "Issuer", className: "issuer", sortBy: sortBy.namespace },
          ]}
          renderTableContents={(certificate: Certificate) => [
            certificate.getName(),
            certificate.metadata.namespace,
            certificate.spec.issuerRef.name
          ]}
        />
      </TabLayout>
    )
  }
}
```

### Customize Details panel

We have learned now, how to list CRD objects in a list view.
Next, we will learn how to customize details panel that will be opened when the object is clicked in the list.

First, we need to register our custom component to render details for the specific Kubernetes custom resource, in our case `Certificate`.
We will do this again in `CrdSampleExtension` class:

```typescript
export default class CrdSampleExtension extends Renderer.LensExtension {
  //...

  kubeObjectDetailItems = [{
    kind: Certificate.kind,
    apiVersions: ["cert-manager.io/v1alpha2"],
    components: {
      Details: (props: CertificateDetailsProps) => <CertificateDetails {...props} />
    }
  }]
}
```

Here we defined that `CertificateDetails` component will render the resource details.
So, next we need to implement that component.
Lens will inject `Certificate` object into our component so we just need to render some information out of it.
We can use `Renderer.Component.DrawerItem` component from Lens Extensions API to give the same look and feel as Lens is using elsewhere:

```typescript
import { Renderer } from "@k8slens/extensions";
import React from "react";
import { Certificate } from "../certificate";

const {
  Component: {
    KubeObjectDetailsProps,
    DrawerItem,
    Badge,
  }
} = Renderer;

export interface CertificateDetailsProps extends KubeObjectDetailsProps<Certificate>{
}

export class CertificateDetails extends React.Component<CertificateDetailsProps> {

  render() {
    const { object: certificate } = this.props;
    if (!certificate) return null;
    return (
      <div className="Certificate">
        <DrawerItem name="Created">
          {certificate.getAge(true, false)} ago ({certificate.metadata.creationTimestamp })
        </DrawerItem>
        <DrawerItem name="DNS Names">
          {certificate.spec.dnsNames.join(",")}
        </DrawerItem>
        <DrawerItem name="Secret">
          {certificate.spec.secretName}
        </DrawerItem>
        <DrawerItem name="Status" className="status" labelsOnly>
          {certificate.status.conditions.map((condition, index) => {
            const { type, reason, message, status } = condition;
            const kind = type || reason;
            if (!kind) return null;
            return (
              <Badge
                key={kind + index} label={kind}
                className={"success "+kind.toLowerCase()}
                tooltip={message}
              />
            );
          })}
        </DrawerItem>
      </div>
    )
  }
}
```

## Summary

Like we can see above, it's very easy to add custom pages and fetch Kubernetes resources by using Extensions API.
Please see the [complete source code](https://github.com/lensapp/lens-extension-samples/tree/master/custom-resource-page) to test it out.
