// Works around a known @ducanh2912/next-pwa bug: when an offline fallback
// page (app/~offline) plus cacheOnFrontEndNav are configured, the generated
// public/sw.js embeds `cacheWillUpdate`/`handlerDidError` plugin callbacks
// that were downleveled by SWC to call `_async_to_generator`/`_ts_generator`,
// but the helper definitions never get bundled into the service worker file.
// Result: "ReferenceError: _async_to_generator is not defined" at runtime.
// See https://github.com/DuCanhGH/next-pwa/issues/170 (closed, unresolved).
//
// This prepends the same helper implementations SWC/tslib ship
// (@swc/helpers' _async_to_generator, tslib's __generator) so the
// already-generated calls resolve correctly. Safe to run repeatedly.
const fs = require("fs");
const path = require("path");

const swPath = path.join(__dirname, "..", "public", "sw.js");

const HELPERS = `function _async_to_generator(fn){function asyncGeneratorStep(gen,resolve,reject,_next,_throw,key,arg){try{var info=gen[key](arg);var value=info.value}catch(error){reject(error);return}if(info.done){resolve(value)}else{Promise.resolve(value).then(_next,_throw)}}return function(){var self=this,args=arguments;return new Promise(function(resolve,reject){var gen=fn.apply(self,args);function _next(value){asyncGeneratorStep(gen,resolve,reject,_next,_throw,"next",value)}function _throw(err){asyncGeneratorStep(gen,resolve,reject,_next,_throw,"throw",err)}_next(undefined)})}}
function _ts_generator(thisArg,body){var _={label:0,sent:function(){if(t[0]&1)throw t[1];return t[1]},trys:[],ops:[]},f,y,t,g=Object.create((typeof Iterator==="function"?Iterator:Object).prototype);return g.next=verb(0),g["throw"]=verb(1),g["return"]=verb(2),typeof Symbol==="function"&&(g[Symbol.iterator]=function(){return this}),g;function verb(n){return function(v){return step([n,v])}}function step(op){if(f)throw new TypeError("Generator is already executing.");while(g&&(g=0,op[0]&&(_=0)),_)try{if(f=1,y&&(t=op[0]&2?y["return"]:op[0]?y["throw"]||((t=y["return"])&&t.call(y),0):y.next)&&!(t=t.call(y,op[1])).done)return t;if(y=0,t)op=[op[0]&2,t.value];switch(op[0]){case 0:case 1:t=op;break;case 4:_.label++;return{value:op[1],done:false};case 5:_.label++;y=op[1];op=[0];continue;case 7:op=_.ops.pop();_.trys.pop();continue;default:if(!(t=_.trys,t=t.length>0&&t[t.length-1])&&(op[0]===6||op[0]===2)){_=0;continue}if(op[0]===3&&(!t||(op[1]>t[0]&&op[1]<t[3]))){_.label=op[1];break}if(op[0]===6&&_.label<t[1]){_.label=t[1];t=op;break}if(t&&_.label<t[2]){_.label=t[2];_.ops.push(op);break}if(t[2])_.ops.pop();_.trys.pop();continue}op=body.call(thisArg,_)}catch(e){op=[6,e];y=0}finally{f=t=0}if(op[0]&5)throw op[1];return{value:op[0]?op[1]:void 0,done:true}}}
`;

if (!fs.existsSync(swPath)) {
  console.log("[patch-sw] public/sw.js not found, skipping (PWA likely disabled for this build).");
  process.exit(0);
}

const source = fs.readFileSync(swPath, "utf8");

if (!/_async_to_generator|_ts_generator/.test(source)) {
  console.log("[patch-sw] sw.js does not reference the missing helpers, nothing to patch.");
  process.exit(0);
}

if (source.startsWith("function _async_to_generator(")) {
  console.log("[patch-sw] sw.js already patched, skipping.");
  process.exit(0);
}

fs.writeFileSync(swPath, HELPERS + source);
console.log("[patch-sw] Patched public/sw.js with missing SWC/tslib helpers.");
