(()=>{var e={984:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>i});var n=r(905);const o=require("electron"),i=(0,n.getInjectable)({id:"electron-app",instantiate:()=>o.app,causesSideEffects:!0})},828:(e,t,r)=>{"use strict";r.d(t,{G:()=>a});const n=require("@k8slens/feature-core"),o=require("@ogre-tools/injectable-extension-for-auto-registration");var i=r(290);e=r.hmd(e);const a=(0,n.getFeature)({id:"application-for-electron-main",register:t=>{(0,o.autoRegister)({di:t,targetModule:e,getRequireContexts:()=>[r(888)]})},dependencies:[i.applicationFeature]})},382:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>d});var n=r(905),o=r(290),i=r(917),a=r(560);const s=require("@k8slens/run-many"),c=require("lodash"),l=(e,t,...r)=>{const n=t.inject(i.default),o=(0,s.runManySyncFor)(t),c=o(a.t),l=o(a.U),d=e(t,...r);return(...e)=>(c(),l(),(async()=>(await n(),d(...e)))())},d=(0,n.getInjectable)({id:"start-electron-application",instantiate:()=>({decorate:(0,c.curry)(l),target:o.startApplicationInjectionToken}),decorable:!1,injectionToken:n.instantiationDecoratorToken,lifecycle:n.lifecycleEnum.singleton})},560:(e,t,r)=>{"use strict";r.d(t,{U:()=>i,t:()=>o});var n=r(905);const o=(0,n.getInjectionToken)({id:"before-anything"}),i=(0,n.getInjectionToken)({id:"before-electron-is-ready-injection-token"})},917:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>i});var n=r(905),o=r(984);const i=(0,n.getInjectable)({id:"when-app-is-ready",instantiate:e=>{const t=e.inject(o.default);return()=>t.whenReady()},decorable:!1})},888:(e,t,r)=>{var n={"./electron/electron-app.injectable.ts":984,"./start-application/start-electron-application.injectable.ts":382,"./start-application/when-app-is-ready.injectable.ts":917};function o(e){var t=i(e);return r(t)}function i(e){if(!r.o(n,e)){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}return n[e]}o.keys=function(){return Object.keys(n)},o.resolve=i,e.exports=o,o.id=888},290:e=>{"use strict";e.exports=require("@k8slens/application")},905:e=>{"use strict";e.exports=require("@ogre-tools/injectable")}},t={};function r(n){var o=t[n];if(void 0!==o)return o.exports;var i=t[n]={id:n,loaded:!1,exports:{}};return e[n](i,i.exports,r),i.loaded=!0,i.exports}r.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return r.d(t,{a:t}),t},r.d=(e,t)=>{for(var n in t)r.o(t,n)&&!r.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},r.hmd=e=>((e=Object.create(e)).children||(e.children=[]),Object.defineProperty(e,"exports",{enumerable:!0,set:()=>{throw new Error("ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: "+e.id)}}),e),r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var n={};(()=>{"use strict";r.r(n),r.d(n,{applicationFeatureForElectronMain:()=>o.G,beforeAnythingInjectionToken:()=>t.t,beforeElectronIsReadyInjectionToken:()=>t.U,testUtils:()=>i});var e=r(917),t=r(560),o=r(828);const i={overrideSideEffectsWithFakes:t=>{t.override(e.default,(()=>()=>Promise.resolve()))}}})(),module.exports=n})();