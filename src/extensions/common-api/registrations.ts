/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

export type { AppPreferenceRegistration, AppPreferenceComponents } from "../registries/app-preference-registry";
export type { KubeObjectDetailRegistration, KubeObjectDetailComponents } from "../registries/kube-object-detail-registry";
export type { KubeObjectMenuRegistration, KubeObjectMenuComponents } from "../registries/kube-object-menu-registry";
export type { KubeObjectStatusRegistration } from "../registries/kube-object-status-registry";
export type { PageRegistration, RegisteredPage, PageParams, PageComponentProps, PageComponents, PageTarget } from "../registries/page-registry";
export type { ClusterPageMenuRegistration, ClusterPageMenuComponents } from "../registries/page-menu-registry";
export type { StatusBarRegistration } from "../registries/status-bar-registry";
export type { ProtocolHandlerRegistration, RouteParams as ProtocolRouteParams, RouteHandler as ProtocolRouteHandler } from "../registries/protocol-handler";
