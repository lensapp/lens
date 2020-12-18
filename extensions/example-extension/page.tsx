import React from "react";
import { observer } from "mobx-react";
import { CoffeeDoodle } from "react-open-doodles";
import { Component, Interface, K8sApi, LensRendererExtension } from "@k8slens/extensions";

export interface ExamplePageProps extends Interface.PageComponentProps<ExamplePageParams> {
  extension: LensRendererExtension; // provided in "./renderer.tsx"
}

export interface ExamplePageParams {
  exampleId: string;
  selectedNamespaces: K8sApi.Namespace[];
}

export const namespaceStore = K8sApi.apiManager.getStore<K8sApi.NamespaceStore>(K8sApi.namespacesApi);

@observer
export class ExamplePage extends React.Component<ExamplePageProps> {
  async componentDidMount() {
    await namespaceStore.loadAll();
  }

  deactivate = () => {
    const { extension } = this.props;

    extension.disable();
  };

  renderSelectedNamespaces() {
    const { selectedNamespaces } = this.props.params;

    return (
      <div className="flex gaps inline">
        {selectedNamespaces.get().map(ns => {
          const name = ns.getName();

          return <Component.Badge key={name} label={name} tooltip={`Created: ${ns.getAge()}`}/>;
        })}
      </div>
    );
  }

  render() {
    const { exampleId } = this.props.params;

    return (
      <div className="flex column gaps align-flex-start" style={{ padding: 24 }}>
        <div style={{ width: 200 }}>
          <CoffeeDoodle accent="#3d90ce"/>
        </div>

        <div>Hello from Example extension!</div>
        <div>Location: <i>{location.href}</i></div>
        <div>Namespaces: {this.renderSelectedNamespaces()}</div>

        <p className="url-params-demo flex column gaps">
          <a onClick={() => exampleId.set("secret")}>Show secret button</a>
          {exampleId.get() === "secret" && (
            <Component.Button accent label="Deactivate" onClick={this.deactivate}/>
          )}
        </p>
      </div>
    );
  }
}

@observer
export class SimplePage extends React.Component<{ extension: LensRendererExtension }> {
  render() {

    return (
      <div className="flex column gaps align-flex-start" style={{ padding: 24 }}>
        <div style={{ width: 200 }}>
          <CoffeeDoodle accent="#3d90ce"/>
        </div>

        <div>Hello from Example extension!</div>
        <div>Location: <i>{location.href}</i></div>
      </div>
    );
  }
}

export interface SimpleParamsPageProps extends Interface.PageComponentProps<SimpleParamsPageParams> {
  extension: LensRendererExtension; // provided in "./renderer.tsx"
}

export interface SimpleParamsPageParams {
  exampleId: string;
  namespace: string;
}

@observer
export class SimpleParamsPage extends React.Component<SimpleParamsPageProps> {
  deactivate = () => {
    const { extension } = this.props;

    extension.disable();
  };

  renderNamespace() {
    const { namespace } = this.props.params;
    const name = namespace.get();

    return (
      <div className="flex gaps inline">
        <Component.Badge key={name} label={name} />;
      </div>
    );
  }

  render() {
    const { exampleId } = this.props.params;

    return (
      <div className="flex column gaps align-flex-start" style={{ padding: 24 }}>
        <div style={{ width: 200 }}>
          <CoffeeDoodle accent="#3d90ce"/>
        </div>

        <div>Hello from Example extension!</div>
        <div>Location: <i>{location.href}</i></div>
        <div>Namespaces: {this.renderNamespace()}</div>

        <p className="url-params-demo flex column gaps">
          <a onClick={() => exampleId.set("secret")}>Show secret button</a>
          {exampleId.get() === "secret" && (
            <Component.Button accent label="Deactivate" onClick={this.deactivate}/>
          )}
        </p>
      </div>
    );
  }
}

export interface NonStringParamsPageProps extends Interface.PageComponentProps<NonStringParamsPageParams> {
  extension: LensRendererExtension; // provided in "./renderer.tsx"
}

export interface NonStringParamsPageParams {
  exampleId: string;
  namespaceId: Number;
}

@observer
export class NonStringParamsPage extends React.Component<NonStringParamsPageProps> {
  render() {
    const { exampleId, namespaceId } = this.props.params;

    return (
      <div className="flex gaps inline">
        <p>exampleId is {exampleId.get()}</p>
        <p>namespaceId is {namespaceId.get()}</p>
      </div>
    );
  }
}
