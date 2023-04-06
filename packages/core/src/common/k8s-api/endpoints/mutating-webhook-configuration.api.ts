/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { LabelSelector, NamespaceScopedMetadata } from "../kube-object";
import { KubeObject } from "../kube-object";

interface MutatingWebhookConfigurationStatus {
  // The latest generation observed by the webhook.
  observedGeneration?: number;

  // Conditions for the MutatingWebhookConfiguration.
  conditions?: {
    // Type of MutatingWebhookConfiguration condition.
    type: string;

    // Status of the condition, one of True, False, Unknown.
    status: string;

    // Reason for the current status of the condition.
    reason?: string;

    // Message describing the current status of the condition.
    message?: string;
  }[];

  // Webhooks that failed to be registered.
  failedWebhooks?: {
    // Name of the failed webhook.
    name: string;

    // Failure type of the webhook.
    failureType: string;

    // Reason for the failure.
    reason?: string;

    // Message describing the failure.
    message?: string;
  }[];

  // Webhooks that are not registered yet.
  webhookConfigurations?: {
    // Name of the webhook configuration.
    name: string;

    // Namespace of the webhook configuration.
    namespace: string;

    // API version of the webhook configuration.
    apiVersion: string;

    // Kind of the webhook configuration.
    kind: string;

    // Object reference to the webhook configuration.
    objectReference?: {
      // API version of the object reference.
      apiVersion?: string;

      // Kind of the object reference.
      kind: string;

      // Name of the object reference.
      name: string;

      // Namespace of the object reference.
      namespace?: string;

      // UID of the object reference.
      uid?: string;
    };
  }[];
}

interface WebhookClientConfig {
  // `url` gives the location of the webhook
  url?: string;

  // `service` is a reference to the service for this webhook. Either `service` or `url` must be specified.
  service?: ServiceReference;

  // `caBundle` is a PEM encoded CA bundle which will be used to validate the webhook's server certificate.
  // If unspecified, system trust roots on the apiserver are used.
  caBundle?: string;
}

interface RuleWithOperations {
  // APIGroups is the API groups the resources belong to. '*' is all groups. If '*' is present, the length of the slice must be one.
  apiGroups: string[];

  // APIVersions is the API versions the resources belong to. '*' is all versions.
  apiVersions?: string[];

  // Resources is a list of resources this rule applies to.
  // For example: 'pods' means pods.
  // '*' means all resources, but not subresources.
  // 'pods/' means all subresources of pods.
  // '*/scale' means all scale subresources. Allowed values are "Resource" / "Resource/Scale" / "Resource/Status".
  resources: string[];

  // Operations is a list of operations this rule applies to.
  // The valid values are: "CREATE" / "UPDATE" / "DELETE" / "CONNECT".
  operations: string[];

  // Scope specifies the scope of this rule. Valid values are "Cluster" / "Namespace".
  // Default is "Cluster".
  scope?: string;
}

interface MutatingWebhook {
  // The name of the webhook configuration.
  name: string;

  // ClientConfig defines how to communicate with the hook.
  clientConfig: WebhookClientConfig;

  // Rules describes what operations on what resources/subresources the webhook cares about.
  // The webhook cares about an operation if it matches _any_ Rule.
  rules?: RuleWithOperations[];

  // AdmissionReviewVersions is an ordered list of preferred `AdmissionReview` versions
  // the webhook expects. API server will try to use first version in the list which it
  // supports. If none of the versions specified in this list supported by API server,
  // validation will fail for this object.
  admissionReviewVersions?: string[];

  // TimeoutSeconds specifies the timeout for this webhook. After the timeout passes, the webhook call will be ignored
  // or the API call will fail depending on the failure policy.
  timeoutSeconds?: number;

  // FailurePolicy specifies how unrecognized errors from the webhook are handled - allowed values are Ignore or Fail.
  // Defaults to Fail.
  failurePolicy?: string;

  // matchPolicy defines how the "rules" list is used to match incoming requests. Allowed values are "Exact" or "Equivalent".
  // - Exact: match a request only if it exactly matches a specified rule.
  // - Equivalent: match a request if modifies a resource listed in rules, even via another API group or version.
  // Defaults to "Equivalent".
  matchPolicy?: string;

  // NamespaceSelector decides whether to run the webhook on an object based on whether the namespace for that object
  // matches the selector. If the object itself is a namespace, the matching is performed on object.metadata.labels.
  // If both the object and the webhook configuration specify namespaceSelector, they must match.
  namespaceSelector?: LabelSelector;

  // ObjectSelector decides whether to run the webhook based on if the object has matching labels.
  // objectSelector and namespaceSelector are ANDed. An empty objectSelector matches all objects.
  // A null objectSelector matches no objects.
  objectSelector?: LabelSelector;

  // SideEffects states whether this webhookk should run when no mutating or validating webhook
  // needs to run. This should be false when the webhook only applies to resources that have
  // the sideEffects field set to None. Defaults to true.
  sideEffects?: string;
}

interface ServiceReference {
  // `namespace` is the namespace of the service.
  namespace: string;

  // `name` is the name of the service.
  name: string;

  // `path` is an optional URL path which will be sent in any request to this service.
  path?: string;

  // `port` is an optional service port which will be used when accessing the service.
  port?: number | string;
}

interface MutatingWebhookConfigurationSpec {
  // Webhooks to be applied.
  webhooks: MutatingWebhook[];

  // CABundle is a PEM encoded CA bundle which will be used to validate webhook's server certificate.
  // If unspecified, system trust roots on the apiserver are used.
  caBundle?: string;

  // Determines the admission success of the MutatingWebhook. Allowed values are "Ignore"/"Fail"/"DryRun".
  // If Ignore, any webhook failure or timeout will be ignored and the API request will be allowed to continue
  // as if the webhook was not configured. You should use this option with caution and only for debugging
  // purposes. If Fail, any webhook failure or timeout will cause the API request to fail. If DryRun,
  // MutatingWebhook will be executed without really modifying the object. This is useful for testing webhook
  // without really modifying objects.
  // Defaults to "Fail".
  failurePolicy?: string;

  // Indicates whether the webhook should be called on the request before or after the object mutation.
  // Allowed values are "None"/"Before"/"After". Mutating admission webhook and validating admission
  // webhook can be configured to perform the mutation changes before or after the resource mutation respectively.
  // If no phases are specified, the webhook is assumed to support all phases.
  sideEffects?: string;

  // ReinvocationPolicy indicates whether this webhook should be called multiple times as part of a single admission
  // evaluation. Allowed values are "Never"/"IfNeeded".
  reinvocationPolicy?: string;
}

export class MutatingWebhookConfiguration extends KubeObject<
  NamespaceScopedMetadata,
  MutatingWebhookConfigurationStatus,
  MutatingWebhookConfigurationSpec
> {
  static kind = "MutatingWebhookConfiguration";
  static namespaced = true;
  static apiBase = "/apis/admissionregistration.k8s.io/v1/mutatingwebhookconfigurations";

  getWebhooks(): MutatingWebhook[] {
    return this.spec?.webhooks ?? [];
  }

  getClientConfig(serviceName: string, serviceNamespace: string): WebhookClientConfig | undefined {
    const webhooks = this.getWebhooks();

    for (const webhook of webhooks) {
      if (webhook.clientConfig.service?.name === serviceName && webhook.clientConfig.service?.namespace === serviceNamespace) {
        return webhook.clientConfig;
      }
    }

    return undefined;
  }

  getCaBundle(): string | undefined {
    return this.spec?.caBundle;
  }

  getFailurePolicy(): string | undefined {
    return this.spec?.failurePolicy;
  }

  getSideEffects(): string | undefined {
    return this.spec?.sideEffects;
  }

  getReinvocationPolicy(): string | undefined {
    return this.spec?.reinvocationPolicy;
  }
}
