/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RouteProps } from "react-router";
export interface UrlRouteProps extends RouteProps {
    path: string;
}
export interface URLParams<P extends object = {}, Q extends object = {}> {
    params?: P;
    query?: Q;
    fragment?: string;
}
export declare function buildURL<P extends object = {}, Q extends object = {}>(path: string, { params, query, fragment }?: URLParams<P, Q>): string;
export declare function buildURLPositional<P extends object = {}, Q extends object = {}>(path: string): (params?: P, query?: Q, fragment?: string) => string;
export type UrlParamsFor<Pathname extends string> = Pathname extends `${string}/:${infer A}?/${infer Tail}` ? Partial<Record<A, string>> & UrlParamsFor<`/${Tail}`> : Pathname extends `${string}/:${infer A}/${infer Tail}` ? Record<A, string> & UrlParamsFor<`/${Tail}`> : Pathname extends `${string}/:${infer A}?` ? Partial<Record<A, string>> : Pathname extends `${string}/:${infer A}` ? Record<A, string> : {};
export interface UrlBuilder<Pathname extends string> {
    compile(params: UrlParamsFor<Pathname>, query?: object, fragment?: string): string;
}
export declare function urlBuilderFor<Pathname extends string>(pathname: Pathname): UrlBuilder<Pathname>;
