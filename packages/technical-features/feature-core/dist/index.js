(()=>{"use strict";var e={d:(t,r)=>{for(var n in r)e.o(r,n)&&!e.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:r[n]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},t={};e.r(t),e.d(t,{getFeature:()=>r,registerFeature:()=>s});const r=e=>e,n=require("@ogre-tools/injectable"),i=(0,n.getInjectionToken)({id:"feature-context-map-injection-token"}),o=(0,n.getInjectable)({id:"feature-store",instantiate:()=>new Map,injectionToken:i}),d=(e,t,r)=>{var s;0===e.injectMany(i).length&&e.register(o);const a=e.inject(o).get(t);if(!r&&a&&0===a.dependedBy.size)throw new Error(`Tried to register feature "${t.id}", but it was already registered.`);const c=a||((e,t)=>{const r=(0,n.getInjectable)({id:e.id,instantiate:t=>({register:()=>{e.register(t)},deregister:()=>{t.deregister(r)},dependedBy:new Map,numberOfRegistrations:0}),scope:!0});t.register(r);const i=t.inject(o),d=t.inject(r);return i.set(e,d),d})(t,e);if(c.numberOfRegistrations++,r){const e=(c.dependedBy.get(r)||0)+1;c.dependedBy.set(r,e)}a||c.register(),null===(s=t.dependencies)||void 0===s||s.forEach((r=>{d(e,r,t)}))},s=(e,...t)=>{t.forEach((t=>{d(e,t)}))};module.exports=t})();