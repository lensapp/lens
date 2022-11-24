/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { registerFeature } from "@lensapp/feature-core";
import fsFeature from "@lensapp/fs";
import loggingFeature from "@lensapp/logging";
import shellFeature from "@lensapp/shell";
import awsClustersFeature from "@lensapp/aws-clusters";
import type { DiContainer } from "@ogre-tools/injectable";
import { action, runInAction } from "mobx";

export default action((di: DiContainer) => {
  // registerFeature(di, clusterFeature);
  const clusterFeature = '(()=>{var e={970:(e,t,r)=>{"use strict";r.r(t),r.d(t,{clusterProviderInjectionToken:()=>s,clustersInjectable:()=>u,clustersInjectionToken:()=>c});const o=require("@ogre-tools/injectable"),n=require("mobx"),i=require("@ogre-tools/injectable-extension-for-mobx"),s=(0,o.getInjectionToken)({id:"cluster-provider-injection-token"}),c=(0,o.getInjectionToken)({id:"clusters-injection-token"}),u=(0,o.getInjectable)({id:"clusters",instantiate:e=>{const t=e.inject(i.computedInjectManyInjectable)(s);return(0,n.computed)((()=>t.get().flatMap((e=>e.get()))))},injectionToken:c})},111:(e,t,r)=>{"use strict";r.d(t,{z:()=>n});const o=require("@ogre-tools/injectable-extension-for-auto-registration");e=r.hmd(e);const n={id:"cluster",register:t=>{(0,o.autoRegister)({di:t,targetModule:e,getRequireContexts:()=>[r(888)]})}}},888:(e,t,r)=>{var o={"./clusters.injectable.ts":970};function n(e){var t=i(e);return r(t)}function i(e){if(!r.o(o,e)){var t=new Error("Cannot find module \'"+e+"\'");throw t.code="MODULE_NOT_FOUND",t}return o[e]}n.keys=function(){return Object.keys(o)},n.resolve=i,e.exports=n,n.id=888}},t={};function r(o){var n=t[o];if(void 0!==n)return n.exports;var i=t[o]={id:o,loaded:!1,exports:{}};return e[o](i,i.exports,r),i.loaded=!0,i.exports}r.d=(e,t)=>{for(var o in t)r.o(t,o)&&!r.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},r.hmd=e=>((e=Object.create(e)).children||(e.children=[]),Object.defineProperty(e,"exports",{enumerable:!0,set:()=>{throw new Error("ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: "+e.id)}}),e),r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var o={};(()=>{"use strict";r.r(o),r.d(o,{clusterProviderInjectionToken:()=>t.clusterProviderInjectionToken,clustersInjectionToken:()=>t.clustersInjectionToken,default:()=>n});var e=r(111),t=r(970);const n=e.z})(),module.exports=o})();';

  registerDynamicFeature(di, clusterFeature);

  registerFeature(di, fsFeature);
  registerFeature(di, loggingFeature);

  registerFeature(di, shellFeature);

  registerFeature(di, awsClustersFeature);
});



const registerDynamicFeature = (di: DiContainer, featureJsString: string) => {
  const sandbox = new Function("module", "require", featureJsString);
  const moduleFake = {};

  sandbox(moduleFake, __non_webpack_require__);

  runInAction(() => {
    registerFeature(di, (moduleFake as any).exports.default);
  });
};
