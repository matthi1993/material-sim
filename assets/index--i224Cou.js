(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:f,getOwnPropertySymbols:p,getPrototypeOf:m}=Object,h=globalThis,g=h.trustedTypes,_=g?g.emptyScript:``,v=h.reactiveElementPolyfillSupport,y=(e,t)=>e,b={toAttribute(e,t){switch(t){case Boolean:e=e?_:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},x=(e,t)=>!l(e,t),S={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:x};Symbol.metadata??=Symbol(`metadata`),h.litPropertyMetadata??=new WeakMap;var C=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=S){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??S}static _$Ei(){if(this.hasOwnProperty(y(`elementProperties`)))return;let e=m(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(y(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y(`properties`))){let e=this.properties,t=[...f(e),...p(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?b:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?b:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??x)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};C.elementStyles=[],C.shadowRootOptions={mode:`open`},C[y(`elementProperties`)]=new Map,C[y(`finalized`)]=new Map,v?.({ReactiveElement:C}),(h.reactiveElementVersions??=[]).push(`2.1.2`);var w=globalThis,T=e=>e,E=w.trustedTypes,ee=E?E.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,te=`$lit$`,D=`lit$${Math.random().toFixed(9).slice(2)}$`,ne=`?`+D,re=`<${ne}>`,O=document,ie=()=>O.createComment(``),ae=e=>e===null||typeof e!=`object`&&typeof e!=`function`,oe=Array.isArray,se=e=>oe(e)||typeof e?.[Symbol.iterator]==`function`,ce=`[ 	
\f\r]`,le=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ue=/-->/g,de=/>/g,k=RegExp(`>|${ce}(?:([^\\s"'>=/]+)(${ce}*=${ce}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),fe=/'/g,pe=/"/g,me=/^(?:script|style|textarea|title)$/i,A=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),j=Symbol.for(`lit-noChange`),M=Symbol.for(`lit-nothing`),he=new WeakMap,N=O.createTreeWalker(O,129);function ge(e,t){if(!oe(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return ee===void 0?t:ee.createHTML(t)}var _e=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=le;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===le?c[1]===`!--`?o=ue:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=k):(me.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=k):o=de:o===k?c[0]===`>`?(o=i??le,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?k:c[3]===`"`?pe:fe):o===pe||o===fe?o=k:o===ue||o===de?o=le:(o=k,i=void 0);let d=o===k&&e[t+1].startsWith(`/>`)?` `:``;a+=o===le?n+re:l>=0?(r.push(s),n.slice(0,l)+te+n.slice(l)+D+d):n+D+(l===-2?t:d)}return[ge(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},ve=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=_e(t,n);if(this.el=e.createElement(l,r),N.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=N.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(te)){let t=u[o++],n=i.getAttribute(e).split(D),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?Se:r[1]===`?`?Ce:r[1]===`@`?we:xe}),i.removeAttribute(e)}else e.startsWith(D)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(me.test(i.tagName)){let e=i.textContent.split(D),t=e.length-1;if(t>0){i.textContent=E?E.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],ie()),N.nextNode(),c.push({type:2,index:++a});i.append(e[t],ie())}}}else if(i.nodeType===8)if(i.data===ne)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(D,e+1))!==-1;)c.push({type:7,index:a}),e+=D.length-1}a++}}static createElement(e,t){let n=O.createElement(`template`);return n.innerHTML=e,n}};function P(e,t,n=e,r){if(t===j)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=ae(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=P(e,i._$AS(e,t.values),i,r)),t}var ye=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??O).importNode(t,!0);N.currentNode=r;let i=N.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new be(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new Te(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=N.nextNode(),a++)}return N.currentNode=O,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},be=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=M,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=P(this,e,t),ae(e)?e===M||e==null||e===``?(this._$AH!==M&&this._$AR(),this._$AH=M):e!==this._$AH&&e!==j&&this._(e):e._$litType$===void 0?e.nodeType===void 0?se(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==M&&ae(this._$AH)?this._$AA.nextSibling.data=e:this.T(O.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=ve.createElement(ge(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new ye(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=he.get(e.strings);return t===void 0&&he.set(e.strings,t=new ve(e)),t}k(t){oe(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(ie()),this.O(ie()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=T(e).nextSibling;T(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},xe=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=M,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=M}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=P(this,e,t,0),a=!ae(e)||e!==this._$AH&&e!==j,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=P(this,r[n+o],t,o),s===j&&(s=this._$AH[o]),a||=!ae(s)||s!==this._$AH[o],s===M?e=M:e!==M&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===M?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},Se=class extends xe{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===M?void 0:e}},Ce=class extends xe{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==M)}},we=class extends xe{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=P(this,e,t,0)??M)===j)return;let n=this._$AH,r=e===M&&n!==M||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==M&&(n===M||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Te=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){P(this,e)}},Ee=w.litHtmlPolyfillSupport;Ee?.(ve,be),(w.litHtmlVersions??=[]).push(`3.3.3`);var De=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new be(t.insertBefore(ie(),e),e,void 0,n??{})}return i._$AI(e),i},Oe=globalThis,F=class extends C{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=De(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return j}};F._$litElement$=!0,F.finalized=!0,Oe.litElementHydrateSupport?.({LitElement:F});var ke=Oe.litElementPolyfillSupport;ke?.({LitElement:F}),(Oe.litElementVersions??=[]).push(`4.2.2`);var I=e=>(t,n)=>{n===void 0?customElements.define(e,t):n.addInitializer(()=>{customElements.define(e,t)})},Ae={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:x},je=(e=Ae,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function L(e){return(t,n)=>typeof n==`object`?je(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function R(e){return L({...e,state:!0,attribute:!1})}var Me=(e,t,n)=>(n.configurable=!0,n.enumerable=!0,Reflect.decorate&&typeof t!=`object`&&Object.defineProperty(e,t,n),n);function Ne(e,t){return(n,r,i)=>{let a=t=>t.renderRoot?.querySelector(e)??null;if(t){let{get:e,set:t}=typeof r==`object`?n:i??(()=>{let e=Symbol();return{get(){return this[e]},set(t){this[e]=t}}})();return Me(n,r,{get(){let n=e.call(this);return n===void 0&&(n=a(this),(n!==null||this.hasUpdated)&&t.call(this,n)),n}})}return Me(n,r,{get(){return a(this)}})}}var Pe={key:`argon`,label:`Argon (Ar)`,kind:`atomic`,category:`atoms`,elements:[`Ar`],nn:.3821569655526436,unit:`atoms`,order:120},Fe={key:`bromine-atom`,label:`Bromine atoms (Br)`,kind:`atomic`,category:`atoms`,elements:[`Br`],nn:.26,unit:`atoms`,order:75},Ie={key:`carbon-atom`,label:`Carbon atoms (C)`,kind:`atomic`,category:`atoms`,elements:[`C`],nn:.2,unit:`atoms`,order:71},Le={key:`chlorine-atom`,label:`Chlorine atoms (Cl)`,kind:`atomic`,category:`atoms`,elements:[`Cl`],nn:.24,unit:`atoms`,order:72},Re={key:`copper`,label:`Copper (Cu)`,kind:`atomic`,category:`atoms`,elements:[`Cu`],nn:.2626536608032485,unit:`atoms`,order:150},ze={key:`gold`,label:`Gold (Au)`,kind:`atomic`,category:`atoms`,elements:[`Au`],nn:.2950012937700558,unit:`atoms`,order:160},Be={key:`hydrogen-atom`,label:`Hydrogen atoms (H)`,kind:`atomic`,category:`atoms`,elements:[`H`],nn:.16,unit:`atoms`,order:70},Ve={key:`iron`,label:`Iron (Fe)`,kind:`atomic`,category:`atoms`,elements:[`Fe`],nn:.2559182314846968,unit:`atoms`,order:140},He={key:`neon`,label:`Neon (Ne)`,kind:`atomic`,category:`atoms`,elements:[`Ne`],nn:.312267528822896,unit:`atoms`,order:130},Ue={key:`nickel`,label:`Nickel (Ni)`,kind:`atomic`,category:`atoms`,elements:[`Ni`],nn:.2561424807777825,unit:`atoms`,order:180},We={key:`nitrogen-atom`,label:`Nitrogen atoms (N)`,kind:`atomic`,category:`atoms`,elements:[`N`],nn:.19,unit:`atoms`,order:74},Ge={key:`oxygen-atom`,label:`Oxygen atoms (O)`,kind:`atomic`,category:`atoms`,elements:[`O`],nn:.19,unit:`atoms`,order:73},Ke={key:`silver`,label:`Silver (Ag)`,kind:`atomic`,category:`atoms`,elements:[`Ag`],nn:.29668316071821854,unit:`atoms`,order:170},qe={key:`kbr`,label:`Potassium bromide (KBr)`,kind:`ionic`,category:`ions`,elements:[`K`,`Br`],nn:.33,unit:`formula units`,order:110},Je={key:`kcl`,label:`Potassium chloride (KCl)`,kind:`ionic`,category:`ions`,elements:[`K`,`Cl`],nn:.31,unit:`formula units`,order:100},Ye={key:`salt`,label:`Salt (NaCl)`,kind:`ionic`,category:`ions`,elements:[`Na`,`Cl`],nn:.3,unit:`formula units`,order:90},Xe={key:`co2`,label:`Carbon dioxide (CO2)`,kind:`molecule`,category:`molecules`,elements:[`C`,`O`],nn:.45,unit:`molecules`,order:50,molecule:{sites:[{element:`C`,pos:[0,0,0],charge:.6512,sigma:.2757,epsilon:.2339},{element:`O`,pos:[-.1149,0,0],charge:-.3256,sigma:.3033,epsilon:.6694},{element:`O`,pos:[.1149,0,0],charge:-.3256,sigma:.3033,epsilon:.6694}],bonds:[{a:0,b:1,r0:.1149,k:3e5},{a:0,b:2,r0:.1149,k:3e5}],angles:[{a:1,b:0,c:2,theta0:3.141592653589793,k:1200}]}},Ze={key:`hydrogen`,label:`Hydrogen (H2)`,kind:`molecule`,category:`molecules`,elements:[`H`],nn:.3,unit:`molecules`,order:30,molecule:{sites:[{element:`H`,pos:[-.03705,0,0],charge:0,sigma:.2958,epsilon:.118},{element:`H`,pos:[.03705,0,0],charge:0,sigma:.2958,epsilon:.118}],bonds:[{a:0,b:1,r0:.0741,k:2e5}],angles:[]}},Qe={key:`methane`,label:`Methane (CH4)`,kind:`molecule`,category:`molecules`,elements:[`C`,`H`],nn:.42,unit:`molecules`,order:60,molecule:{sites:[{element:`C`,pos:[0,0,0],charge:-.24,sigma:.35,epsilon:.276},{element:`H`,pos:[.06293117934166921,.06293117934166921,.06293117934166921],charge:.06,sigma:.25,epsilon:.126},{element:`H`,pos:[.06293117934166921,-.06293117934166921,-.06293117934166921],charge:.06,sigma:.25,epsilon:.126},{element:`H`,pos:[-.06293117934166921,.06293117934166921,-.06293117934166921],charge:.06,sigma:.25,epsilon:.126},{element:`H`,pos:[-.06293117934166921,-.06293117934166921,.06293117934166921],charge:.06,sigma:.25,epsilon:.126}],bonds:[{a:0,b:1,r0:.109,k:2e5},{a:0,b:2,r0:.109,k:2e5},{a:0,b:3,r0:.109,k:2e5},{a:0,b:4,r0:.109,k:2e5}],angles:[{a:1,b:0,c:2,theta0:1.9106119321581925,k:300},{a:1,b:0,c:3,theta0:1.9106119321581925,k:300},{a:1,b:0,c:4,theta0:1.9106119321581925,k:300},{a:2,b:0,c:3,theta0:1.9106119321581925,k:300},{a:2,b:0,c:4,theta0:1.9106119321581925,k:300},{a:3,b:0,c:4,theta0:1.9106119321581925,k:300}]}},$e={key:`nitrogen`,label:`Nitrogen (N2)`,kind:`molecule`,category:`molecules`,elements:[`N`],nn:.34,unit:`molecules`,order:40,molecule:{sites:[{element:`N`,pos:[-.0549,0,0],charge:0,sigma:.331,epsilon:.3},{element:`N`,pos:[.0549,0,0],charge:0,sigma:.331,epsilon:.3}],bonds:[{a:0,b:1,r0:.1098,k:35e4}],angles:[]}},et={key:`oxygen`,label:`Oxygen (O2)`,kind:`molecule`,category:`molecules`,elements:[`O`],nn:.33,unit:`molecules`,order:20,molecule:{sites:[{element:`O`,pos:[-.0604,0,0],charge:0,sigma:.3017,epsilon:.5021},{element:`O`,pos:[.0604,0,0],charge:0,sigma:.3017,epsilon:.5021}],bonds:[{a:0,b:1,r0:.1208,k:3e5}],angles:[]}},tt={key:`water`,label:`Water (H2O)`,kind:`molecule`,category:`molecules`,elements:[`O`,`H`],nn:.31,unit:`molecules`,order:10,molecule:{sites:[{element:`O`,pos:[0,0,0]},{element:`H`,pos:[.07569503272636612,.058588227661829494,0]},{element:`H`,pos:[-.07569503272636612,.058588227661829494,0]}],bonds:[{a:0,b:1,r0:.09572,k:2e5},{a:0,b:2,r0:.09572,k:2e5}],angles:[{a:1,b:0,c:2,theta0:1.8242181341844732,k:460}]}},nt={key:`polyethylene`,label:`Polyethylene (PE)`,kind:`molecule`,category:`polymers`,elements:[`C`],nn:4.2,unit:`chains`,order:70,molecule:{sites:[{element:`C`,pos:[-2.387,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-2.233,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-2.079,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-1.925,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-1.771,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-1.617,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-1.463,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-1.309,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-1.155,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-1.001,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-.847,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-.693,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-.539,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-.385,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-.23099999999999998,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-.077,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[.077,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[.23099999999999998,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[.385,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[.539,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[.693,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[.847,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[1.001,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[1.155,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[1.309,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[1.463,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[1.617,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[1.771,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[1.925,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[2.079,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[2.233,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[2.387,0,0],charge:0,sigma:.36,epsilon:.32}],bonds:[{a:0,b:1,r0:.154,k:18e4},{a:1,b:2,r0:.154,k:18e4},{a:0,b:2,r0:.308,k:4e4},{a:2,b:3,r0:.154,k:18e4},{a:1,b:3,r0:.308,k:4e4},{a:0,b:3,r0:.46199999999999997,k:12e3},{a:3,b:4,r0:.154,k:18e4},{a:2,b:4,r0:.308,k:4e4},{a:1,b:4,r0:.46199999999999997,k:12e3},{a:4,b:5,r0:.154,k:18e4},{a:3,b:5,r0:.308,k:4e4},{a:2,b:5,r0:.46199999999999997,k:12e3},{a:5,b:6,r0:.154,k:18e4},{a:4,b:6,r0:.308,k:4e4},{a:3,b:6,r0:.46199999999999997,k:12e3},{a:6,b:7,r0:.154,k:18e4},{a:5,b:7,r0:.308,k:4e4},{a:4,b:7,r0:.46199999999999997,k:12e3},{a:7,b:8,r0:.154,k:18e4},{a:6,b:8,r0:.308,k:4e4},{a:5,b:8,r0:.46199999999999997,k:12e3},{a:8,b:9,r0:.154,k:18e4},{a:7,b:9,r0:.308,k:4e4},{a:6,b:9,r0:.46199999999999997,k:12e3},{a:9,b:10,r0:.154,k:18e4},{a:8,b:10,r0:.308,k:4e4},{a:7,b:10,r0:.46199999999999997,k:12e3},{a:10,b:11,r0:.154,k:18e4},{a:9,b:11,r0:.308,k:4e4},{a:8,b:11,r0:.46199999999999997,k:12e3},{a:11,b:12,r0:.154,k:18e4},{a:10,b:12,r0:.308,k:4e4},{a:9,b:12,r0:.46199999999999997,k:12e3},{a:12,b:13,r0:.154,k:18e4},{a:11,b:13,r0:.308,k:4e4},{a:10,b:13,r0:.46199999999999997,k:12e3},{a:13,b:14,r0:.154,k:18e4},{a:12,b:14,r0:.308,k:4e4},{a:11,b:14,r0:.46199999999999997,k:12e3},{a:14,b:15,r0:.154,k:18e4},{a:13,b:15,r0:.308,k:4e4},{a:12,b:15,r0:.46199999999999997,k:12e3},{a:15,b:16,r0:.154,k:18e4},{a:14,b:16,r0:.308,k:4e4},{a:13,b:16,r0:.46199999999999997,k:12e3},{a:16,b:17,r0:.154,k:18e4},{a:15,b:17,r0:.308,k:4e4},{a:14,b:17,r0:.46199999999999997,k:12e3},{a:17,b:18,r0:.154,k:18e4},{a:16,b:18,r0:.308,k:4e4},{a:15,b:18,r0:.46199999999999997,k:12e3},{a:18,b:19,r0:.154,k:18e4},{a:17,b:19,r0:.308,k:4e4},{a:16,b:19,r0:.46199999999999997,k:12e3},{a:19,b:20,r0:.154,k:18e4},{a:18,b:20,r0:.308,k:4e4},{a:17,b:20,r0:.46199999999999997,k:12e3},{a:20,b:21,r0:.154,k:18e4},{a:19,b:21,r0:.308,k:4e4},{a:18,b:21,r0:.46199999999999997,k:12e3},{a:21,b:22,r0:.154,k:18e4},{a:20,b:22,r0:.308,k:4e4},{a:19,b:22,r0:.46199999999999997,k:12e3},{a:22,b:23,r0:.154,k:18e4},{a:21,b:23,r0:.308,k:4e4},{a:20,b:23,r0:.46199999999999997,k:12e3},{a:23,b:24,r0:.154,k:18e4},{a:22,b:24,r0:.308,k:4e4},{a:21,b:24,r0:.46199999999999997,k:12e3},{a:24,b:25,r0:.154,k:18e4},{a:23,b:25,r0:.308,k:4e4},{a:22,b:25,r0:.46199999999999997,k:12e3},{a:25,b:26,r0:.154,k:18e4},{a:24,b:26,r0:.308,k:4e4},{a:23,b:26,r0:.46199999999999997,k:12e3},{a:26,b:27,r0:.154,k:18e4},{a:25,b:27,r0:.308,k:4e4},{a:24,b:27,r0:.46199999999999997,k:12e3},{a:27,b:28,r0:.154,k:18e4},{a:26,b:28,r0:.308,k:4e4},{a:25,b:28,r0:.46199999999999997,k:12e3},{a:28,b:29,r0:.154,k:18e4},{a:27,b:29,r0:.308,k:4e4},{a:26,b:29,r0:.46199999999999997,k:12e3},{a:29,b:30,r0:.154,k:18e4},{a:28,b:30,r0:.308,k:4e4},{a:27,b:30,r0:.46199999999999997,k:12e3},{a:30,b:31,r0:.154,k:18e4},{a:29,b:31,r0:.308,k:4e4},{a:28,b:31,r0:.46199999999999997,k:12e3}],angles:[{a:0,b:1,c:2,theta0:2.8797932657906435,k:2200},{a:1,b:2,c:3,theta0:2.8797932657906435,k:2200},{a:2,b:3,c:4,theta0:2.8797932657906435,k:2200},{a:3,b:4,c:5,theta0:2.8797932657906435,k:2200},{a:4,b:5,c:6,theta0:2.8797932657906435,k:2200},{a:5,b:6,c:7,theta0:2.8797932657906435,k:2200},{a:6,b:7,c:8,theta0:2.8797932657906435,k:2200},{a:7,b:8,c:9,theta0:2.8797932657906435,k:2200},{a:8,b:9,c:10,theta0:2.8797932657906435,k:2200},{a:9,b:10,c:11,theta0:2.8797932657906435,k:2200},{a:10,b:11,c:12,theta0:2.8797932657906435,k:2200},{a:11,b:12,c:13,theta0:2.8797932657906435,k:2200},{a:12,b:13,c:14,theta0:2.8797932657906435,k:2200},{a:13,b:14,c:15,theta0:2.8797932657906435,k:2200},{a:14,b:15,c:16,theta0:2.8797932657906435,k:2200},{a:15,b:16,c:17,theta0:2.8797932657906435,k:2200},{a:16,b:17,c:18,theta0:2.8797932657906435,k:2200},{a:17,b:18,c:19,theta0:2.8797932657906435,k:2200},{a:18,b:19,c:20,theta0:2.8797932657906435,k:2200},{a:19,b:20,c:21,theta0:2.8797932657906435,k:2200},{a:20,b:21,c:22,theta0:2.8797932657906435,k:2200},{a:21,b:22,c:23,theta0:2.8797932657906435,k:2200},{a:22,b:23,c:24,theta0:2.8797932657906435,k:2200},{a:23,b:24,c:25,theta0:2.8797932657906435,k:2200},{a:24,b:25,c:26,theta0:2.8797932657906435,k:2200},{a:25,b:26,c:27,theta0:2.8797932657906435,k:2200},{a:26,b:27,c:28,theta0:2.8797932657906435,k:2200},{a:27,b:28,c:29,theta0:2.8797932657906435,k:2200},{a:28,b:29,c:30,theta0:2.8797932657906435,k:2200},{a:29,b:30,c:31,theta0:2.8797932657906435,k:2200}]}},rt={key:`polyvinylchloride`,label:`Polyvinyl chloride (PVC)`,kind:`molecule`,category:`polymers`,elements:[`C`,`Cl`],nn:4.4,unit:`chains`,order:80,molecule:{sites:[{element:`C`,pos:[-1.771,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-1.617,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-1.463,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-1.309,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-1.155,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-1.001,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-.847,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-.693,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-.539,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-.385,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-.23099999999999998,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[-.077,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[.077,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[.23099999999999998,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[.385,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[.539,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[.693,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[.847,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[1.001,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[1.155,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[1.309,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[1.463,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[1.617,0,0],charge:0,sigma:.36,epsilon:.32},{element:`C`,pos:[1.771,0,0],charge:0,sigma:.36,epsilon:.32},{element:`Cl`,pos:[-1.617,.19,0],charge:-.12,sigma:.42,epsilon:.38},{element:`Cl`,pos:[-1.309,.19,0],charge:-.12,sigma:.42,epsilon:.38},{element:`Cl`,pos:[-1.001,.19,0],charge:-.12,sigma:.42,epsilon:.38},{element:`Cl`,pos:[-.693,.19,0],charge:-.12,sigma:.42,epsilon:.38},{element:`Cl`,pos:[-.385,.19,0],charge:-.12,sigma:.42,epsilon:.38},{element:`Cl`,pos:[-.077,.19,0],charge:-.12,sigma:.42,epsilon:.38},{element:`Cl`,pos:[.23099999999999998,.19,0],charge:-.12,sigma:.42,epsilon:.38},{element:`Cl`,pos:[.539,.19,0],charge:-.12,sigma:.42,epsilon:.38},{element:`Cl`,pos:[.847,.19,0],charge:-.12,sigma:.42,epsilon:.38},{element:`Cl`,pos:[1.155,.19,0],charge:-.12,sigma:.42,epsilon:.38},{element:`Cl`,pos:[1.463,.19,0],charge:-.12,sigma:.42,epsilon:.38},{element:`Cl`,pos:[1.771,.19,0],charge:-.12,sigma:.42,epsilon:.38}],bonds:[{a:0,b:1,r0:.154,k:18e4},{a:1,b:2,r0:.154,k:18e4},{a:0,b:2,r0:.308,k:4e4},{a:2,b:3,r0:.154,k:18e4},{a:1,b:3,r0:.308,k:4e4},{a:0,b:3,r0:.46199999999999997,k:12e3},{a:3,b:4,r0:.154,k:18e4},{a:2,b:4,r0:.308,k:4e4},{a:1,b:4,r0:.46199999999999997,k:12e3},{a:4,b:5,r0:.154,k:18e4},{a:3,b:5,r0:.308,k:4e4},{a:2,b:5,r0:.46199999999999997,k:12e3},{a:5,b:6,r0:.154,k:18e4},{a:4,b:6,r0:.308,k:4e4},{a:3,b:6,r0:.46199999999999997,k:12e3},{a:6,b:7,r0:.154,k:18e4},{a:5,b:7,r0:.308,k:4e4},{a:4,b:7,r0:.46199999999999997,k:12e3},{a:7,b:8,r0:.154,k:18e4},{a:6,b:8,r0:.308,k:4e4},{a:5,b:8,r0:.46199999999999997,k:12e3},{a:8,b:9,r0:.154,k:18e4},{a:7,b:9,r0:.308,k:4e4},{a:6,b:9,r0:.46199999999999997,k:12e3},{a:9,b:10,r0:.154,k:18e4},{a:8,b:10,r0:.308,k:4e4},{a:7,b:10,r0:.46199999999999997,k:12e3},{a:10,b:11,r0:.154,k:18e4},{a:9,b:11,r0:.308,k:4e4},{a:8,b:11,r0:.46199999999999997,k:12e3},{a:11,b:12,r0:.154,k:18e4},{a:10,b:12,r0:.308,k:4e4},{a:9,b:12,r0:.46199999999999997,k:12e3},{a:12,b:13,r0:.154,k:18e4},{a:11,b:13,r0:.308,k:4e4},{a:10,b:13,r0:.46199999999999997,k:12e3},{a:13,b:14,r0:.154,k:18e4},{a:12,b:14,r0:.308,k:4e4},{a:11,b:14,r0:.46199999999999997,k:12e3},{a:14,b:15,r0:.154,k:18e4},{a:13,b:15,r0:.308,k:4e4},{a:12,b:15,r0:.46199999999999997,k:12e3},{a:15,b:16,r0:.154,k:18e4},{a:14,b:16,r0:.308,k:4e4},{a:13,b:16,r0:.46199999999999997,k:12e3},{a:16,b:17,r0:.154,k:18e4},{a:15,b:17,r0:.308,k:4e4},{a:14,b:17,r0:.46199999999999997,k:12e3},{a:17,b:18,r0:.154,k:18e4},{a:16,b:18,r0:.308,k:4e4},{a:15,b:18,r0:.46199999999999997,k:12e3},{a:18,b:19,r0:.154,k:18e4},{a:17,b:19,r0:.308,k:4e4},{a:16,b:19,r0:.46199999999999997,k:12e3},{a:19,b:20,r0:.154,k:18e4},{a:18,b:20,r0:.308,k:4e4},{a:17,b:20,r0:.46199999999999997,k:12e3},{a:20,b:21,r0:.154,k:18e4},{a:19,b:21,r0:.308,k:4e4},{a:18,b:21,r0:.46199999999999997,k:12e3},{a:21,b:22,r0:.154,k:18e4},{a:20,b:22,r0:.308,k:4e4},{a:19,b:22,r0:.46199999999999997,k:12e3},{a:22,b:23,r0:.154,k:18e4},{a:21,b:23,r0:.308,k:4e4},{a:20,b:23,r0:.46199999999999997,k:12e3},{a:1,b:24,r0:.177,k:11e4},{a:3,b:25,r0:.177,k:11e4},{a:5,b:26,r0:.177,k:11e4},{a:7,b:27,r0:.177,k:11e4},{a:9,b:28,r0:.177,k:11e4},{a:11,b:29,r0:.177,k:11e4},{a:13,b:30,r0:.177,k:11e4},{a:15,b:31,r0:.177,k:11e4},{a:17,b:32,r0:.177,k:11e4},{a:19,b:33,r0:.177,k:11e4},{a:21,b:34,r0:.177,k:11e4},{a:23,b:35,r0:.177,k:11e4}],angles:[{a:0,b:1,c:2,theta0:2.8797932657906435,k:2200},{a:1,b:2,c:3,theta0:2.8797932657906435,k:2200},{a:2,b:3,c:4,theta0:2.8797932657906435,k:2200},{a:3,b:4,c:5,theta0:2.8797932657906435,k:2200},{a:4,b:5,c:6,theta0:2.8797932657906435,k:2200},{a:5,b:6,c:7,theta0:2.8797932657906435,k:2200},{a:6,b:7,c:8,theta0:2.8797932657906435,k:2200},{a:7,b:8,c:9,theta0:2.8797932657906435,k:2200},{a:8,b:9,c:10,theta0:2.8797932657906435,k:2200},{a:9,b:10,c:11,theta0:2.8797932657906435,k:2200},{a:10,b:11,c:12,theta0:2.8797932657906435,k:2200},{a:11,b:12,c:13,theta0:2.8797932657906435,k:2200},{a:12,b:13,c:14,theta0:2.8797932657906435,k:2200},{a:13,b:14,c:15,theta0:2.8797932657906435,k:2200},{a:14,b:15,c:16,theta0:2.8797932657906435,k:2200},{a:15,b:16,c:17,theta0:2.8797932657906435,k:2200},{a:16,b:17,c:18,theta0:2.8797932657906435,k:2200},{a:17,b:18,c:19,theta0:2.8797932657906435,k:2200},{a:18,b:19,c:20,theta0:2.8797932657906435,k:2200},{a:19,b:20,c:21,theta0:2.8797932657906435,k:2200},{a:20,b:21,c:22,theta0:2.8797932657906435,k:2200},{a:21,b:22,c:23,theta0:2.8797932657906435,k:2200},{a:0,b:1,c:24,theta0:1.9198621771937625,k:900},{a:2,b:1,c:24,theta0:1.9198621771937625,k:900},{a:2,b:3,c:25,theta0:1.9198621771937625,k:900},{a:4,b:3,c:25,theta0:1.9198621771937625,k:900},{a:4,b:5,c:26,theta0:1.9198621771937625,k:900},{a:6,b:5,c:26,theta0:1.9198621771937625,k:900},{a:6,b:7,c:27,theta0:1.9198621771937625,k:900},{a:8,b:7,c:27,theta0:1.9198621771937625,k:900},{a:8,b:9,c:28,theta0:1.9198621771937625,k:900},{a:10,b:9,c:28,theta0:1.9198621771937625,k:900},{a:10,b:11,c:29,theta0:1.9198621771937625,k:900},{a:12,b:11,c:29,theta0:1.9198621771937625,k:900},{a:12,b:13,c:30,theta0:1.9198621771937625,k:900},{a:14,b:13,c:30,theta0:1.9198621771937625,k:900},{a:14,b:15,c:31,theta0:1.9198621771937625,k:900},{a:16,b:15,c:31,theta0:1.9198621771937625,k:900},{a:16,b:17,c:32,theta0:1.9198621771937625,k:900},{a:18,b:17,c:32,theta0:1.9198621771937625,k:900},{a:18,b:19,c:33,theta0:1.9198621771937625,k:900},{a:20,b:19,c:33,theta0:1.9198621771937625,k:900},{a:20,b:21,c:34,theta0:1.9198621771937625,k:900},{a:22,b:21,c:34,theta0:1.9198621771937625,k:900},{a:22,b:23,c:35,theta0:1.9198621771937625,k:900}]}},it={key:`air`,label:`Air (N2 + O2)`,topic:`gases`,topicLabel:`Gases`,topicOrder:20,order:30,config:{components:[{materialKey:`nitrogen`,count:150},{materialKey:`oxygen`,count:40}],box:[4.5,4.5,4.5],dt:5e-4,temperature:220}},at={key:`argon`,label:`Argon gas`,topic:`gases`,topicLabel:`Gases`,topicOrder:20,order:60,config:{components:[{materialKey:`argon`,count:800}],box:[6,6,6],dt:.002,temperature:120}},ot={key:`co2`,label:`Carbon dioxide`,topic:`gases`,topicLabel:`Gases`,topicOrder:20,order:40,config:{components:[{materialKey:`co2`,count:130}],box:[4,4,4],dt:5e-4,temperature:250}},st={key:`hydrogen`,label:`Hydrogen gas`,topic:`gases`,topicLabel:`Gases`,topicOrder:20,order:20,config:{components:[{materialKey:`hydrogen`,count:200}],box:[4,4,4],dt:4e-4,temperature:120}},ct={key:`methane`,label:`Methane`,topic:`gases`,topicLabel:`Gases`,topicOrder:20,order:50,config:{components:[{materialKey:`methane`,count:130}],box:[4,4,4],dt:4e-4,temperature:150}},lt={key:`neon`,label:`Neon gas`,topic:`gases`,topicLabel:`Gases`,topicOrder:20,order:70,config:{components:[{materialKey:`neon`,count:800}],box:[5,5,5],dt:.002,temperature:50}},ut={key:`noble-mix`,label:`Noble gas mix`,topic:`gases`,topicLabel:`Gases`,topicOrder:20,order:80,config:{components:[{materialKey:`argon`,count:400},{materialKey:`neon`,count:400}],box:[6,6,6],dt:.002,temperature:90}},dt={key:`oxygen`,label:`Oxygen gas`,topic:`gases`,topicLabel:`Gases`,topicOrder:20,order:10,config:{components:[{materialKey:`oxygen`,count:160}],box:[4,4,4],dt:5e-4,temperature:200}},ft={key:`reactive-hc`,label:`Reactive H/C mix`,topic:`gases`,topicLabel:`Gases`,topicOrder:20,order:65,config:{components:[{materialKey:`carbon-atom`,count:22},{materialKey:`hydrogen-atom`,count:76}],box:[1.8,1.8,1.8],dt:25e-5,temperature:180}},pt={key:`reactive-mix`,label:`Reactive element mix`,topic:`gases`,topicLabel:`Gases`,topicOrder:20,order:66,config:{components:[{materialKey:`carbon-atom`,count:20},{materialKey:`hydrogen-atom`,count:52},{materialKey:`chlorine-atom`,count:10},{materialKey:`oxygen-atom`,count:10},{materialKey:`nitrogen-atom`,count:10}],box:[2.2,2.2,2.2],dt:2e-4,temperature:190}},mt={key:`salt`,label:`Salt crystal`,topic:`ionic`,topicLabel:`Ionic solids`,topicOrder:40,order:10,config:{components:[{materialKey:`salt`,count:256}],box:[2.4,2.4,2.4],dt:5e-4,temperature:300}},ht={key:`brine`,label:`Brine`,topic:`liquids`,topicLabel:`Liquids`,topicOrder:10,order:30,config:{components:[{materialKey:`water`,count:200},{materialKey:`salt`,count:28}],box:[2,2,2],dt:5e-4,temperature:320}},gt={key:`kcl-solution`,label:`KCl solution`,topic:`liquids`,topicLabel:`Liquids`,topicOrder:10,order:40,config:{components:[{materialKey:`water`,count:230},{materialKey:`kcl`,count:14}],box:[2,2,2],dt:5e-4,temperature:310}},_t={key:`saline`,label:`Saltwater`,topic:`liquids`,topicLabel:`Liquids`,topicOrder:10,order:20,config:{components:[{materialKey:`water`,count:240},{materialKey:`salt`,count:12}],box:[2,2,2],dt:5e-4,temperature:310}},vt={key:`water`,label:`Water`,topic:`liquids`,topicLabel:`Liquids`,topicOrder:10,order:10,config:{components:[{materialKey:`water`,count:267}],box:[2,2,2],dt:5e-4,temperature:298}},yt={key:`copper`,label:`Copper crystal`,topic:`metals`,topicLabel:`Metals`,topicOrder:50,order:20,config:{components:[{materialKey:`copper`,count:729}],box:[2.34,2.34,2.34],dt:2e-4,temperature:300}},bt={key:`gold`,label:`Gold crystal`,topic:`metals`,topicLabel:`Metals`,topicOrder:50,order:30,config:{components:[{materialKey:`gold`,count:729}],box:[2.63,2.63,2.63],dt:2e-4,temperature:300}},xt={key:`iron`,label:`Iron crystal`,topic:`metals`,topicLabel:`Metals`,topicOrder:50,order:10,config:{components:[{materialKey:`iron`,count:729}],box:[2.3,2.3,2.3],dt:2e-4,temperature:300}},St={key:`silver`,label:`Silver crystal`,topic:`metals`,topicLabel:`Metals`,topicOrder:50,order:40,config:{components:[{materialKey:`silver`,count:729}],box:[2.64,2.64,2.64],dt:2e-4,temperature:300}},Ct={key:`polyethylene-melt`,label:`Polyethylene melt`,topic:`polymers`,topicLabel:`Polymers`,topicOrder:30,order:10,config:{components:[{materialKey:`polyethylene`,count:8}],box:[8.2,8.2,8.2],dt:2e-4,temperature:260}},wt={key:`pvc-melt`,label:`PVC melt`,topic:`polymers`,topicLabel:`Polymers`,topicOrder:30,order:20,config:{components:[{materialKey:`polyvinylchloride`,count:7}],box:[8,8,8],dt:2e-4,temperature:295}},z={O:{id:0,symbol:`O`,mass:15.9994,charge:-.834,sigma:.315061,epsilon:.636386},H:{id:1,symbol:`H`,mass:1.008,charge:.417,sigma:0,epsilon:0},Na:{id:2,symbol:`Na`,mass:22.98977,charge:1,sigma:.2584,epsilon:.4184},Cl:{id:3,symbol:`Cl`,mass:35.453,charge:-1,sigma:.4401,epsilon:.4184},Ar:{id:4,symbol:`Ar`,mass:39.948,charge:0,sigma:.3405,epsilon:.996},Fe:{id:5,symbol:`Fe`,mass:55.845,charge:0,sigma:.228,epsilon:25},Cu:{id:6,symbol:`Cu`,mass:63.546,charge:0,sigma:.234,epsilon:22},K:{id:7,symbol:`K`,mass:39.0983,charge:1,sigma:.3334,epsilon:.4184},Br:{id:8,symbol:`Br`,mass:79.904,charge:-1,sigma:.4625,epsilon:.4184},Ne:{id:9,symbol:`Ne`,mass:20.1797,charge:0,sigma:.2782,epsilon:.2966},Au:{id:10,symbol:`Au`,mass:196.9666,charge:0,sigma:.2629,epsilon:22},Ag:{id:11,symbol:`Ag`,mass:107.8682,charge:0,sigma:.2644,epsilon:19},Ni:{id:12,symbol:`Ni`,mass:58.6934,charge:0,sigma:.2282,epsilon:23},C:{id:13,symbol:`C`,mass:12.011,charge:0,sigma:.35,epsilon:.276},N:{id:14,symbol:`N`,mass:14.007,charge:0,sigma:.331,epsilon:.3}};function Tt(e){return e.charge??e.el.charge}function Et(e){return e.sigma??e.el.sigma}function Dt(e){return e.epsilon??e.el.epsilon}var Ot=.00831446261815324,kt=138.935458,At=z;function jt(e,t){let n=t,r=n.elements.map(t=>{let n=At[t];if(!n)throw Error(`Unknown element symbol "${t}" in ${e}`);return n}),i={key:n.key,label:n.label,kind:n.kind,category:n.category,elements:r,nn:n.nn,unit:n.unit};if(n.kind===`molecule`)if(n.molecule)i.molecule={sites:n.molecule.sites.map(t=>{let n=At[t.element];if(!n)throw Error(`Unknown molecule site element "${t.element}" in ${e}`);return{el:n,pos:t.pos,charge:t.charge,sigma:t.sigma,epsilon:t.epsilon}}),bonds:n.molecule.bonds,angles:n.molecule.angles.map(e=>({a:e.a,b:e.b,c:e.c,theta0:e.theta0,k:e.k}))};else throw Error(`Molecule material must define molecule in ${e}`);return{...i,order:n.order??2**53-1}}function Mt(e){let t=e;return{key:t.key,label:t.label,topic:t.topic,topicLabel:t.topicLabel,config:t.config,order:t.order??2**53-1,topicOrder:t.topicOrder??2**53-1}}var Nt=Object.assign({"../assets/catalog/materials/atoms/argon.json":Pe,"../assets/catalog/materials/atoms/bromine-atom.json":Fe,"../assets/catalog/materials/atoms/carbon.json":Ie,"../assets/catalog/materials/atoms/chlorine.json":Le,"../assets/catalog/materials/atoms/copper.json":Re,"../assets/catalog/materials/atoms/gold.json":ze,"../assets/catalog/materials/atoms/hydrogen.json":Be,"../assets/catalog/materials/atoms/iron.json":Ve,"../assets/catalog/materials/atoms/neon.json":He,"../assets/catalog/materials/atoms/nickel.json":Ue,"../assets/catalog/materials/atoms/nitrogen-atom.json":We,"../assets/catalog/materials/atoms/oxygen-atom.json":Ge,"../assets/catalog/materials/atoms/silver.json":Ke,"../assets/catalog/materials/ions/kbr.json":qe,"../assets/catalog/materials/ions/kcl.json":Je,"../assets/catalog/materials/ions/salt.json":Ye,"../assets/catalog/materials/molecules/co2.json":Xe,"../assets/catalog/materials/molecules/hydrogen.json":Ze,"../assets/catalog/materials/molecules/methane.json":Qe,"../assets/catalog/materials/molecules/nitrogen.json":$e,"../assets/catalog/materials/molecules/oxygen.json":et,"../assets/catalog/materials/molecules/water.json":tt,"../assets/catalog/materials/polymers/polyethylene.json":nt,"../assets/catalog/materials/polymers/polyvinylchloride.json":rt}),Pt=Object.assign({"../assets/catalog/presets/gases/air.json":it,"../assets/catalog/presets/gases/argon.json":at,"../assets/catalog/presets/gases/co2.json":ot,"../assets/catalog/presets/gases/hydrogen.json":st,"../assets/catalog/presets/gases/methane.json":ct,"../assets/catalog/presets/gases/neon.json":lt,"../assets/catalog/presets/gases/noble-mix.json":ut,"../assets/catalog/presets/gases/oxygen.json":dt,"../assets/catalog/presets/gases/reactive-hc.json":ft,"../assets/catalog/presets/gases/reactive-mix.json":pt,"../assets/catalog/presets/ionic/salt-crystal.json":mt,"../assets/catalog/presets/liquids/brine.json":ht,"../assets/catalog/presets/liquids/kcl-solution.json":gt,"../assets/catalog/presets/liquids/saline.json":_t,"../assets/catalog/presets/liquids/water.json":vt,"../assets/catalog/presets/metals/copper.json":yt,"../assets/catalog/presets/metals/gold.json":bt,"../assets/catalog/presets/metals/iron.json":xt,"../assets/catalog/presets/metals/silver.json":St,"../assets/catalog/presets/polymers/polyethylene-melt.json":Ct,"../assets/catalog/presets/polymers/pvc-melt.json":wt}),Ft=Object.entries(Nt).map(([e,t])=>jt(e,t)).sort((e,t)=>e.order-t.order||e.label.localeCompare(t.label)),It=Object.fromEntries(Ft.map(e=>[e.key,e])),B=Ft.map(({order:e,...t})=>t),Lt=[{key:`molecules`,label:`Molecules`},{key:`polymers`,label:`Polymers`},{key:`ions`,label:`Ions`},{key:`atoms`,label:`Atoms & metals`}],V=Object.values(Pt).map(e=>Mt(e)).sort((e,t)=>e.topicOrder===t.topicOrder?e.topic===t.topic?e.order-t.order||e.label.localeCompare(t.label):e.topic.localeCompare(t.topic):e.topicOrder-t.topicOrder).map(({order:e,topicOrder:t,...n})=>n),Rt=new Map;for(let e of V)Rt.has(e.topic)||Rt.set(e.topic,{key:e.topic,label:e.topicLabel});var zt=[...Rt.values()];V[0]?.config;var H={targetTemperature:300,thermostatEnabled:!0,forceGuardEnabled:!0,reactiveBondingEnabled:!0,cutoffRadius:.9,stepsPerFrame:8,boundaryMode:`periodic`},Bt={atomScale:1,forceOpacity:1,showForces:!0,showBonds:!0,showBox:!0,periodicTilesX:1,periodicTilesY:1,periodicTilesZ:1};function U(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var W=class extends F{constructor(...e){super(...e),this.label=``,this.unit=``,this.value=0,this.min=0,this.max=100,this.step=1}clamp(e){return Math.min(this.max,Math.max(this.min,e))}emit(e){this.dispatchEvent(new CustomEvent(`value-change`,{detail:this.clamp(e),bubbles:!0,composed:!0}))}render(){return A`
      <label class="field">
        <span class="label-row">
          <span>${this.label}${this.unit?` (${this.unit})`:``}</span>
          <input
            class="value-input"
            type="number"
            min=${this.min}
            max=${this.max}
            step=${this.step}
            .value=${String(this.value)}
            @change=${e=>this.emit(Number(e.target.value))}
          />
        </span>
        <input
          type="range"
          min=${this.min}
          max=${this.max}
          step=${this.step}
          .value=${String(this.value)}
          @input=${e=>this.emit(Number(e.target.value))}
        />
      </label>
    `}static{this.styles=o`
    .field {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      font-size: 0.8rem;
    }
    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--color-text-dim);
    }
    .value-input {
      width: 5.5em;
      padding: 2px 4px;
      box-sizing: border-box;
      text-align: right;
      color: var(--color-text);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      background: var(--color-bg);
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
    }
    .value-input:focus {
      outline: none;
      border-color: var(--color-accent);
    }
    input[type='range'] {
      width: 100%;
      accent-color: var(--color-accent);
      background: transparent;
    }
  `}};U([L()],W.prototype,`label`,void 0),U([L()],W.prototype,`unit`,void 0),U([L({type:Number})],W.prototype,`value`,void 0),U([L({type:Number})],W.prototype,`min`,void 0),U([L({type:Number})],W.prototype,`max`,void 0),U([L({type:Number})],W.prototype,`step`,void 0),W=U([I(`number-field`)],W);var Vt=class extends F{constructor(...e){super(...e),this.view={...Bt}}setView(e){this.view={...this.view,...e},this.dispatchEvent(new CustomEvent(`view-change`,{detail:this.view,bubbles:!0,composed:!0}))}toggle(e,t,n){return A`
      <label class="toggle">
        <span>${e}</span>
        <input
          type="checkbox"
          .checked=${t}
          @change=${e=>n(e.target.checked)}
        />
      </label>
    `}render(){let e=this.view;return A`
      <div class="group">
        <number-field label="Atom size" .value=${e.atomScale} min="0.2" max="5" step="0.1"
          @value-change=${e=>this.setView({atomScale:e.detail})}></number-field>
        <number-field label="Force line opacity" .value=${e.forceOpacity} min="0" max="1" step="0.05"
          @value-change=${e=>this.setView({forceOpacity:e.detail})}></number-field>
        <number-field label="Periodic tiles X" .value=${e.periodicTilesX} min="1" max="6" step="1"
          @value-change=${e=>this.setView({periodicTilesX:Math.max(1,Math.round(e.detail))})}></number-field>
        <number-field label="Periodic tiles Y" .value=${e.periodicTilesY} min="1" max="6" step="1"
          @value-change=${e=>this.setView({periodicTilesY:Math.max(1,Math.round(e.detail))})}></number-field>
        <number-field label="Periodic tiles Z" .value=${e.periodicTilesZ} min="1" max="6" step="1"
          @value-change=${e=>this.setView({periodicTilesZ:Math.max(1,Math.round(e.detail))})}></number-field>
        ${this.toggle(`Show force lines`,e.showForces,e=>this.setView({showForces:e}))}
        ${this.toggle(`Show bonds`,e.showBonds,e=>this.setView({showBonds:e}))}
        ${this.toggle(`Show box`,e.showBox,e=>this.setView({showBox:e}))}
      </div>
    `}static{this.styles=o`
    .group {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .toggle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: var(--color-text-dim);
    }
    .toggle input {
      accent-color: var(--color-accent);
      width: 16px;
      height: 16px;
    }
  `}};U([R()],Vt.prototype,`view`,void 0),Vt=U([I(`view-controls`)],Vt);var G=class extends F{constructor(...e){super(...e),this.activeConfig=null,this.running=!1,this.boundaryMode=H.boundaryMode,this.stepsPerFrame=H.stepsPerFrame,this.targetTemperature=H.targetTemperature,this.thermostatEnabled=H.thermostatEnabled,this.forceGuardEnabled=H.forceGuardEnabled,this.reactiveBondingEnabled=H.reactiveBondingEnabled,this.cutoffRadius=H.cutoffRadius,this.showSetup=!1,this.presetKey=Wt()?.key??``,this.filter=`all`,this.search=``,this.amounts=Ut(K()),this.bx=K().box[0],this.by=K().box[1],this.bz=K().box[2],this.temp=K().temperature,this.dtFs=K().dt*1e3,this.openSetup=()=>{this.showSetup=!0},this.closeSetup=()=>{this.showSetup=!1},this.toggleRun=()=>{this.dispatchEvent(new CustomEvent(`toggle-run`,{bubbles:!0,composed:!0}))},this.resetSetup=()=>{let e=K();this.presetKey=``,this.search=``,this.filter=`all`,this.amounts=Ht(),this.bx=e.box[0],this.by=e.box[1],this.bz=e.box[2],this.dtFs=e.dt*1e3,this.temp=e.temperature},this.startSimulation=()=>{this.dispatchEvent(new CustomEvent(`config-change`,{detail:this.buildConfig(),bubbles:!0,composed:!0})),this.showSetup=!1}}firstUpdated(){this.startSimulation()}willUpdate(e){e.has(`activeConfig`)&&this.activeConfig&&this.applyConfig(this.activeConfig)}setRuntime(e){this.dispatchEvent(new CustomEvent(`runtime-change`,{detail:e,bubbles:!0,composed:!0}))}setAmount(e,t){this.amounts={...this.amounts,[e]:Math.max(0,Math.round(t))}}nudgeAmount(e,t){this.setAmount(e,(this.amounts[e]??0)+t)}applyPreset(e){let t=V.find(t=>t.key===e);t&&(this.presetKey=e,this.applyConfig(t.config))}applyConfig(e){let t=Ht();for(let n of e.components)t[n.materialKey]=n.count;this.amounts=t,this.bx=e.box[0],this.by=e.box[1],this.bz=e.box[2],this.dtFs=e.dt*1e3,this.temp=e.temperature;let n=V.find(t=>Gt(t.config,e));this.presetKey=n?.key??``}buildConfig(){return{components:B.filter(e=>(this.amounts[e.key]??0)>0).map(e=>({materialKey:e.key,count:Math.round(this.amounts[e.key])})),box:[this.bx,this.by,this.bz],dt:this.dtFs/1e3,temperature:this.temp}}get hasSelection(){return B.some(e=>(this.amounts[e.key]??0)>0)}get estimatedAtoms(){let e=0;for(let t of B){let n=Math.max(0,Math.round(this.amounts[t.key]??0));n<=0||(e+=n*Kt(t))}return e}get filteredMaterials(){let e=this.search.trim().toLowerCase();return B.filter(t=>this.filter===`all`||t.category===this.filter?e?t.label.toLowerCase().includes(e)||t.key.toLowerCase().includes(e):!0:!1)}mixtureSummary(){let e=B.filter(e=>(this.amounts[e.key]??0)>0);return e.length===0?`No particles selected`:e.slice(0,3).map(e=>`${e.label.replace(/ \(.*\)$/,``)}: ${this.amounts[e.key]}`).join(` | `)}boundaryButton(e,t){return A`
      <button
        class="boundary-option ${this.boundaryMode===e?`active`:``}"
        @click=${()=>this.setRuntime({boundaryMode:e})}
      >
        ${t}
      </button>
    `}runtimeField(e,t,n,r,i,a,o){return A`
      <number-field
        label=${e}
        unit=${a}
        .value=${t}
        min=${String(n)}
        max=${String(r)}
        step=${String(i)}
        @value-change=${e=>this.setRuntime(o(e.detail))}
      ></number-field>
    `}renderMaterialFilter(){return A`
      <div class="filter-row">
        ${[{key:`all`,label:`All`},...Lt.map(e=>({key:e.key,label:e.label}))].map(e=>A`
            <button
              class="filter-chip ${this.filter===e.key?`active`:``}"
              @click=${()=>this.filter=e.key}
            >
              ${e.label}
            </button>
          `)}
      </div>
    `}renderMaterialRow(e){let t=this.amounts[e.key]??0;return A`
      <div class="material-row ${e.category===`polymers`?`polymer`:``}">
        <div class="material-meta">
          <strong>${e.label}</strong>
          <span>${e.unit}</span>
        </div>
        <div class="stepper">
          <button @click=${()=>this.nudgeAmount(e.key,-1)} aria-label="Decrease">-</button>
          <input
            type="number"
            min="0"
            max="1000"
            step="1"
            .value=${String(t)}
            @change=${t=>this.setAmount(e.key,Number(t.target.value))}
          />
          <button @click=${()=>this.nudgeAmount(e.key,1)} aria-label="Increase">+</button>
        </div>
      </div>
    `}renderMaterialList(){if(this.filteredMaterials.length===0)return A`<p class="empty">No matching materials.</p>`;let e=[],t=null;for(let n of this.filteredMaterials){if(this.filter===`all`&&n.category!==t){t=n.category;let r=Lt.find(e=>e.key===n.category)?.label??n.category;e.push(A`<p class="category-sep">${r}</p>`)}e.push(this.renderMaterialRow(n))}return e}runtimeToggle(e,t,n){return A`
      <button class="toggle-button ${t?`on`:``}" @click=${()=>this.setRuntime(n)}>
        <span>${e}</span>
        <span class="toggle-pill" aria-hidden="true"><i></i></span>
      </button>
    `}renderSetupDialog(){return this.showSetup?A`
      <div class="dialog-backdrop" @click=${this.closeSetup}>
        <section class="dialog" @click=${e=>e.stopPropagation()}>
          <header class="dialog-head">
            <div>
              <h2>Create Simulation</h2>
              <p>Build a new scene with presets or custom particle counts.</p>
            </div>
            <button class="icon-btn" @click=${this.closeSetup} aria-label="Close">x</button>
          </header>

          <div class="preset-strip">
            ${this.renderPresetGroups()}
          </div>

          <div class="dialog-grid">
            <section class="pane pane-materials">
              <h3>Particles</h3>
              <input
                class="search"
                type="text"
                placeholder="Search materials..."
                .value=${this.search}
                @input=${e=>this.search=e.target.value}
              />
              ${this.renderMaterialFilter()}
              <div class="material-list">
                ${this.renderMaterialList()}
              </div>
            </section>

            <section class="pane pane-conditions">
              <h3>Conditions</h3>
              <div class="conditions-grid">
                <number-field label="Box X" unit="nm" .value=${this.bx} min="1" max="20" step="0.1"
                  @value-change=${e=>this.bx=e.detail}></number-field>
                <number-field label="Box Y" unit="nm" .value=${this.by} min="1" max="20" step="0.1"
                  @value-change=${e=>this.by=e.detail}></number-field>
                <number-field label="Box Z" unit="nm" .value=${this.bz} min="1" max="20" step="0.1"
                  @value-change=${e=>this.bz=e.detail}></number-field>
                <number-field label="Initial temperature" unit="K" .value=${this.temp} min="1" max="3000" step="1"
                  @value-change=${e=>this.temp=e.detail}></number-field>
                <number-field label="Timestep" unit="fs" .value=${this.dtFs} min="0.05" max="5.0" step="0.05"
                  @value-change=${e=>this.dtFs=e.detail}></number-field>
              </div>
            </section>

            <aside class="pane pane-summary">
              <h3>Summary</h3>
              <div class="summary-card">
                <div>
                  <span>Selected materials</span>
                  <b>${B.filter(e=>(this.amounts[e.key]??0)>0).length}</b>
                </div>
                <div>
                  <span>Estimated atoms</span>
                  <b>${this.estimatedAtoms}</b>
                </div>
                <div>
                  <span>Polymer chains</span>
                  <b>${B.filter(e=>e.category===`polymers`).reduce((e,t)=>e+(this.amounts[t.key]??0),0)}</b>
                </div>
              </div>
            </aside>
          </div>

          <footer class="dialog-actions">
            <button class="ghost" @click=${this.resetSetup}>Reset</button>
            <button class="ghost" @click=${this.closeSetup}>Cancel</button>
            <button class="primary" ?disabled=${!this.hasSelection} @click=${this.startSimulation}>
              Start Simulation
            </button>
          </footer>
        </section>
      </div>
    `:null}render(){return A`
      <aside class="panel">
        <div class="head">
          <div>
            <h1>material-sim</h1>
            <p class="subtitle">${this.mixtureSummary()}</p>
          </div>
          <button class="new-btn" @click=${this.openSetup}>New Simulation</button>
        </div>

        <section class="section-block">
          <h2>Runtime</h2>
          <div class="actions">
            <button class="pause-btn" @click=${this.toggleRun}>
              ${this.running?`Pause`:`Resume`}
            </button>
          </div>
          <div class="toggle-stack">
            ${this.runtimeToggle(`Thermostat`,this.thermostatEnabled,{thermostatEnabled:!this.thermostatEnabled})}
            ${this.runtimeToggle(`Force Guard`,this.forceGuardEnabled,{forceGuardEnabled:!this.forceGuardEnabled})}
            ${this.runtimeToggle(`Reactive Bonding`,this.reactiveBondingEnabled,{reactiveBondingEnabled:!this.reactiveBondingEnabled})}
          </div>
          <div class="group">
            ${this.runtimeField(`Simulation speed`,this.stepsPerFrame,1,64,1,`steps/frame`,e=>({stepsPerFrame:Math.max(1,Math.round(e))}))}
            ${this.runtimeField(`Cutoff`,this.cutoffRadius,.3,2,.05,`nm`,e=>({cutoffRadius:e}))}
            ${this.runtimeField(`Target temperature`,this.targetTemperature,1,3e3,1,`K`,e=>({targetTemperature:e}))}
          </div>
          <div class="boundary-group">
            <span class="boundary-label">Boundary</span>
            <div class="boundary-options">
              ${this.boundaryButton(`periodic`,`Periodic`)}
              ${this.boundaryButton(`open`,`Open`)}
              ${this.boundaryButton(`open-top`,`Open Top`)}
            </div>
          </div>
        </section>

        <section class="section-block">
          <h2>View</h2>
          <view-controls></view-controls>
        </section>
      </aside>

      ${this.renderSetupDialog()}
    `}renderPresetGroups(){return zt.map(e=>{let t=V.filter(t=>t.topic===e.key);return t.length===0?null:A`
        <div class="preset-group">
          <p class="preset-group-title">${e.label}</p>
          <div class="preset-group-items">
            ${t.map(e=>A`
                <button
                  class="preset-pill ${this.presetKey===e.key?`active`:``}"
                  @click=${()=>this.applyPreset(e.key)}
                >
                  ${e.label}
                </button>
              `)}
          </div>
        </div>
      `})}static{this.styles=o`
    .panel {
      position: absolute;
      top: calc(var(--titlebar-height) + var(--space-md));
      left: var(--space-md);
      width: var(--panel-width);
      max-height: calc(100vh - var(--titlebar-height) - 2 * var(--space-md));
      overflow-y: auto;
      box-sizing: border-box;
      padding: var(--space-lg);
      background: color-mix(in srgb, var(--color-panel) 88%, transparent);
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
      backdrop-filter: blur(10px);
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
      z-index: 3;
    }

    .head {
      display: flex;
      justify-content: space-between;
      gap: var(--space-md);
      align-items: flex-start;
    }

    h1 {
      margin: 0;
      font-size: 1.1rem;
      letter-spacing: 0.03em;
    }

    h2 {
      margin: 0;
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--color-text-dim);
    }

    .subtitle {
      margin: var(--space-xs) 0 0;
      color: var(--color-text-dim);
      font-size: 0.73rem;
      line-height: 1.4;
      max-width: 18rem;
    }

    .new-btn,
    .ghost,
    .primary,
    .boundary-option,
    .icon-btn,
    .preset-pill,
    .filter-chip,
    .stepper button {
      padding: var(--space-sm) var(--space-md);
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--color-panel) 90%, transparent);
      color: var(--color-text);
      font: inherit;
      font-size: 0.78rem;
      cursor: pointer;
    }

    .new-btn {
      white-space: nowrap;
      border-color: var(--color-accent);
      color: var(--color-accent);
    }

    .ghost {
      color: var(--color-text-dim);
    }

    .primary {
      background: var(--color-accent);
      border-color: var(--color-accent);
    }

    .primary[disabled] {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .section-block {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      padding: var(--space-md);
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--color-panel) 92%, transparent);
    }

    .group {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .actions {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: var(--space-sm);
      align-items: center;
    }

    .pause-btn {
      padding: var(--space-sm) var(--space-md);
      border: 1px solid var(--color-accent);
      border-radius: var(--radius);
      background: var(--color-accent);
      color: var(--color-text);
      font: inherit;
      cursor: pointer;
    }

    .toggle-button {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-sm);
      width: 100%;
      padding: 0.42rem 0.5rem;
      border: 1px solid var(--color-panel-border);
      border-radius: 8px;
      background: color-mix(in srgb, var(--color-panel) 95%, transparent);
      color: var(--color-text-dim);
      font: inherit;
      font-size: 0.78rem;
      cursor: pointer;
    }

    .toggle-stack {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .toggle-button.on {
      border-color: color-mix(in srgb, var(--color-accent) 65%, var(--color-panel-border));
      color: var(--color-text);
      background: color-mix(in srgb, var(--color-accent-dim) 45%, var(--color-panel));
    }

    .toggle-pill {
      width: 2.1rem;
      height: 1.2rem;
      border-radius: 999px;
      background: var(--color-track);
      border: 1px solid var(--color-panel-border);
      display: inline-flex;
      align-items: center;
      padding: 2px;
      box-sizing: border-box;
      transition: background 120ms ease;
    }

    .toggle-pill i {
      width: 0.8rem;
      height: 0.8rem;
      border-radius: 999px;
      background: var(--color-text-dim);
      transform: translateX(0);
      transition: transform 120ms ease, background 120ms ease;
    }

    .toggle-button.on .toggle-pill {
      background: var(--color-accent-dim);
      border-color: color-mix(in srgb, var(--color-accent) 60%, var(--color-panel-border));
    }

    .toggle-button.on .toggle-pill i {
      background: var(--color-accent);
      transform: translateX(0.84rem);
    }

    .boundary-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .boundary-label {
      color: var(--color-text-dim);
      font-size: 0.75rem;
    }

    .boundary-options {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--space-xs);
    }

    .boundary-option {
      padding: var(--space-sm) var(--space-xs);
      color: var(--color-text-dim);
      font-size: 0.74rem;
    }

    .boundary-option.active {
      color: var(--color-text);
      border-color: var(--color-accent);
      background: var(--color-accent-dim);
    }

    .dialog-backdrop {
      position: fixed;
      inset: 0;
      z-index: 40;
      background: color-mix(in srgb, var(--color-bg) 72%, transparent);
      backdrop-filter: blur(3px);
      display: grid;
      place-items: center;
      padding: var(--space-lg);
    }

    .dialog {
      width: min(72rem, calc(100vw - 2 * var(--space-lg)));
      max-height: calc(100vh - 2 * var(--space-lg));
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      background:
        radial-gradient(120% 120% at 0% 0%, color-mix(in srgb, var(--color-accent-dim) 40%, transparent), transparent 60%),
        var(--color-panel);
      border: 1px solid var(--color-panel-border);
      border-radius: 14px;
      box-shadow: 0 20px 70px rgba(0, 0, 0, 0.45);
      padding: var(--space-lg);
    }

    .dialog-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-md);
    }

    .dialog-head h2 {
      margin: 0;
      text-transform: none;
      letter-spacing: 0.01em;
      color: var(--color-text);
      font-size: 1.2rem;
    }

    .dialog-head p {
      margin: var(--space-xs) 0 0;
      color: var(--color-text-dim);
      font-size: 0.82rem;
    }

    .icon-btn {
      width: 2rem;
      height: 2rem;
      padding: 0;
      line-height: 1;
    }

    .preset-strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
      gap: var(--space-sm);
      padding-bottom: var(--space-sm);
      border-bottom: 1px solid var(--color-panel-border);
    }

    .preset-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .preset-group-title {
      margin: 0;
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-text-dim);
    }

    .preset-group-items {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-xs);
    }

    .preset-pill {
      padding: 0.35rem 0.55rem;
      color: var(--color-text-dim);
      font-size: 0.72rem;
    }

    .preset-pill.active {
      color: var(--color-text);
      border-color: var(--color-accent);
      background: var(--color-accent-dim);
    }

    .dialog-grid {
      flex: 1;
      min-height: 0;
      display: grid;
      grid-template-columns: 1.4fr 1fr 0.7fr;
      gap: var(--space-md);
    }

    .pane {
      min-height: 0;
      overflow: hidden;
      border: 1px solid var(--color-panel-border);
      border-radius: 10px;
      padding: var(--space-md);
      background: color-mix(in srgb, var(--color-panel) 94%, transparent);
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .pane h3 {
      margin: 0;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--color-text-dim);
    }

    .search {
      width: 100%;
      padding: 0.45rem 0.55rem;
      color: var(--color-text);
      background: var(--color-bg);
      border: 1px solid var(--color-panel-border);
      border-radius: 8px;
      font: inherit;
      box-sizing: border-box;
    }

    .search:focus {
      outline: none;
      border-color: var(--color-accent);
    }

    .filter-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-xs);
    }

    .filter-chip {
      padding: 0.25rem 0.55rem;
      font-size: 0.7rem;
      color: var(--color-text-dim);
    }

    .filter-chip.active {
      color: var(--color-text);
      border-color: var(--color-accent);
      background: var(--color-accent-dim);
    }

    .material-list {
      overflow: auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      padding-right: 0.15rem;
    }

    .category-sep {
      margin: 0.35rem 0 0;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-text-dim);
    }

    .material-row {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: var(--space-sm);
      padding: 0.5rem;
      border: 1px solid var(--color-panel-border);
      border-radius: 8px;
      background: color-mix(in srgb, var(--color-panel) 96%, transparent);
    }

    .material-row.polymer {
      border-color: color-mix(in srgb, var(--color-accent) 60%, var(--color-panel-border));
      background: color-mix(in srgb, var(--color-accent-dim) 35%, var(--color-panel));
    }

    .material-meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
      gap: 2px;
    }

    .material-meta strong {
      font-size: 0.77rem;
      line-height: 1.2;
    }

    .material-meta span {
      font-size: 0.68rem;
      color: var(--color-text-dim);
    }

    .stepper {
      display: grid;
      grid-template-columns: 1.7rem 3.6rem 1.7rem;
      gap: 2px;
      align-items: center;
    }

    .stepper button {
      padding: 0;
      height: 1.8rem;
      font-size: 0.95rem;
    }

    .stepper input {
      width: 100%;
      box-sizing: border-box;
      height: 1.8rem;
      border-radius: 8px;
      border: 1px solid var(--color-panel-border);
      background: var(--color-bg);
      color: var(--color-text);
      text-align: center;
      font: inherit;
      font-size: 0.78rem;
    }

    .stepper input:focus {
      outline: none;
      border-color: var(--color-accent);
    }

    .conditions-grid {
      overflow: auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .summary-card {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      padding: var(--space-sm);
      border: 1px solid var(--color-panel-border);
      border-radius: 8px;
      background: color-mix(in srgb, var(--color-panel) 96%, transparent);
    }

    .summary-card div {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: var(--space-sm);
    }

    .summary-card span {
      color: var(--color-text-dim);
      font-size: 0.72rem;
    }

    .summary-card b {
      font-family: var(--font-mono);
      font-size: 0.95rem;
    }

    .empty {
      margin: 0;
      color: var(--color-text-dim);
      font-size: 0.75rem;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-sm);
      border-top: 1px solid var(--color-panel-border);
      padding-top: var(--space-md);
    }

    button:hover {
      filter: brightness(1.08);
    }

    @media (max-width: 1100px) {
      .dialog-grid {
        grid-template-columns: 1fr;
      }

      .pane-summary {
        order: -1;
      }
    }

    @media (max-width: 760px) {
      .panel {
        width: calc(100vw - 2 * var(--space-md));
        max-height: 48vh;
      }

      .actions {
        grid-template-columns: 1fr;
      }

      .boundary-options {
        grid-template-columns: 1fr;
      }

      .dialog {
        width: calc(100vw - 2 * var(--space-md));
        max-height: calc(100vh - 2 * var(--space-md));
        padding: var(--space-md);
      }

      .dialog-actions {
        justify-content: stretch;
      }

      .dialog-actions button {
        flex: 1;
      }
    }
  `}};U([L({attribute:!1})],G.prototype,`activeConfig`,void 0),U([L({type:Boolean})],G.prototype,`running`,void 0),U([L()],G.prototype,`boundaryMode`,void 0),U([L({type:Number})],G.prototype,`stepsPerFrame`,void 0),U([L({type:Number})],G.prototype,`targetTemperature`,void 0),U([L({type:Boolean})],G.prototype,`thermostatEnabled`,void 0),U([L({type:Boolean})],G.prototype,`forceGuardEnabled`,void 0),U([L({type:Boolean})],G.prototype,`reactiveBondingEnabled`,void 0),U([L({type:Number})],G.prototype,`cutoffRadius`,void 0),U([R()],G.prototype,`showSetup`,void 0),U([R()],G.prototype,`presetKey`,void 0),U([R()],G.prototype,`filter`,void 0),U([R()],G.prototype,`search`,void 0),U([R()],G.prototype,`amounts`,void 0),U([R()],G.prototype,`bx`,void 0),U([R()],G.prototype,`by`,void 0),U([R()],G.prototype,`bz`,void 0),U([R()],G.prototype,`temp`,void 0),U([R()],G.prototype,`dtFs`,void 0),G=U([I(`control-panel`)],G);function Ht(){let e={};for(let t of B)e[t.key]=0;return e}function Ut(e){let t=Ht();for(let n of e.components)t[n.materialKey]=n.count;return t}function Wt(){return V[0]}function K(){return Wt()?.config??{components:[{materialKey:`argon`,count:1}],box:[2,2,2],dt:.001,temperature:300}}function Gt(e,t){if(e.dt!==t.dt||e.temperature!==t.temperature||e.box[0]!==t.box[0]||e.box[1]!==t.box[1]||e.box[2]!==t.box[2]||e.components.length!==t.components.length)return!1;let n=[...e.components].sort((e,t)=>e.materialKey.localeCompare(t.materialKey)),r=[...t.components].sort((e,t)=>e.materialKey.localeCompare(t.materialKey));for(let e=0;e<n.length;e++){let t=n[e],i=r[e];if(t.materialKey!==i.materialKey||t.count!==i.count)return!1}return!0}function Kt(e){return e.kind===`molecule`&&e.molecule?e.molecule.sites.length:e.kind===`ionic`?2:1}function qt(e){return e>0?e.toFixed(0):`—`}function Jt(e){return Number.isNaN(e)?`—`:`${e.toFixed(0)} K`}function Yt(e){if(!(e>0))return`0 fs`;let t=[{threshold:1440*60*0xe8d4a51000,scale:1440*60*0xe8d4a51000,label:`d`},{threshold:3600*0xe8d4a51000,scale:3600*0xe8d4a51000,label:`h`},{threshold:60*0xe8d4a51000,scale:60*0xe8d4a51000,label:`min`},{threshold:0xe8d4a51000,scale:0xe8d4a51000,label:`s`},{threshold:1e9,scale:1e9,label:`ms`},{threshold:1e6,scale:1e6,label:`us`},{threshold:1e3,scale:1e3,label:`ns`},{threshold:1,scale:1,label:`ps`},{threshold:0,scale:.001,label:`fs`}],n=t.find(t=>e>=t.threshold)??t[t.length-1],r=e/n.scale,i=r>=100?0:r>=10?1:r>=1?2:3;return`${r.toFixed(i)} ${n.label}`}function Xt(e){return{fps:qt(e.fps),atoms:e.numAtoms.toLocaleString(),temperature:Jt(e.temperature),simulatedTime:Yt(e.simulatedTimePs)}}var Zt=class extends F{constructor(...e){super(...e),this.stats=null}render(){let e=this.stats?Xt(this.stats):null;return A`
      <div class="overlay">
        <div class="stats">
          <div><span>FPS</span><b>${e?e.fps:`—`}</b></div>
          <div><span>Atoms</span><b>${e?e.atoms:`—`}</b></div>
          <div><span>Temp</span><b>${e?e.temperature:`—`}</b></div>
          <div><span>Time</span><b>${e?e.simulatedTime:`0 fs`}</b></div>
        </div>
      </div>
    `}static{this.styles=o`
    .overlay {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      width: min(20rem, calc(100vw - 2 * var(--space-md)));
      padding: var(--space-md);
      background: var(--color-overlay);
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
      backdrop-filter: blur(8px);
      font-size: 0.8rem;
    }
    .stats {
      display: flex;
      gap: var(--space-lg);
    }
    .stats div {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }
    .stats span {
      color: var(--color-text-dim);
      font-size: 0.62rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .stats b {
      font-family: var(--font-mono);
      font-weight: 600;
      font-size: 0.95rem;
    }
  `}};U([L({attribute:!1})],Zt.prototype,`stats`,void 0),Zt=U([I(`stats-overlay`)],Zt);var Qt=class extends F{constructor(...e){super(...e),this.entries=[]}render(){return this.entries.length===0?null:A`
      <div class="legend">
        <p class="title">Structures</p>
        <div class="list">
          ${this.entries.map(e=>this.renderEntry(e))}
        </div>
      </div>
    `}renderEntry(e){return A`
      <div class="item">
        <span class="name">${e.count} x ${e.name}</span>
        <span class="kind">${e.kind}</span>
      </div>
    `}static{this.styles=o`
    :host {
      position: absolute;
      bottom: var(--space-md);
      right: var(--space-md);
      z-index: 2;
    }
    .legend {
      width: min(24rem, calc(100vw - 2 * var(--space-md)));
      max-height: min(38vh, 20rem);
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      padding: var(--space-md);
      background: var(--color-overlay);
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
      backdrop-filter: blur(8px);
      font-family: var(--font-ui);
      color: var(--color-text);
    }
    .title {
      margin: 0;
      color: var(--color-text-dim);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.7rem;
    }
    .list {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      overflow: auto;
      padding-right: 2px;
    }
    .item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-sm);
      padding: 0.3rem 0.4rem;
      border: 1px solid var(--color-panel-border);
      border-radius: 8px;
      background: color-mix(in srgb, var(--color-panel) 92%, transparent);
      font-family: var(--font-mono);
      font-size: 0.86rem;
    }
    .name {
      color: var(--color-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .kind {
      color: var(--color-text-dim);
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
  `}};U([L({attribute:!1})],Qt.prototype,`entries`,void 0),Qt=U([I(`atom-legend`)],Qt);var $t=class extends F{constructor(...e){super(...e),this.basisProvider=null,this.projection=`perspective`,this.raf=0,this.handles=[],this.size=92,this.colors={x:`#ff5a63`,y:`#5cd97a`,z:`#4c8dff`,cube:`#8b90a0`,bg:`#0b0c10`},this.frame=()=>{this.draw(),this.raf=requestAnimationFrame(this.frame)},this.onPick=e=>{let t=this.canvasEl.getBoundingClientRect(),n=e.clientX-t.left,r=e.clientY-t.top,i=null,a=196;for(let e of this.handles){let t=e.x-n,o=e.y-r,s=t*t+o*o;s<a&&(a=s,i=e)}i&&this.dispatchEvent(new CustomEvent(`camera-axis`,{detail:i.axis,bubbles:!0,composed:!0}))}}connectedCallback(){super.connectedCallback(),this.raf=requestAnimationFrame(this.frame)}disconnectedCallback(){cancelAnimationFrame(this.raf),super.disconnectedCallback()}firstUpdated(){let e=getComputedStyle(this);this.colors={x:e.getPropertyValue(`--axis-x`).trim()||this.colors.x,y:e.getPropertyValue(`--axis-y`).trim()||this.colors.y,z:e.getPropertyValue(`--axis-z`).trim()||this.colors.z,cube:e.getPropertyValue(`--axis-cube`).trim()||this.colors.cube,bg:e.getPropertyValue(`--color-bg`).trim()||this.colors.bg}}setProjection(e){this.projection!==e&&(this.projection=e,this.dispatchEvent(new CustomEvent(`projection-change`,{detail:e,bubbles:!0,composed:!0})))}draw(){let e=this.canvasEl;if(!e)return;let t=Math.min(window.devicePixelRatio||1,2),n=Math.round(this.size*t);e.width!==n&&(e.width=n,e.height=n);let r=e.getContext(`2d`);r.setTransform(t,0,0,t,0,0),r.clearRect(0,0,this.size,this.size);let i=this.basisProvider?.()??null,a=this.size/2,o=this.size/2;if(!i)return;let s=this.size*.34,c=e=>({x:e[0]*i.right[0]+e[1]*i.right[1]+e[2]*i.right[2],y:-(e[0]*i.up[0]+e[1]*i.up[1]+e[2]*i.up[2]),z:e[0]*i.forward[0]+e[1]*i.forward[1]+e[2]*i.forward[2]});this.drawCube(r,a,o,s*.42,c);let l=[{dir:[1,0,0],key:`+x`,neg:`-x`,label:`X`,color:this.colors.x},{dir:[0,1,0],key:`+y`,neg:`-y`,label:`Y`,color:this.colors.y},{dir:[0,0,1],key:`+z`,neg:`-z`,label:`Z`,color:this.colors.z}],u=[];for(let e of l){let t=c(e.dir);u.push({axis:e.key,label:e.label,x:a+t.x*s,y:o+t.y*s,depth:t.z,color:e.color,filled:!0}),u.push({axis:e.neg,label:``,x:a-t.x*s,y:o-t.y*s,depth:-t.z,color:e.color,filled:!1})}this.handles=u;let d=[...u].sort((e,t)=>e.depth-t.depth);for(let e of d)e.filled&&(r.strokeStyle=e.color,r.lineWidth=2,r.beginPath(),r.moveTo(a,o),r.lineTo(e.x,e.y),r.stroke()),r.beginPath(),r.arc(e.x,e.y,e.filled?8:5,0,Math.PI*2),e.filled?(r.fillStyle=e.color,r.fill(),r.fillStyle=this.colors.bg,r.font=`600 9px ui-monospace, monospace`,r.textAlign=`center`,r.textBaseline=`middle`,r.fillText(e.label,e.x,e.y+.5)):(r.fillStyle=this.colors.bg,r.fill(),r.strokeStyle=e.color,r.lineWidth=1.5,r.stroke())}drawCube(e,t,n,r,i){let a=[];for(let e=0;e<8;e++)a.push([(e&1?1:-1)*r,(e&2?1:-1)*r,(e&4?1:-1)*r]);let o=a.map(e=>{let r=i(e);return{x:t+r.x,y:n+r.y,z:r.z}}),s=[[0,1],[1,3],[3,2],[2,0],[4,5],[5,7],[7,6],[6,4],[0,4],[1,5],[2,6],[3,7]];e.strokeStyle=this.colors.cube,e.globalAlpha=.55,e.lineWidth=1;for(let[t,n]of s)e.beginPath(),e.moveTo(o[t].x,o[t].y),e.lineTo(o[n].x,o[n].y),e.stroke();e.globalAlpha=1}render(){return A`
      <div class="gizmo">
        <canvas
          width=${this.size}
          height=${this.size}
          @pointerdown=${this.onPick}
        ></canvas>
        <div class="proj">
          <button
            class=${this.projection===`perspective`?`active`:``}
            @click=${()=>this.setProjection(`perspective`)}
          >
            Persp
          </button>
          <button
            class=${this.projection===`orthographic`?`active`:``}
            @click=${()=>this.setProjection(`orthographic`)}
          >
            Ortho
          </button>
        </div>
      </div>
    `}static{this.styles=o`
    .gizmo {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-sm);
      padding: var(--space-sm);
      background: var(--color-overlay);
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
      backdrop-filter: blur(8px);
    }
    canvas {
      width: 92px;
      height: 92px;
      align-self: center;
      cursor: pointer;
      touch-action: none;
    }
    .proj {
      display: flex;
      gap: var(--space-xs);
    }
    .proj button {
      flex: 1;
      padding: 4px 0;
      font: inherit;
      font-size: 0.66rem;
      color: var(--color-text-dim);
      background: var(--color-accent-dim);
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
      cursor: pointer;
    }
    .proj button.active {
      color: var(--color-text);
      background: var(--color-accent);
      border-color: var(--color-accent);
    }
    .proj button:hover {
      filter: brightness(1.1);
    }
  `}};U([L({attribute:!1})],$t.prototype,`basisProvider`,void 0),U([R()],$t.prototype,`projection`,void 0),U([Ne(`canvas`)],$t.prototype,`canvasEl`,void 0),$t=U([I(`view-gizmo`)],$t);var q=class extends F{constructor(...e){super(...e),this.stats=null,this.activeConfig=null,this.running=!1,this.stepsPerFrame=H.stepsPerFrame,this.boundaryMode=H.boundaryMode,this.targetTemperature=H.targetTemperature,this.thermostatEnabled=H.thermostatEnabled,this.forceGuardEnabled=H.forceGuardEnabled,this.reactiveBondingEnabled=H.reactiveBondingEnabled,this.cutoffRadius=H.cutoffRadius,this.basisProvider=null,this.legendEntries=[],this.fileMenuOpen=!1,this.onDocumentClick=()=>{this.fileMenuOpen=!1},this.onFileMenuClick=e=>{e.stopPropagation(),this.fileMenuOpen=!this.fileMenuOpen},this.requestSave=()=>{this.fileMenuOpen=!1,this.dispatchEvent(new CustomEvent(`file-save`,{bubbles:!0,composed:!0}))},this.requestLoad=()=>{this.fileMenuOpen=!1,this.loadFileInput.value=``,this.loadFileInput.click()},this.onLoadFileChange=async e=>{let t=e.target.files?.[0];if(t)try{let e=await t.text(),n=JSON.parse(e);this.dispatchEvent(new CustomEvent(`file-load`,{detail:n,bubbles:!0,composed:!0}))}catch(e){this.dispatchEvent(new CustomEvent(`file-load-error`,{detail:e instanceof Error?e.message:String(e),bubbles:!0,composed:!0}))}}}get canvas(){return this.canvasEl}connectedCallback(){super.connectedCallback(),document.addEventListener(`click`,this.onDocumentClick)}disconnectedCallback(){document.removeEventListener(`click`,this.onDocumentClick),super.disconnectedCallback()}render(){return A`
      <header class="topbar" @click=${e=>e.stopPropagation()}>
        <div class="menu-root">
          <button class="menu-button" @click=${this.onFileMenuClick}>File</button>
          ${this.fileMenuOpen?A`
                <div class="menu-panel">
                  <button class="menu-item" @click=${this.requestSave}>Save simulation...</button>
                  <button class="menu-item" @click=${this.requestLoad}>Load simulation...</button>
                </div>
              `:null}
        </div>
        <p class="topbar-title">material-sim</p>
      </header>

      <input
        id="load-sim-file"
        class="hidden-input"
        type="file"
        accept="application/json,.json"
        @change=${this.onLoadFileChange}
      />

      <canvas></canvas>
      <control-panel
        .activeConfig=${this.activeConfig}
        .running=${this.running}
        .boundaryMode=${this.boundaryMode}
        .stepsPerFrame=${this.stepsPerFrame}
        .targetTemperature=${this.targetTemperature}
        .thermostatEnabled=${this.thermostatEnabled}
        .forceGuardEnabled=${this.forceGuardEnabled}
        .reactiveBondingEnabled=${this.reactiveBondingEnabled}
        .cutoffRadius=${this.cutoffRadius}
      ></control-panel>
      <div class="right-stack">
        <stats-overlay
          .stats=${this.stats}
        ></stats-overlay>
        <view-gizmo .basisProvider=${this.basisProvider}></view-gizmo>
      </div>
      <atom-legend .entries=${this.legendEntries}></atom-legend>
    `}static{this.styles=o`
    :host {
      position: fixed;
      inset: 0;
      display: block;
      background: var(--color-bg);
      color: var(--color-text);
      font-family: var(--font-ui);
    }

    .topbar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: var(--titlebar-height);
      z-index: 10;
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: 0 var(--space-md);
      box-sizing: border-box;
      background: color-mix(in srgb, var(--color-panel) 88%, transparent);
      border-bottom: 1px solid var(--color-panel-border);
      backdrop-filter: blur(10px);
    }

    .topbar-title {
      margin: 0;
      color: var(--color-text-dim);
      font-size: 0.78rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .menu-root {
      position: relative;
    }

    .menu-button,
    .menu-item {
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--color-panel) 95%, transparent);
      color: var(--color-text);
      font: inherit;
      font-size: 0.76rem;
      cursor: pointer;
    }

    .menu-button {
      padding: 0.3rem 0.7rem;
    }

    .menu-panel {
      position: absolute;
      top: calc(100% + var(--space-xs));
      left: 0;
      width: 13rem;
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 4px;
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
      background: var(--color-panel);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
    }

    .menu-item {
      text-align: left;
      border: none;
      background: transparent;
      padding: 0.45rem 0.55rem;
      border-radius: 6px;
    }

    .menu-item:hover,
    .menu-button:hover {
      filter: brightness(1.08);
    }

    .hidden-input {
      display: none;
    }

    canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      touch-action: none;
    }
    .right-stack {
      position: absolute;
      top: calc(var(--titlebar-height) + var(--space-md));
      right: var(--space-md);
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--space-md);
    }
  `}};U([L({attribute:!1})],q.prototype,`stats`,void 0),U([L({attribute:!1})],q.prototype,`activeConfig`,void 0),U([L({type:Boolean})],q.prototype,`running`,void 0),U([L({type:Number})],q.prototype,`stepsPerFrame`,void 0),U([L()],q.prototype,`boundaryMode`,void 0),U([L({type:Number})],q.prototype,`targetTemperature`,void 0),U([L({type:Boolean})],q.prototype,`thermostatEnabled`,void 0),U([L({type:Boolean})],q.prototype,`forceGuardEnabled`,void 0),U([L({type:Boolean})],q.prototype,`reactiveBondingEnabled`,void 0),U([L({type:Number})],q.prototype,`cutoffRadius`,void 0),U([L({attribute:!1})],q.prototype,`basisProvider`,void 0),U([L({attribute:!1})],q.prototype,`legendEntries`,void 0),U([R()],q.prototype,`fileMenuOpen`,void 0),U([Ne(`canvas`)],q.prototype,`canvasEl`,void 0),U([Ne(`#load-sim-file`)],q.prototype,`loadFileInput`,void 0),q=U([I(`sim-app`)],q);var en=`// Shared bindings and helpers for every compute kernel.
// Each kernel #includes the same layout (via identical declarations) so a
// single bind-group layout drives all compute passes. Buffers are declared
// read_write even where a kernel only reads, to keep one shared layout.

struct Uniforms {
  box      : vec3<f32>, // box side lengths (nm)
  cutoff2  : f32,       // squared nonbonded cutoff (nm^2)
  numAtoms : u32,
  numMol   : u32,
  dt       : f32,       // ps
  coulombK : f32,       // kJ*nm/(mol*e^2)
  r0       : f32,       // O-H equilibrium length (nm)
  kb       : f32,       // O-H bond stiffness (kJ/mol/nm^2)
  theta0   : f32,       // H-O-H equilibrium angle (rad)
  ka       : f32,       // H-O-H angle stiffness (kJ/mol/rad^2)
  targetT  : f32,       // thermostat target temperature (K)
  tau      : f32,       // thermostat coupling time (ps)
  kB       : f32,       // Boltzmann constant (kJ/mol/K)
  thermoOn : u32,       // 1 = thermostat active
  gridDim  : vec3<u32>, // cell-list grid dimensions (cells per axis)
  cellCap  : u32,       // max atoms stored per cell
  cellSize : vec3<f32>, // cell edge lengths (nm), >= cutoff per axis
  useCells : u32,       // 1 = use the cell list, 0 = brute-force O(N^2)
  boundaryMode : u32,   // 0 = periodic, 1 = open, 2 = open-top
  forceGuardOn : u32,   // 1 = clamp extreme pair/bond force spikes
};

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read_write> pos: array<vec4<f32>>;        // xyz, charge
@group(0) @binding(2) var<storage, read_write>  atomParams: array<vec4<f32>>; // sigma, epsilon, molId, elementId
@group(0) @binding(3) var<storage, read_write> force: array<vec4<f32>>;      // xyz, _
@group(0) @binding(4) var<storage, read_write> vel: array<vec4<f32>>;        // xyz, mass
@group(0) @binding(5) var<storage, read_write> reduction: array<f32>;        // scratch (e.g. 2*KE)
@group(0) @binding(6) var<storage, read_write> cellHead: array<atomic<u32>>; // atom count per cell
@group(0) @binding(7) var<storage, read_write> cellAtoms: array<u32>;        // atom ids, cellCap per cell

fn minImage(d: vec3<f32>) -> vec3<f32> {
  if (u.boundaryMode == 1u) { return d; }
  if (u.boundaryMode == 2u) {
    return vec3<f32>(
      d.x - u.box.x * round(d.x / u.box.x),
      d.y,
      d.z - u.box.z * round(d.z / u.box.z),
    );
  }
  return d - u.box * round(d / u.box);
}

fn numCells() -> u32 {
  return u.gridDim.x * u.gridDim.y * u.gridDim.z;
}

/** Integer cell coordinate for a (wrapped) position, clamped into the grid. */
fn cellCoord(p: vec3<f32>) -> vec3<i32> {
  let ci = vec3<i32>(floor(p / u.cellSize));
  let hi = vec3<i32>(u.gridDim) - vec3<i32>(1, 1, 1);
  return clamp(ci, vec3<i32>(0, 0, 0), hi);
}

/** Flat index of a cell coordinate, wrapped periodically into the grid. */
fn cellIndexWrapped(c: vec3<i32>) -> u32 {
  let gd = vec3<i32>(u.gridDim);
  let w = ((c % gd) + gd) % gd;
  return u32(w.x + gd.x * (w.y + gd.y * w.z));
}

const FORCE_GUARD_MAX: f32 = 25000.0;

fn guardForce(f: vec3<f32>) -> vec3<f32> {
  if (u.forceGuardOn == 0u) { return f; }
  let m2 = dot(f, f);
  if (m2 <= FORCE_GUARD_MAX * FORCE_GUARD_MAX || m2 < 1e-16) { return f; }
  let invm = inverseSqrt(m2);
  return f * (FORCE_GUARD_MAX * invm);
}
`,tn=`// Lennard-Jones nonbonded force. One thread per atom; thread i writes force[i]
// only, so no atomics are needed. This kernel INITIALIZES the force buffer.
// Uses the GPU cell list (linked cells) when u.useCells == 1 — O(N) — and falls
// back to a brute-force O(N^2) scan with a hard cutoff otherwise (small boxes).

// Lorentz-Berthelot combined LJ force of atom i toward atom j (returns vec3).
// Returns zero for the same molecule, a partner without an LJ site, the same
// atom (r2 ~ 0), or a pair beyond the cutoff.
fn ljPair(pi: vec3<f32>, sigI: f32, epsI: f32, molI: f32, j: u32) -> vec3<f32> {
  if (vel[j].w <= 0.0) { return vec3<f32>(0.0); }
  let apj = atomParams[j];
  if (apj.z == molI) { return vec3<f32>(0.0); } // exclude intramolecular
  if (apj.y <= 0.0) { return vec3<f32>(0.0); }   // partner has no LJ site

  let d = minImage(pi - pos[j].xyz);
  let r2 = dot(d, d);
  if (r2 > u.cutoff2 || r2 < 1e-8) { return vec3<f32>(0.0); }

  let sig = 0.5 * (sigI + apj.x);
  let eps = sqrt(epsI * apj.y);
  let sig2 = sig * sig;
  let inv2 = sig2 / r2;
  let inv6 = inv2 * inv2 * inv2;
  let inv12 = inv6 * inv6;
  // F/r = 24*eps*(2*inv12 - inv6)/r2 ; multiply by d for the vector.
  let fmag = 24.0 * eps * (2.0 * inv12 - inv6) / r2;
  return guardForce(fmag * d);
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= u.numAtoms) { return; }
  if (vel[i].w <= 0.0) {
    force[i] = vec4<f32>(0.0);
    return;
  }

  let pi = pos[i].xyz;
  let api = atomParams[i];
  let sigI = api.x;
  let epsI = api.y;
  let molI = api.z;

  var f = vec3<f32>(0.0, 0.0, 0.0);

  if (epsI > 0.0) {
    if (u.useCells == 1u) {
      let ci = cellCoord(pi);
      for (var dz = -1; dz <= 1; dz = dz + 1) {
        for (var dy = -1; dy <= 1; dy = dy + 1) {
          for (var dx = -1; dx <= 1; dx = dx + 1) {
            let cidx = cellIndexWrapped(ci + vec3<i32>(dx, dy, dz));
            let cnt = min(atomicLoad(&cellHead[cidx]), u.cellCap);
            for (var s: u32 = 0u; s < cnt; s = s + 1u) {
              let j = cellAtoms[cidx * u.cellCap + s];
              f = f + ljPair(pi, sigI, epsI, molI, j);
            }
          }
        }
      }
    } else {
      for (var j: u32 = 0u; j < u.numAtoms; j = j + 1u) {
        f = f + ljPair(pi, sigI, epsI, molI, j);
      }
    }
  }

  force[i] = vec4<f32>(f, 0.0);
}
`,nn=`// Coulomb nonbonded force with a hard cutoff (minimum image). One thread per
// atom; thread i accumulates into force[i] only, then ADDS to the buffer that
// force_lj initialized. Uses inverseSqrt (single instruction) rather than a
// full sqrt. Uses the GPU cell list when u.useCells == 1, else brute force.

// Coulomb force of atom i toward atom j. Returns zero for the same molecule,
// an uncharged partner, the same atom, or a pair beyond the cutoff.
fn coulombPair(pi: vec3<f32>, qi: f32, molI: f32, j: u32) -> vec3<f32> {
  if (vel[j].w <= 0.0) { return vec3<f32>(0.0); }
  if (atomParams[j].z == molI) { return vec3<f32>(0.0); } // exclude intramolecular
  let qj = pos[j].w;
  if (qj == 0.0) { return vec3<f32>(0.0); }

  let d = minImage(pi - pos[j].xyz);
  let r2 = dot(d, d);
  if (r2 > u.cutoff2 || r2 < 1e-8) { return vec3<f32>(0.0); }

  let invr = inverseSqrt(r2);
  // F = k*qi*qj/r^2 * (d/r) = k*qi*qj * d * invr^3
  let fmag = u.coulombK * qi * qj * invr * invr * invr;
  return guardForce(fmag * d);
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= u.numAtoms) { return; }
  if (vel[i].w <= 0.0) { return; }

  let pi = pos[i].xyz;
  let qi = pos[i].w;
  let molI = atomParams[i].z;

  var f = vec3<f32>(0.0, 0.0, 0.0);

  if (qi != 0.0) {
    if (u.useCells == 1u) {
      let ci = cellCoord(pi);
      for (var dz = -1; dz <= 1; dz = dz + 1) {
        for (var dy = -1; dy <= 1; dy = dy + 1) {
          for (var dx = -1; dx <= 1; dx = dx + 1) {
            let cidx = cellIndexWrapped(ci + vec3<i32>(dx, dy, dz));
            let cnt = min(atomicLoad(&cellHead[cidx]), u.cellCap);
            for (var s: u32 = 0u; s < cnt; s = s + 1u) {
              let j = cellAtoms[cidx * u.cellCap + s];
              f = f + coulombPair(pi, qi, molI, j);
            }
          }
        }
      }
    } else {
      for (var j: u32 = 0u; j < u.numAtoms; j = j + 1u) {
        f = f + coulombPair(pi, qi, molI, j);
      }
    }
  }

  force[i] = force[i] + vec4<f32>(f, 0.0);
}
`,rn=`// Generic intramolecular (bonded) forces. One thread per MOLECULE owns every
// atom referenced by its bonds and angles. Molecules are laid out contiguously
// and never share atoms, so harmonic bonds and angles accumulate without
// atomics or races. Bond/angle atom indices are GLOBAL. This kernel ADDS to the
// force buffer after the nonbonded passes. Per-molecule ranges into the flat
// bond / angle lists come from molRanges (group 1). Shared bindings (u, pos,
// force, minImage) come from _common.wgsl (group 0).

struct MolBond {
  ij  : vec2<u32>, // atom i, atom j
  par : vec2<f32>, // r0 (nm), k (kJ/mol/nm^2)
};

struct MolAngle {
  idx : vec4<u32>, // i, j (central atom), k, _pad
  par : vec4<f32>, // theta0 (rad), kTheta (kJ/mol/rad^2), _, _
};

// (bondStart, bondCount, angleStart, angleCount) per bonded molecule.
@group(1) @binding(0) var<storage, read> molRanges: array<vec4<u32>>;
@group(1) @binding(1) var<storage, read> molBonds: array<MolBond>;
@group(1) @binding(2) var<storage, read> molAngles: array<MolAngle>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let m = gid.x;
  if (m >= u.numMol) { return; }

  let range = molRanges[m];
  let bondStart = range.x;
  let bondCount = range.y;
  let angleStart = range.z;
  let angleCount = range.w;

  // --- Harmonic bonds ---
  for (var bi: u32 = 0u; bi < bondCount; bi = bi + 1u) {
    let b = molBonds[bondStart + bi];
    let i = b.ij.x;
    let j = b.ij.y;
    if (vel[i].w <= 0.0 || vel[j].w <= 0.0) { continue; }
    let r0 = b.par.x;
    let kb = b.par.y;

    let d = minImage(pos[j].xyz - pos[i].xyz); // i -> j
    let r = length(d);
    if (r < 1e-6) { continue; }
    let inv = 1.0 / r;
    let fb = -kb * (r - r0); // F = -dV/dr
    let fv = guardForce((fb * inv) * d);
    force[j] = force[j] + vec4<f32>(fv, 0.0);
    force[i] = force[i] - vec4<f32>(fv, 0.0);
  }

  // --- Harmonic angles (central atom j) ---
  for (var ai: u32 = 0u; ai < angleCount; ai = ai + 1u) {
    let an = molAngles[angleStart + ai];
    let i = an.idx.x;
    let jc = an.idx.y;
    let kk = an.idx.z;
    if (vel[i].w <= 0.0 || vel[jc].w <= 0.0 || vel[kk].w <= 0.0) { continue; }
    let theta0 = an.par.x;
    let ka = an.par.y;

    let a = minImage(pos[i].xyz - pos[jc].xyz);  // center -> i
    let b = minImage(pos[kk].xyz - pos[jc].xyz); // center -> k
    let ra = length(a);
    let rb = length(b);
    if (ra < 1e-6 || rb < 1e-6) { continue; }
    let inva = 1.0 / ra;
    let invb = 1.0 / rb;
    let c = clamp(dot(a, b) * inva * invb, -0.9999, 0.9999);
    let baseI = (b * (inva * invb) - c * a * (inva * inva));
    let baseK = (a * (inva * invb) - c * b * (invb * invb));

    // Avoid the 1/sin(theta) singularity for near-linear equilibrium angles by
    // switching to a cosine-harmonic form that stays finite at theta ~= pi.
    let c0 = cos(theta0);
    let nearLinear = abs(c0 + 1.0) < 0.02;

    var gi = vec3<f32>(0.0);
    var gk = vec3<f32>(0.0);
    if (nearLinear) {
      let dVdc = ka * (c - c0); // V = 0.5*k*(cos(theta)-cos(theta0))^2
      gi = guardForce(dVdc * baseI);
      gk = guardForce(dVdc * baseK);
    } else {
      let theta = acos(c);
      let s = sqrt(max(1.0 - c * c, 1e-8));
      let dV = ka * (theta - theta0); // dV/dtheta
      let coef = dV / s;
      gi = guardForce(coef * baseI);
      gk = guardForce(coef * baseK);
    }

    force[i] = force[i] + vec4<f32>(gi, 0.0);
    force[kk] = force[kk] + vec4<f32>(gk, 0.0);
    force[jc] = force[jc] - vec4<f32>(gi + gk, 0.0);
  }
}
`,an=`// Velocity Verlet, first half: kick velocities by half a step using the forces
// currently in the buffer (a(t)), drift positions a full step, then wrap into
// the periodic box. Mass is stored in vel.w.

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= u.numAtoms) { return; }

  let mass = vel[i].w;
  if (mass <= 0.0) {
    force[i] = vec4<f32>(0.0);
    return;
  }
  let invm = select(0.0, 1.0 / mass, mass > 0.0);

  var v = vel[i].xyz + (0.5 * u.dt * invm) * force[i].xyz;
  var p = pos[i].xyz + u.dt * v;

  if (u.boundaryMode == 0u) {
    p = p - u.box * floor(p / u.box);
  } else if (u.boundaryMode == 2u) {
    p.x = p.x - u.box.x * floor(p.x / u.box.x);
    p.z = p.z - u.box.z * floor(p.z / u.box.z);
  }

  pos[i] = vec4<f32>(p, pos[i].w);
  vel[i] = vec4<f32>(v, mass);
}
`,on=`// Velocity Verlet, second half: after forces have been recomputed for the new
// positions (a(t+dt)), kick velocities by the remaining half step.

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= u.numAtoms) { return; }

  let mass = vel[i].w;
  if (mass <= 0.0) {
    force[i] = vec4<f32>(0.0);
    return;
  }
  let invm = select(0.0, 1.0 / mass, mass > 0.0);

  let v = vel[i].xyz + (0.5 * u.dt * invm) * force[i].xyz;
  vel[i] = vec4<f32>(v, mass);
}
`,sn=`// Boundary cleanup pass. Marks atoms outside the active domain as dead by
// zeroing their mass/charge/LJ params and pushing them far off-screen.

fn shouldCull(p: vec3<f32>) -> bool {
  switch (u.boundaryMode) {
    case 0u: {
      return any(p < vec3<f32>(0.0)) || any(p >= u.box);
    }
    case 2u: {
      return p.y < 0.0 || p.x < 0.0 || p.x >= u.box.x || p.z < 0.0 || p.z >= u.box.z;
    }
    default: {
      return false;
    }
  }
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= u.numAtoms) { return; }
  if (vel[i].w <= 0.0) { return; }
  if (!shouldCull(pos[i].xyz)) { return; }

  pos[i] = vec4<f32>(vec3<f32>(1e9), 0.0);
  vel[i] = vec4<f32>(0.0, 0.0, 0.0, 0.0);
  force[i] = vec4<f32>(0.0);
  atomParams[i] = vec4<f32>(0.0, 0.0, -1.0, atomParams[i].w);
}`,cn=`// Thermostat step 1: reduce total kinetic energy (actually 2*KE = sum m*v^2)
// into reduction[0]. Single workgroup, grid-stride load + shared-memory tree
// reduction. Runs entirely on the GPU — no readback.

var<workgroup> partial: array<f32, 256>;

@compute @workgroup_size(256)
fn main(@builtin(local_invocation_id) lid: vec3<u32>) {
  let t = lid.x;

  var sum = 0.0;
  var i = t;
  loop {
    if (i >= u.numAtoms) { break; }
    let v = vel[i].xyz;
    let m = vel[i].w;
    if (m > 0.0) {
      sum = sum + m * dot(v, v);
    }
    i = i + 256u;
  }
  partial[t] = sum;
  workgroupBarrier();

  var stride = 128u;
  loop {
    if (t < stride) {
      partial[t] = partial[t] + partial[t + stride];
    }
    workgroupBarrier();
    if (stride == 1u) { break; }
    stride = stride >> 1u;
  }

  if (t == 0u) {
    reduction[0] = partial[0];
  }
}
`,ln=`// Thermostat step 2: Berendsen weak-coupling velocity rescale. Reads the total
// kinetic energy left in reduction[0], derives the instantaneous temperature,
// and nudges every velocity toward the target temperature. Disabled by a
// uniform flag (NVE when off).
//
// lambda = sqrt( 1 + (dt/tau) * (T0/T - 1) )

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= u.numAtoms) { return; }
  if (u.thermoOn == 0u) { return; }
  if (vel[i].w <= 0.0) { return; }

  let ke2 = reduction[0]; // sum m*v^2 = 2*KE
  let ndof = f32(3u * u.numAtoms - 3u);
  let temp = ke2 / (ndof * u.kB);
  if (temp <= 1.0) { return; }

  let ratio = u.targetT / temp;
  let lambda = sqrt(max(0.0, 1.0 + (u.dt / u.tau) * (ratio - 1.0)));

  vel[i] = vec4<f32>(vel[i].xyz * lambda, vel[i].w);
}
`,un=`// Cell list, pass 1: reset the per-cell atom counters to zero. One thread per
// cell. Runs before cell_build each time the grid is rebuilt.

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= numCells()) { return; }
  atomicStore(&cellHead[i], 0u);
}
`,dn=`// Cell list, pass 2: bin every atom into its grid cell. One thread per atom.
// atomicAdd reserves a slot; atoms beyond the per-cell capacity are dropped
// (a rare, graceful degradation rather than a crash). Run after positions
// update and before the nonbonded force kernels read the list.

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= u.numAtoms) { return; }

  let c = cellCoord(pos[i].xyz);
  let idx = cellIndexWrapped(c);
  let slot = atomicAdd(&cellHead[idx], 1u);
  if (slot < u.cellCap) {
    cellAtoms[idx * u.cellCap + slot] = i;
  }
}
`,fn=`// Render pass: instanced billboard sphere impostors. One instance per atom,
// six vertices per quad. Reads the live position storage buffer directly (no
// readback). Color/radius by atom type id stored in atomParams.w.

struct Camera {
  viewProj : mat4x4<f32>,
  right    : vec4<f32>, // camera right in world space (xyz), atom-size scale (w)
  up       : vec4<f32>, // camera up in world space (xyz)
  tileGrid : vec4<f32>, // xyz = tile counts
  boxSize  : vec4<f32>, // xyz = box side lengths
};

@group(0) @binding(0) var<uniform> cam: Camera;
@group(0) @binding(1) var<storage, read> pos: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> atomParams: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> vel: array<vec4<f32>>;

struct VSOut {
  @builtin(position) clip  : vec4<f32>,
  @location(0)       uv    : vec2<f32>,
  @location(1)       color : vec3<f32>,
};

// Palette keyed by the global element id stored in atomParams.w. Must match the
// ELEMENTS ids in params.ts. Returns rgb in xyz and the draw radius (nm) in w.
// Radii are roughly proportional to real atomic size (relative, not exact).
fn elementStyle(id: f32) -> vec4<f32> {
  let e = i32(id + 0.5);
  switch (e) {
    case 0:  { return vec4<f32>(0.91, 0.23, 0.17, 0.020); } // O  oxygen
    case 1:  { return vec4<f32>(0.93, 0.94, 0.97, 0.012); } // H  hydrogen
    case 2:  { return vec4<f32>(0.67, 0.40, 0.95, 0.024); } // Na sodium
    case 3:  { return vec4<f32>(0.36, 0.85, 0.45, 0.030); } // Cl chlorine
    case 4:  { return vec4<f32>(0.45, 0.92, 0.95, 0.030); } // Ar argon
    case 5:  { return vec4<f32>(0.80, 0.52, 0.40, 0.024); } // Fe iron
    case 6:  { return vec4<f32>(0.88, 0.55, 0.30, 0.024); } // Cu copper
    case 7:  { return vec4<f32>(0.56, 0.25, 0.83, 0.032); } // K  potassium
    case 8:  { return vec4<f32>(0.65, 0.26, 0.18, 0.033); } // Br bromine
    case 9:  { return vec4<f32>(0.70, 0.89, 0.96, 0.026); } // Ne neon
    case 10: { return vec4<f32>(1.00, 0.82, 0.14, 0.026); } // Au gold
    case 11: { return vec4<f32>(0.78, 0.80, 0.84, 0.026); } // Ag silver
    case 12: { return vec4<f32>(0.46, 0.62, 0.55, 0.023); } // Ni nickel
    case 13: { return vec4<f32>(0.44, 0.46, 0.50, 0.017); } // C  carbon
    case 14: { return vec4<f32>(0.29, 0.42, 1.00, 0.018); } // N  nitrogen
    default: { return vec4<f32>(0.70, 0.72, 0.78, 0.020); }
  }
}

@vertex
fn vs(
  @builtin(vertex_index) vi: u32,
  @builtin(instance_index) ii: u32,
) -> VSOut {
  var offs = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 1.0, -1.0),
    vec2<f32>( 1.0,  1.0),
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 1.0,  1.0),
    vec2<f32>(-1.0,  1.0),
  );
  let o = offs[vi];

  let tileX = max(1u, u32(cam.tileGrid.x + 0.5));
  let tileY = max(1u, u32(cam.tileGrid.y + 0.5));
  let tileZ = max(1u, u32(cam.tileGrid.z + 0.5));
  let tileCount = tileX * tileY * tileZ;
  let atomsPerTile = arrayLength(&pos);
  let atomIndex = ii % atomsPerTile;
  let tileIndex = ii / atomsPerTile;

  if (tileIndex >= tileCount || vel[atomIndex].w <= 0.0) {
    var dead: VSOut;
    dead.clip = vec4<f32>(2.0, 2.0, 2.0, 1.0);
    dead.uv = vec2<f32>(0.0);
    dead.color = vec3<f32>(0.0);
    return dead;
  }

  let tx = tileIndex % tileX;
  let ty = (tileIndex / tileX) % tileY;
  let tz = tileIndex / (tileX * tileY);
  let offset = vec3<f32>(
    (f32(tx) - 0.5 * f32(tileX - 1u)) * cam.boxSize.x,
    (f32(ty) - 0.5 * f32(tileY - 1u)) * cam.boxSize.y,
    (f32(tz) - 0.5 * f32(tileZ - 1u)) * cam.boxSize.z,
  );
  let center = pos[atomIndex].xyz + offset;
  let style = elementStyle(atomParams[atomIndex].w);
  let radius = style.w * max(cam.right.w, 0.0001);
  let color = style.xyz;

  let world = center
    + cam.right.xyz * (o.x * radius)
    + cam.up.xyz * (o.y * radius);

  var out: VSOut;
  out.clip = cam.viewProj * vec4<f32>(world, 1.0);
  out.uv = o;
  out.color = color;
  return out;
}

@fragment
fn fs(in: VSOut) -> @location(0) vec4<f32> {
  let r2 = dot(in.uv, in.uv);
  if (r2 > 1.0) { discard; }
  let z = sqrt(1.0 - r2);
  let n = vec3<f32>(in.uv, z);
  let light = normalize(vec3<f32>(0.4, 0.6, 0.8));
  let diff = max(dot(n, light), 0.0);
  // Blinn-Phong specular highlight (view direction ~ +z for a billboard).
  let h = normalize(light + vec3<f32>(0.0, 0.0, 1.0));
  let spec = pow(max(dot(n, h), 0.0), 28.0);
  // Soft rim term for depth separation against the dark background.
  let rim = pow(1.0 - z, 2.0) * 0.18;
  let shade = 0.22 + 0.78 * diff;
  let col = in.color * shade + vec3<f32>(spec * 0.35 + rim);
  return vec4<f32>(col, 1.0);
}
`,pn=`// Intramolecular bonds (each O-H inside a molecule) drawn as line segments.
// One line-list instance per bond; the two endpoints are reconstructed with the
// minimum image so a molecule wrapped across the periodic box still draws one
// short, connected bond. Reads live positions directly (no readback). The line
// opacity fades with the bond stretch force magnitude, matching the attraction
// overlay, so strained bonds read brighter than relaxed ones.

struct Camera {
  viewProj : mat4x4<f32>,
  right    : vec4<f32>,
  up       : vec4<f32>,
  tileGrid : vec4<f32>,
  boxSize  : vec4<f32>,
};

struct Viz {
  box           : vec3<f32>,
  coulombK      : f32,
  cutoff2       : f32,
  coulombThresh : f32,
  numAtoms      : u32,
  maxSeg        : u32,
  ljThresh      : f32,
  bondThresh    : f32,
  bondR0        : f32,
  bondK         : f32,
  lineOpacity   : f32, // master force/bond line opacity (0..1)
  boundaryMode  : u32, // 0 = periodic, 1 = open, 2 = open-top
};

struct MolBond {
  ij  : vec2<u32>,
  par : vec2<f32>, // r0, k
};

@group(0) @binding(0) var<uniform> cam: Camera;
@group(0) @binding(1) var<uniform> viz: Viz;
@group(0) @binding(2) var<storage, read> pos: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> bonds: array<MolBond>;
@group(0) @binding(4) var<storage, read> vel: array<vec4<f32>>;

fn minImage(d: vec3<f32>, box: vec3<f32>) -> vec3<f32> {
  if (viz.boundaryMode == 1u) { return d; }
  if (viz.boundaryMode == 2u) {
    return vec3<f32>(
      d.x - box.x * round(d.x / box.x),
      d.y,
      d.z - box.z * round(d.z / box.z),
    );
  }
  return d - box * round(d / box);
}

struct VSOut {
  @builtin(position) clip  : vec4<f32>,
  @location(0)       color : vec3<f32>,
  @location(1)       alpha : f32,
};

@vertex
fn vs(
  @builtin(vertex_index) vi: u32,
  @builtin(instance_index) ii: u32,
) -> VSOut {
  let tileX = max(1u, u32(cam.tileGrid.x + 0.5));
  let tileY = max(1u, u32(cam.tileGrid.y + 0.5));
  let tileZ = max(1u, u32(cam.tileGrid.z + 0.5));
  let tileCount = tileX * tileY * tileZ;
  let bondsPerTile = arrayLength(&bonds);
  let bondIndex = ii % bondsPerTile;
  let tileIndex = ii / bondsPerTile;
  let bond = bonds[bondIndex];
  let ia = bond.ij.x;
  let ib = bond.ij.y;
  let kb = bond.par.y;
  if (tileIndex >= tileCount || vel[ia].w <= 0.0 || vel[ib].w <= 0.0) {
    var dead: VSOut;
    dead.clip = vec4<f32>(2.0, 2.0, 2.0, 1.0);
    dead.color = vec3<f32>(0.0);
    dead.alpha = 0.0;
    return dead;
  }
  if (kb <= 0.0) {
    var dead: VSOut;
    dead.clip = vec4<f32>(2.0, 2.0, 2.0, 1.0);
    dead.color = vec3<f32>(0.0);
    dead.alpha = 0.0;
    return dead;
  }
  let r0 = bond.par.x;

  let tx = tileIndex % tileX;
  let ty = (tileIndex / tileX) % tileY;
  let tz = tileIndex / (tileX * tileY);
  let tileOffset = vec3<f32>(
    (f32(tx) - 0.5 * f32(tileX - 1u)) * cam.boxSize.x,
    (f32(ty) - 0.5 * f32(tileY - 1u)) * cam.boxSize.y,
    (f32(tz) - 0.5 * f32(tileZ - 1u)) * cam.boxSize.z,
  );
  let aBase = pos[ia].xyz;
  let bBase = aBase + minImage(pos[ib].xyz - aBase, viz.box);
  let a = aBase + tileOffset;
  let b = bBase + tileOffset;

  // Bond stretch force magnitude k*|r - r0|, faded like the attraction overlay.
  let r = length(b - a);
  let fmag = kb * abs(r - r0);
  let alpha = clamp((fmag - viz.bondThresh) / (viz.bondThresh * 1.5), 0.2, 1.0);

  let world = select(b, a, vi == 0u);

  var out: VSOut;
  out.clip = cam.viewProj * vec4<f32>(world, 1.0);
  out.color = vec3<f32>(0.9, 0.9, 0.9); // bonds — grey
  out.alpha = alpha * viz.lineOpacity;
  return out;
}

@fragment
fn fs(in: VSOut) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color, in.alpha);
}
`,mn=`// Periodic simulation-box wireframe. Draws the 12 edges of the [0,box] cuboid
// as faint line segments so the user can see the cell the atoms live in. One
// line-list instance per edge; the two endpoints are the box corners. Reads
// only the camera and the box extents (from the shared Viz uniform).

struct Camera {
  viewProj : mat4x4<f32>,
  right    : vec4<f32>,
  up       : vec4<f32>,
  tileGrid : vec4<f32>,
  boxSize  : vec4<f32>,
};

struct Viz {
  box           : vec3<f32>,
  coulombK      : f32,
  cutoff2       : f32,
  coulombThresh : f32,
  numAtoms      : u32,
  maxSeg        : u32,
  ljThresh      : f32,
  bondThresh    : f32,
  bondR0        : f32,
  bondK         : f32,
  lineOpacity   : f32,
};

@group(0) @binding(0) var<uniform> cam: Camera;
@group(0) @binding(1) var<uniform> viz: Viz;

// Corner index -> unit cuboid corner (0 or 1 per axis).
fn corner(c: u32) -> vec3<f32> {
  return vec3<f32>(
    f32(c & 1u),
    f32((c >> 1u) & 1u),
    f32((c >> 2u) & 1u),
  );
}

@vertex
fn vs(
  @builtin(vertex_index) vi: u32,
  @builtin(instance_index) ii: u32,
) -> @builtin(position) vec4<f32> {
  let tileX = max(1u, u32(cam.tileGrid.x + 0.5));
  let tileY = max(1u, u32(cam.tileGrid.y + 0.5));
  let tileZ = max(1u, u32(cam.tileGrid.z + 0.5));
  let tileCount = tileX * tileY * tileZ;
  let edgeIndex = ii % 12u;
  let tileIndex = ii / 12u;
  if (tileIndex >= tileCount) {
    return vec4<f32>(2.0, 2.0, 2.0, 1.0);
  }

  // 12 edges as pairs of corner indices.
  var edges = array<u32, 24>(
    0u, 1u,  1u, 3u,  3u, 2u,  2u, 0u, // bottom face
    4u, 5u,  5u, 7u,  7u, 6u,  6u, 4u, // top face
    0u, 4u,  1u, 5u,  2u, 6u,  3u, 7u, // verticals
  );
  let cIdx = edges[edgeIndex * 2u + vi];
  let tx = tileIndex % tileX;
  let ty = (tileIndex / tileX) % tileY;
  let tz = tileIndex / (tileX * tileY);
  let tileOffset = vec3<f32>(
    (f32(tx) - 0.5 * f32(tileX - 1u)) * cam.boxSize.x,
    (f32(ty) - 0.5 * f32(tileY - 1u)) * cam.boxSize.y,
    (f32(tz) - 0.5 * f32(tileZ - 1u)) * cam.boxSize.z,
  );
  let world = corner(cIdx) * viz.box + tileOffset;
  return cam.viewProj * vec4<f32>(world, 1.0);
}

@fragment
fn fs() -> @location(0) vec4<f32> {
  return vec4<f32>(0.40, 0.46, 0.60, 0.45);
}
`,hn=`// Builds the list of attractive interactions to visualize. One thread per atom
// scans every other atom in a different molecule within the cutoff and emits a
// line segment for each attractive force above a per-kind threshold:
//   kind 0  electrostatic (Coulomb) attraction — emitted from the positive
//           charge only, so each pair appears once and is never duplicated.
//   kind 1  Lennard-Jones attraction (r past the well minimum) — emitted only
//           for i < j, so each pair appears once.
// Each segment stores the two atom indices, a per-segment opacity (0..1) so the
// render pass can fade weak forces in/out, and the kind so it can be colored.
// Append is via an atomic counter; the render pass reads it back without any
// CPU readback.

struct Viz {
  box           : vec3<f32>,
  coulombK      : f32,
  cutoff2       : f32,
  coulombThresh : f32,
  numAtoms      : u32,
  maxSeg        : u32,
  ljThresh      : f32,
  bondThresh    : f32,
  bondR0        : f32,
  bondK         : f32,
  lineOpacity   : f32, // master force/bond line opacity (0..1)
  boundaryMode  : u32, // 0 = periodic, 1 = open, 2 = open-top
};

@group(0) @binding(0) var<uniform> viz: Viz;
@group(0) @binding(1) var<storage, read> pos: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> atomParams: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> vel: array<vec4<f32>>;
@group(0) @binding(4) var<storage, read_write> segCount: atomic<u32>;
@group(0) @binding(5) var<storage, read_write> segPairs: array<u32>;

const KIND_COULOMB : u32 = 0u;
const KIND_LJ      : u32 = 1u;

fn minImage(d: vec3<f32>, box: vec3<f32>) -> vec3<f32> {
  if (viz.boundaryMode == 1u) { return d; }
  if (viz.boundaryMode == 2u) {
    return vec3<f32>(
      d.x - box.x * round(d.x / box.x),
      d.y,
      d.z - box.z * round(d.z / box.z),
    );
  }
  return d - box * round(d / box);
}

fn emit(ia: u32, ib: u32, alpha: f32, kind: u32) {
  let idx = atomicAdd(&segCount, 1u);
  if (idx < viz.maxSeg) {
    segPairs[idx * 4u]      = ia;
    segPairs[idx * 4u + 1u] = ib;
    segPairs[idx * 4u + 2u] = bitcast<u32>(alpha);
    segPairs[idx * 4u + 3u] = kind;
  }
}

// Fade from the emission threshold up to ~2.5x threshold (fully opaque).
fn fade(fmag: f32, threshold: f32) -> f32 {
  return clamp((fmag - threshold) / (threshold * 1.5), 0.06, 1.0);
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= viz.numAtoms) { return; }
  if (vel[i].w <= 0.0) { return; }

  let pi   = pos[i].xyz;
  let qi   = pos[i].w;
  let molI = atomParams[i].z;
  let sigI = atomParams[i].x;
  let epsI = atomParams[i].y;

  for (var j: u32 = 0u; j < viz.numAtoms; j = j + 1u) {
    if (vel[j].w <= 0.0) { continue; }
    if (atomParams[j].z == molI) { continue; } // skip same molecule

    let d = minImage(pi - pos[j].xyz, viz.box);
    let r2 = dot(d, d);
    if (r2 > viz.cutoff2 || r2 < 1e-8) { continue; }

    // --- Coulomb attraction (positive -> negative, emitted once) ---
    let qj = pos[j].w;
    if (qi > 0.0 && qj < 0.0) {
      let fmag = viz.coulombK * (-qi * qj) / r2; // attraction magnitude
      if (fmag >= viz.coulombThresh) {
        emit(i, j, fade(fmag, viz.coulombThresh), KIND_COULOMB);
      }
    }

    // --- Lennard-Jones attraction (emitted once, i < j) ---
    if (i < j) {
      let epsJ = atomParams[j].y;
      if (epsI > 0.0 && epsJ > 0.0) {
        let sig = 0.5 * (sigI + atomParams[j].x);
        let eps = sqrt(epsI * epsJ);
        let inv2 = (sig * sig) / r2;
        let inv6 = inv2 * inv2 * inv2;
        let inv12 = inv6 * inv6;
        // F/r = 24*eps*(2*inv12 - inv6)/r2 ; negative => net attraction.
        let fr = 24.0 * eps * (2.0 * inv12 - inv6) / r2;
        if (fr < 0.0) {
          let fmag2 = fr * fr * r2; // (|F/r| * r)^2 = attractive force mag^2
          if (fmag2 >= viz.ljThresh * viz.ljThresh) {
            emit(i, j, fade(sqrt(fmag2), viz.ljThresh), KIND_LJ);
          }
        }
      }
    }
  }
}
`,gn=`// Draws attractive interactions as line segments. One line-list instance per
// candidate slot; instances beyond the live count (filled by attraction_build)
// are pushed off-screen so they are clipped. Each segment carries a per-pair
// opacity and a "kind" used to pick a color (Coulomb vs Lennard-Jones). The
// second endpoint uses the minimum image of the partner atom so the line stays
// short when the pair interacts across a periodic boundary.

struct Camera {
  viewProj : mat4x4<f32>,
  right    : vec4<f32>,
  up       : vec4<f32>,
  tileGrid : vec4<f32>,
  boxSize  : vec4<f32>,
};

struct Viz {
  box           : vec3<f32>,
  coulombK      : f32,
  cutoff2       : f32,
  coulombThresh : f32,
  numAtoms      : u32,
  maxSeg        : u32,
  ljThresh      : f32,
  bondThresh    : f32,
  bondR0        : f32,
  bondK         : f32,
  lineOpacity   : f32, // master force/bond line opacity (0..1)
  boundaryMode  : u32, // 0 = periodic, 1 = open, 2 = open-top
};

@group(0) @binding(0) var<uniform> cam: Camera;
@group(0) @binding(1) var<uniform> viz: Viz;
@group(0) @binding(2) var<storage, read> pos: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> segCount: array<u32>;
@group(0) @binding(4) var<storage, read> segPairs: array<u32>;
@group(0) @binding(5) var<storage, read> vel: array<vec4<f32>>;

fn minImage(d: vec3<f32>, box: vec3<f32>) -> vec3<f32> {
  if (viz.boundaryMode == 1u) { return d; }
  if (viz.boundaryMode == 2u) {
    return vec3<f32>(
      d.x - box.x * round(d.x / box.x),
      d.y,
      d.z - box.z * round(d.z / box.z),
    );
  }
  return d - box * round(d / box);
}

fn kindColor(kind: u32) -> vec3<f32> {
  switch (kind) {
    case 0u:  { return vec3<f32>(0.35, 0.85, 1.00); } // Coulomb — cyan
    case 1u:  { return vec3<f32>(0.10, 0.35, 0.20); } // Lennard-Jones — green
    default:  { return vec3<f32>(0.80, 0.80, 0.80); }
  }
}

struct VSOut {
  @builtin(position) clip  : vec4<f32>,
  @location(0)       color : vec3<f32>,
  @location(1)       alpha : f32,
};

@vertex
fn vs(
  @builtin(vertex_index) vi: u32,
  @builtin(instance_index) ii: u32,
) -> VSOut {
  let tileX = max(1u, u32(cam.tileGrid.x + 0.5));
  let tileY = max(1u, u32(cam.tileGrid.y + 0.5));
  let tileZ = max(1u, u32(cam.tileGrid.z + 0.5));
  let tileCount = tileX * tileY * tileZ;
  let segIndex = ii % viz.maxSeg;
  let tileIndex = ii / viz.maxSeg;

  var out: VSOut;
  out.color = vec3<f32>(0.35, 0.85, 1.0);
  out.alpha = 1.0;

  if (tileIndex >= tileCount || segIndex >= segCount[0]) {
    out.clip = vec4<f32>(10.0, 10.0, 10.0, 1.0); // off-screen -> clipped
    return out;
  }

  let ia = segPairs[segIndex * 4u];
  let ib = segPairs[segIndex * 4u + 1u];
  if (vel[ia].w <= 0.0 || vel[ib].w <= 0.0) {
    out.clip = vec4<f32>(10.0, 10.0, 10.0, 1.0);
    out.alpha = 0.0;
    return out;
  }
  out.alpha = bitcast<f32>(segPairs[segIndex * 4u + 2u]) * viz.lineOpacity;
  out.color = kindColor(segPairs[segIndex * 4u + 3u]);
  let tx = tileIndex % tileX;
  let ty = (tileIndex / tileX) % tileY;
  let tz = tileIndex / (tileX * tileY);
  let tileOffset = vec3<f32>(
    (f32(tx) - 0.5 * f32(tileX - 1u)) * cam.boxSize.x,
    (f32(ty) - 0.5 * f32(tileY - 1u)) * cam.boxSize.y,
    (f32(tz) - 0.5 * f32(tileZ - 1u)) * cam.boxSize.z,
  );
  let aBase = pos[ia].xyz;
  let bBase = aBase - minImage(aBase - pos[ib].xyz, viz.box); // nearest image of partner
  let a = aBase + tileOffset;
  let b = bBase + tileOffset;

  let world = select(b, a, vi == 0u);
  out.clip = cam.viewProj * vec4<f32>(world, 1.0);
  return out;
}

@fragment
fn fs(in: VSOut) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color, in.alpha);
}
`,_n=`// Runtime reactive bonding: propose one best partner per atom.
// This is a coarse, valence-limited heuristic for lightweight live bonding.

struct Uniforms {
  box      : vec3<f32>,
  cutoff2  : f32,
  numAtoms : u32,
  numMol   : u32,
  dt       : f32,
  coulombK : f32,
  r0       : f32,
  kb       : f32,
  theta0   : f32,
  ka       : f32,
  targetT  : f32,
  tau      : f32,
  kB       : f32,
  thermoOn : u32,
  gridDim  : vec3<u32>,
  cellCap  : u32,
  cellSize : vec3<f32>,
  useCells : u32,
  boundaryMode : u32,
  forceGuardOn : u32,
  reactiveOn : u32,
  staticBondCount : u32,
  maxReactiveBonds : u32,
  reactiveBreakScale : f32,
};

struct MolBond {
  ij  : vec2<u32>,
  par : vec2<f32>,
};

const INVALID: u32 = 0xffffffffu;
const REACTIVE_MIN_SCALE: f32 = 0.65;
const REACTIVE_CAPTURE_SCALE: f32 = 1.35;

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> pos: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> atomParams: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read_write> force: array<vec4<f32>>;
@group(0) @binding(4) var<storage, read> vel: array<vec4<f32>>;
@group(0) @binding(5) var<storage, read> staticBonds: array<MolBond>;
@group(0) @binding(6) var<storage, read_write> reactiveBonds: array<MolBond>;
@group(0) @binding(7) var<storage, read_write> reactiveCount: array<atomic<u32>>;
@group(0) @binding(8) var<storage, read_write> atomBondCounts: array<atomic<u32>>;
@group(0) @binding(9) var<storage, read_write> proposals: array<u32>;

fn minImage(d: vec3<f32>) -> vec3<f32> {
  if (u.boundaryMode == 1u) { return d; }
  if (u.boundaryMode == 2u) {
    return vec3<f32>(
      d.x - u.box.x * round(d.x / u.box.x),
      d.y,
      d.z - u.box.z * round(d.z / u.box.z),
    );
  }
  return d - u.box * round(d / u.box);
}

// Returns (maxBonds, covalentRadius, bondStiffness).
fn reactiveRule(typeId: u32) -> vec3<f32> {
  if (typeId == 1u) { return vec3<f32>(1.0, 0.031, 120000.0); } // H
  if (typeId == 13u) { return vec3<f32>(4.0, 0.076, 160000.0); } // C
  if (typeId == 0u) { return vec3<f32>(2.0, 0.066, 170000.0); } // O
  if (typeId == 14u) { return vec3<f32>(3.0, 0.071, 155000.0); } // N
  if (typeId == 3u) { return vec3<f32>(1.0, 0.102, 110000.0); } // Cl
  if (typeId == 8u) { return vec3<f32>(1.0, 0.12, 90000.0); } // Br
  return vec3<f32>(0.0, 0.0, 0.0);
}

fn hasBond(i: u32, j: u32) -> bool {
  for (var b: u32 = 0u; b < u.staticBondCount; b = b + 1u) {
    let pair = staticBonds[b].ij;
    if ((pair.x == i && pair.y == j) || (pair.x == j && pair.y == i)) {
      return true;
    }
  }

  let nReactive = min(atomicLoad(&reactiveCount[0]), u.maxReactiveBonds);
  for (var b: u32 = 0u; b < nReactive; b = b + 1u) {
    let pair = reactiveBonds[b].ij;
    if ((pair.x == i && pair.y == j) || (pair.x == j && pair.y == i)) {
      return true;
    }
  }
  return false;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= u.numAtoms) { return; }

  proposals[i] = INVALID;

  if (u.reactiveOn == 0u || vel[i].w <= 0.0) {
    return;
  }

  let ruleI = reactiveRule(u32(atomParams[i].w + 0.5));
  if (ruleI.x < 0.5) {
    return;
  }

  let maxI = u32(ruleI.x + 0.5);
  if (atomicLoad(&atomBondCounts[i]) >= maxI) {
    return;
  }

  let pi = pos[i].xyz;
  var bestJ = INVALID;
  var bestScore = 1e30;

  for (var j: u32 = 0u; j < u.numAtoms; j = j + 1u) {
    if (j == i || vel[j].w <= 0.0) { continue; }

    let ruleJ = reactiveRule(u32(atomParams[j].w + 0.5));
    if (ruleJ.x < 0.5) { continue; }

    let maxJ = u32(ruleJ.x + 0.5);
    if (atomicLoad(&atomBondCounts[j]) >= maxJ) { continue; }

    if (hasBond(i, j)) { continue; }

    let d = minImage(pi - pos[j].xyz);
    let r2 = dot(d, d);
    if (r2 < 1e-10) { continue; }

    let cov = ruleI.y + ruleJ.y;
    if (cov <= 0.0) { continue; }

    let rMin = cov * REACTIVE_MIN_SCALE;
    let rMax = cov * REACTIVE_CAPTURE_SCALE;
    if (r2 < rMin * rMin || r2 > rMax * rMax) { continue; }

    let score = r2 / (cov * cov);
    if (score < bestScore) {
      bestScore = score;
      bestJ = j;
    }
  }

  proposals[i] = bestJ;
}
`,vn=`// Runtime reactive bonding: commit mutual proposals into live bond slots.

struct Uniforms {
  box      : vec3<f32>,
  cutoff2  : f32,
  numAtoms : u32,
  numMol   : u32,
  dt       : f32,
  coulombK : f32,
  r0       : f32,
  kb       : f32,
  theta0   : f32,
  ka       : f32,
  targetT  : f32,
  tau      : f32,
  kB       : f32,
  thermoOn : u32,
  gridDim  : vec3<u32>,
  cellCap  : u32,
  cellSize : vec3<f32>,
  useCells : u32,
  boundaryMode : u32,
  forceGuardOn : u32,
  reactiveOn : u32,
  staticBondCount : u32,
  maxReactiveBonds : u32,
  reactiveBreakScale : f32,
};

struct MolBond {
  ij  : vec2<u32>,
  par : vec2<f32>,
};

const INVALID: u32 = 0xffffffffu;

fn minImage(d: vec3<f32>) -> vec3<f32> {
  if (u.boundaryMode == 1u) { return d; }
  if (u.boundaryMode == 2u) {
    return vec3<f32>(
      d.x - u.box.x * round(d.x / u.box.x),
      d.y,
      d.z - u.box.z * round(d.z / u.box.z),
    );
  }
  return d - u.box * round(d / u.box);
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> pos: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> atomParams: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read_write> force: array<vec4<f32>>;
@group(0) @binding(4) var<storage, read> vel: array<vec4<f32>>;
@group(0) @binding(5) var<storage, read> staticBonds: array<MolBond>;
@group(0) @binding(6) var<storage, read_write> reactiveBonds: array<MolBond>;
@group(0) @binding(7) var<storage, read_write> reactiveCount: array<atomic<u32>>;
@group(0) @binding(8) var<storage, read_write> atomBondCounts: array<atomic<u32>>;
@group(0) @binding(9) var<storage, read_write> proposals: array<u32>;

// Returns (maxBonds, covalentRadius, bondStiffness).
fn reactiveRule(typeId: u32) -> vec3<f32> {
  if (typeId == 1u) { return vec3<f32>(1.0, 0.031, 120000.0); } // H
  if (typeId == 13u) { return vec3<f32>(4.0, 0.076, 160000.0); } // C
  if (typeId == 0u) { return vec3<f32>(2.0, 0.066, 170000.0); } // O
  if (typeId == 14u) { return vec3<f32>(3.0, 0.071, 155000.0); } // N
  if (typeId == 3u) { return vec3<f32>(1.0, 0.102, 110000.0); } // Cl
  if (typeId == 8u) { return vec3<f32>(1.0, 0.12, 90000.0); } // Br
  return vec3<f32>(0.0, 0.0, 0.0);
}

fn tryClaim(atom: u32, maxBonds: u32) -> bool {
  var old = atomicLoad(&atomBondCounts[atom]);
  loop {
    if (old >= maxBonds) { return false; }
    let next = old + 1u;
    let result = atomicCompareExchangeWeak(&atomBondCounts[atom], old, next);
    if (result.exchanged) { return true; }
    old = result.old_value;
  }
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= u.numAtoms || u.reactiveOn == 0u || vel[i].w <= 0.0) { return; }

  let j = proposals[i];
  if (j == INVALID || j <= i || j >= u.numAtoms || vel[j].w <= 0.0) {
    return;
  }
  if (proposals[j] != i) {
    return;
  }

  let ruleI = reactiveRule(u32(atomParams[i].w + 0.5));
  let ruleJ = reactiveRule(u32(atomParams[j].w + 0.5));
  if (ruleI.x < 0.5 || ruleJ.x < 0.5) {
    return;
  }

  let maxI = u32(ruleI.x + 0.5);
  let maxJ = u32(ruleJ.x + 0.5);

  if (!tryClaim(i, maxI)) { return; }
  if (!tryClaim(j, maxJ)) {
    atomicSub(&atomBondCounts[i], 1u);
    return;
  }

  let slot = atomicAdd(&reactiveCount[0], 1u);
  if (slot >= u.maxReactiveBonds) {
    atomicSub(&reactiveCount[0], 1u);
    atomicSub(&atomBondCounts[i], 1u);
    atomicSub(&atomBondCounts[j], 1u);
    return;
  }

  let cov = ruleI.y + ruleJ.y;
  let bondK = sqrt(ruleI.z * ruleJ.z);
  let r = length(minImage(pos[j].xyz - pos[i].xyz));
  let r0 = clamp(r, cov * 0.9, cov * 1.2);
  reactiveBonds[slot] = MolBond(vec2<u32>(i, j), vec2<f32>(r0, bondK));

  proposals[i] = INVALID;
  proposals[j] = INVALID;
}
`,yn=`// Runtime reactive bonding force pass.
// Applies harmonic bond force for every active reactive bond.

struct Uniforms {
  box      : vec3<f32>,
  cutoff2  : f32,
  numAtoms : u32,
  numMol   : u32,
  dt       : f32,
  coulombK : f32,
  r0       : f32,
  kb       : f32,
  theta0   : f32,
  ka       : f32,
  targetT  : f32,
  tau      : f32,
  kB       : f32,
  thermoOn : u32,
  gridDim  : vec3<u32>,
  cellCap  : u32,
  cellSize : vec3<f32>,
  useCells : u32,
  boundaryMode : u32,
  forceGuardOn : u32,
  reactiveOn : u32,
  staticBondCount : u32,
  maxReactiveBonds : u32,
  reactiveBreakScale : f32,
};

struct MolBond {
  ij  : vec2<u32>,
  par : vec2<f32>,
};

const FORCE_GUARD_MAX: f32 = 25000.0;
const MAX_BOND_DELTA: f32 = 0.06;

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> pos: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> atomParams: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read_write> force: array<vec4<f32>>;
@group(0) @binding(4) var<storage, read> vel: array<vec4<f32>>;
@group(0) @binding(5) var<storage, read> staticBonds: array<MolBond>;
@group(0) @binding(6) var<storage, read_write> reactiveBonds: array<MolBond>;
@group(0) @binding(7) var<storage, read_write> reactiveCount: array<atomic<u32>>;
@group(0) @binding(8) var<storage, read_write> atomBondCounts: array<atomic<u32>>;
@group(0) @binding(9) var<storage, read_write> proposals: array<u32>;

fn minImage(d: vec3<f32>) -> vec3<f32> {
  if (u.boundaryMode == 1u) { return d; }
  if (u.boundaryMode == 2u) {
    return vec3<f32>(
      d.x - u.box.x * round(d.x / u.box.x),
      d.y,
      d.z - u.box.z * round(d.z / u.box.z),
    );
  }
  return d - u.box * round(d / u.box);
}

fn guardForce(f: vec3<f32>) -> vec3<f32> {
  if (u.forceGuardOn == 0u) { return f; }
  let m2 = dot(f, f);
  if (m2 <= FORCE_GUARD_MAX * FORCE_GUARD_MAX || m2 < 1e-16) { return f; }
  let invm = inverseSqrt(m2);
  return f * (FORCE_GUARD_MAX * invm);
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (u.reactiveOn == 0u) { return; }

  let idx = gid.x;
  let nReactive = min(atomicLoad(&reactiveCount[0]), u.maxReactiveBonds);
  if (idx >= nReactive) { return; }

  let bond = reactiveBonds[idx];
  let i = bond.ij.x;
  let j = bond.ij.y;
  if (i >= u.numAtoms || j >= u.numAtoms || vel[i].w <= 0.0 || vel[j].w <= 0.0) {
    return;
  }

  let r0 = bond.par.x;
  let kb = bond.par.y;
  if (kb <= 0.0) { return; }

  let d = minImage(pos[j].xyz - pos[i].xyz);
  let r = length(d);
  if (r < 1e-6) { return; }

  let invr = 1.0 / r;
  let delta = clamp(r - r0, -MAX_BOND_DELTA, MAX_BOND_DELTA);
  let fb = -kb * delta;
  let fv = guardForce((fb * invr) * d);

  force[j] = force[j] + vec4<f32>(fv, 0.0);
  force[i] = force[i] - vec4<f32>(fv, 0.0);
}
`,bn=`// Runtime reactive bonding maintenance pass.
// One invocation compacts active bonds and removes over-stretched bonds.

struct Uniforms {
  box      : vec3<f32>,
  cutoff2  : f32,
  numAtoms : u32,
  numMol   : u32,
  dt       : f32,
  coulombK : f32,
  r0       : f32,
  kb       : f32,
  theta0   : f32,
  ka       : f32,
  targetT  : f32,
  tau      : f32,
  kB       : f32,
  thermoOn : u32,
  gridDim  : vec3<u32>,
  cellCap  : u32,
  cellSize : vec3<f32>,
  useCells : u32,
  boundaryMode : u32,
  forceGuardOn : u32,
  reactiveOn : u32,
  staticBondCount : u32,
  maxReactiveBonds : u32,
  reactiveBreakScale : f32,
};

struct MolBond {
  ij  : vec2<u32>,
  par : vec2<f32>,
};

const INVALID: u32 = 0xffffffffu;

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> pos: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> atomParams: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read_write> force: array<vec4<f32>>;
@group(0) @binding(4) var<storage, read> vel: array<vec4<f32>>;
@group(0) @binding(5) var<storage, read> staticBonds: array<MolBond>;
@group(0) @binding(6) var<storage, read_write> reactiveBonds: array<MolBond>;
@group(0) @binding(7) var<storage, read_write> reactiveCount: array<atomic<u32>>;
@group(0) @binding(8) var<storage, read_write> atomBondCounts: array<atomic<u32>>;
@group(0) @binding(9) var<storage, read_write> proposals: array<u32>;

fn minImage(d: vec3<f32>) -> vec3<f32> {
  if (u.boundaryMode == 1u) { return d; }
  if (u.boundaryMode == 2u) {
    return vec3<f32>(
      d.x - u.box.x * round(d.x / u.box.x),
      d.y,
      d.z - u.box.z * round(d.z / u.box.z),
    );
  }
  return d - u.box * round(d / u.box);
}

fn decrementBondCount(atom: u32) {
  let old = atomicLoad(&atomBondCounts[atom]);
  if (old > 0u) {
    atomicSub(&atomBondCounts[atom], 1u);
  }
}

@compute @workgroup_size(1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x != 0u || u.reactiveOn == 0u) {
    return;
  }

  let count = min(atomicLoad(&reactiveCount[0]), u.maxReactiveBonds);
  var writeIdx: u32 = 0u;

  for (var readIdx: u32 = 0u; readIdx < count; readIdx = readIdx + 1u) {
    let bond = reactiveBonds[readIdx];
    let i = bond.ij.x;
    let j = bond.ij.y;
    let r0 = bond.par.x;
    let kb = bond.par.y;

    var keep = true;

    if (kb <= 0.0 || i >= u.numAtoms || j >= u.numAtoms || i == j) {
      keep = false;
    } else if (vel[i].w <= 0.0 || vel[j].w <= 0.0) {
      keep = false;
    } else {
      let d = minImage(pos[j].xyz - pos[i].xyz);
      let r = length(d);
      if (r > r0 * u.reactiveBreakScale) {
        keep = false;
      }
    }

    if (keep) {
      if (writeIdx != readIdx) {
        reactiveBonds[writeIdx] = bond;
      }
      writeIdx = writeIdx + 1u;
    } else {
      if (i < u.numAtoms) { decrementBondCount(i); }
      if (j < u.numAtoms) { decrementBondCount(j); }
    }
  }

  for (var k: u32 = writeIdx; k < count; k = k + 1u) {
    reactiveBonds[k] = MolBond(vec2<u32>(INVALID, INVALID), vec2<f32>(0.0, 0.0));
  }

  atomicStore(&reactiveCount[0], writeIdx);
}
`,xn=64,Sn=128,Cn=128,wn=64,Tn=.1,En=3,Dn=1500,On=4e3,kn=650,An=70,jn=150,Mn=6,Nn=1.75,Pn=class{constructor(e){this.numAtoms=0,this.numMol=0,this.numBonds=0,this.staticBondCount=0,this.maxReactiveBonds=0,this.maxSeg=0,this.bondR0=0,this.bondK=0,this.useCells=!1,this.numCells=1,this.cellCap=1,this.allocatedCellCount=1,this.allocatedCellCap=1,this.gridDim=[1,1,1],this.cellSize=[1,1,1],this.showAttractions=!0,this.atomScale=1,this.forceOpacity=1,this.showForces=!0,this.showBonds=!0,this.showBox=!1,this.periodicTilesX=1,this.periodicTilesY=1,this.periodicTilesZ=1,this.topologyBonds=[],this.atomsByMolecule=[],this.boundaryCleanupPending=!1,this.thermoTargetT=300,this.thermoOn=0,this.forceGuardOn=1,this.reactiveOn=1,this.boundaryMode=`periodic`,this.reactiveStepCounter=0,this.depthTexture=null,this.depthSize={w:0,h:0},this.canvas=e}async initialize(e,t,n,r){if(!navigator.gpu)throw Error(`WebGPU is not available in this browser.`);let i=await navigator.gpu.requestAdapter();if(!i)throw Error(`No WebGPU adapter found.`);let a=Math.min(10,i.limits.maxStorageBuffersPerShaderStage);this.device=await i.requestDevice({requiredLimits:{maxStorageBuffersPerShaderStage:a}}),this.params=e,this.numAtoms=e.numAtoms,this.numMol=e.numMolecules,this.topologyBonds=t.bonds.slice(),this.atomsByMolecule=this.groupAtomsByMolecule(t.moleculeIds),this.thermoTargetT=r.targetTemperature,this.thermoOn=+!!r.thermostatEnabled,this.forceGuardOn=+!!r.forceGuardEnabled,this.reactiveOn=+!!r.reactiveBondingEnabled,this.boundaryMode=r.boundaryMode,this.reactiveStepCounter=0,this.computeGrid(),this.showAttractions=this.numAtoms<=On,this.context=this.canvas.getContext(`webgpu`),this.format=navigator.gpu.getPreferredCanvasFormat(),this.context.configure({device:this.device,format:this.format,alphaMode:`opaque`}),this.createBuffers(n),this.createVizBuffers(t),this.writeUniforms(t),this.writeVizUniform(),this.createComputePipelines(),this.createRenderPipeline(),this.createBondPipeline(),this.createBoxPipeline(),this.createAttractionPipelines(),this.computeForces()}computeGrid(){let e=this.params,t=e.cutoffRadius,n=Math.max(1,Math.floor(e.box[0]/t)),r=Math.max(1,Math.floor(e.box[1]/t)),i=Math.max(1,Math.floor(e.box[2]/t));this.gridDim=[n,r,i],this.cellSize=[e.box[0]/n,e.box[1]/r,e.box[2]/i],this.numCells=n*r*i;let a=Math.min(n,r,i)>=En;this.useCells=this.boundaryMode===`periodic`&&a&&this.numAtoms>=Dn;let o=this.numAtoms/Math.max(1,this.numCells);this.cellCap=Math.min(256,Math.max(32,Math.ceil(o*2.5)))}createBuffers(e){let t=this.device,n=this.numAtoms*16;this.uniformBuffer=t.createBuffer({size:Sn,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.cameraBuffer=t.createBuffer({size:Cn,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.posBuffer=t.createBuffer({size:n,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),this.velBuffer=t.createBuffer({size:n,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),this.forceBuffer=t.createBuffer({size:n,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),this.atomParamsBuffer=t.createBuffer({size:n,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),this.reductionBuffer=t.createBuffer({size:16,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),this.cellHeadBuffer=t.createBuffer({size:this.numCells*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),this.cellAtomsBuffer=t.createBuffer({size:this.numCells*this.cellCap*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),this.allocatedCellCount=this.numCells,this.allocatedCellCap=this.cellCap,t.queue.writeBuffer(this.posBuffer,0,e.positions),t.queue.writeBuffer(this.velBuffer,0,e.velocities),t.queue.writeBuffer(this.atomParamsBuffer,0,e.atomParams),t.queue.writeBuffer(this.forceBuffer,0,new Float32Array(this.numAtoms*4))}writeUniforms(e){let t=this.params,n=new ArrayBuffer(Sn),r=new DataView(n),i=e.bonds[0],a=e.angles[0];r.setFloat32(0,t.box[0],!0),r.setFloat32(4,t.box[1],!0),r.setFloat32(8,t.box[2],!0),r.setFloat32(12,t.cutoffRadius*t.cutoffRadius,!0),r.setUint32(16,t.numAtoms,!0),r.setUint32(20,t.numMolecules,!0),r.setFloat32(24,t.dt,!0),r.setFloat32(28,t.coulombConstant,!0),r.setFloat32(32,i?i.r0:0,!0),r.setFloat32(36,i?i.k:0,!0),r.setFloat32(40,a?a.theta0:0,!0),r.setFloat32(44,a?a.kTheta:0,!0),r.setFloat32(48,this.thermoTargetT,!0),r.setFloat32(52,Tn,!0),r.setFloat32(56,Ot,!0),r.setUint32(60,this.thermoOn,!0),r.setUint32(64,this.gridDim[0],!0),r.setUint32(68,this.gridDim[1],!0),r.setUint32(72,this.gridDim[2],!0),r.setUint32(76,this.cellCap,!0),r.setFloat32(80,this.cellSize[0],!0),r.setFloat32(84,this.cellSize[1],!0),r.setFloat32(88,this.cellSize[2],!0),r.setUint32(92,+!!this.useCells,!0),r.setUint32(96,this.boundaryModeCode(),!0),r.setUint32(100,this.forceGuardOn,!0),r.setUint32(104,this.reactiveOn,!0),r.setUint32(108,this.staticBondCount,!0),r.setUint32(112,this.maxReactiveBonds,!0),r.setFloat32(116,Nn,!0),this.uniformData=n,this.device.queue.writeBuffer(this.uniformBuffer,0,n)}createVizBuffers(e){let t=this.device;this.numBonds=e.bonds.length,this.staticBondCount=e.bonds.length;let n=e.bonds[0];this.bondR0=n?n.r0:0,this.bondK=n?n.k:0,this.maxReactiveBonds=Math.max(64,Math.ceil(this.numAtoms*1.5));let r=e.molRanges.length>0?e.molRanges:new Uint32Array(4);this.molRangesBuffer=t.createBuffer({size:r.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),t.queue.writeBuffer(this.molRangesBuffer,0,r);let i=new ArrayBuffer(Math.max(1,this.numBonds)*16),a=new DataView(i);for(let t=0;t<this.numBonds;t++){let n=e.bonds[t];a.setUint32(t*16+0,n.i,!0),a.setUint32(t*16+4,n.j,!0),a.setFloat32(t*16+8,n.r0,!0),a.setFloat32(t*16+12,n.k,!0)}this.molBondsBuffer=t.createBuffer({size:i.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),t.queue.writeBuffer(this.molBondsBuffer,0,i),this.reactiveBondsBuffer=t.createBuffer({size:this.maxReactiveBonds*16,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),this.reactiveCountBuffer=t.createBuffer({size:16,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),this.reactiveProposalBuffer=t.createBuffer({size:this.numAtoms*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),this.atomBondCountsBuffer=t.createBuffer({size:this.numAtoms*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});let o=new Float32Array(this.maxReactiveBonds*4);t.queue.writeBuffer(this.reactiveBondsBuffer,0,o),t.queue.writeBuffer(this.reactiveCountBuffer,0,new Uint32Array([0]));let s=new Uint32Array(this.numAtoms);s.fill(4294967295),t.queue.writeBuffer(this.reactiveProposalBuffer,0,s);let c=new Uint32Array(this.numAtoms);for(let t of e.bonds)c[t.i]++,c[t.j]++;t.queue.writeBuffer(this.atomBondCountsBuffer,0,c);let l=e.angles.length,u=new ArrayBuffer(Math.max(1,l)*32),d=new DataView(u);for(let t=0;t<l;t++){let n=e.angles[t];d.setUint32(t*32+0,n.i,!0),d.setUint32(t*32+4,n.j,!0),d.setUint32(t*32+8,n.k,!0),d.setFloat32(t*32+16,n.theta0,!0),d.setFloat32(t*32+20,n.kTheta,!0)}this.molAnglesBuffer=t.createBuffer({size:u.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),t.queue.writeBuffer(this.molAnglesBuffer,0,u),this.maxSeg=Math.max(1,this.numAtoms*8),this.segCountBuffer=t.createBuffer({size:16,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),this.segPairsBuffer=t.createBuffer({size:this.maxSeg*4*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),this.vizUniformBuffer=t.createBuffer({size:wn,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST})}writeVizUniform(){let e=this.params,t=new ArrayBuffer(wn),n=new DataView(t);n.setFloat32(0,e.box[0],!0),n.setFloat32(4,e.box[1],!0),n.setFloat32(8,e.box[2],!0),n.setFloat32(12,e.coulombConstant,!0),n.setFloat32(16,e.cutoffRadius*e.cutoffRadius,!0),n.setFloat32(20,kn,!0),n.setUint32(24,e.numAtoms,!0),n.setUint32(28,this.maxSeg,!0),n.setFloat32(32,An,!0),n.setFloat32(36,jn,!0),n.setFloat32(40,this.bondR0,!0),n.setFloat32(44,this.bondK,!0),n.setFloat32(48,this.forceOpacity,!0),n.setUint32(52,this.boundaryModeCode(),!0),this.device.queue.writeBuffer(this.vizUniformBuffer,0,t)}boundaryModeCode(){switch(this.boundaryMode){case`open`:return 1;case`open-top`:return 2;default:return 0}}setThermostat(e,t){if(this.thermoTargetT=e,this.thermoOn=+!!t,!this.uniformData)return;let n=new DataView(this.uniformData);n.setFloat32(48,this.thermoTargetT,!0),n.setUint32(60,this.thermoOn,!0),this.device.queue.writeBuffer(this.uniformBuffer,0,this.uniformData)}setForceGuard(e){this.forceGuardOn=+!!e,this.uniformData&&(new DataView(this.uniformData).setUint32(100,this.forceGuardOn,!0),this.device.queue.writeBuffer(this.uniformBuffer,0,this.uniformData))}setReactiveBonding(e){this.reactiveOn=+!!e,this.uniformData&&(new DataView(this.uniformData).setUint32(104,this.reactiveOn,!0),this.device.queue.writeBuffer(this.uniformBuffer,0,this.uniformData))}setCutoffRadius(e){let t=Math.max(.05,e);if(!(!this.params||this.params.cutoffRadius===t)){if(this.params.cutoffRadius=t,this.computeGrid(),this.enforceCellBufferCapacity(),this.uniformData){let e=new DataView(this.uniformData);e.setFloat32(12,t*t,!0),e.setUint32(64,this.gridDim[0],!0),e.setUint32(68,this.gridDim[1],!0),e.setUint32(72,this.gridDim[2],!0),e.setUint32(76,this.cellCap,!0),e.setFloat32(80,this.cellSize[0],!0),e.setFloat32(84,this.cellSize[1],!0),e.setFloat32(88,this.cellSize[2],!0),e.setUint32(92,+!!this.useCells,!0),this.device.queue.writeBuffer(this.uniformBuffer,0,this.uniformData)}if(this.vizUniformBuffer){let e=new ArrayBuffer(4);new DataView(e).setFloat32(0,t*t,!0),this.device.queue.writeBuffer(this.vizUniformBuffer,16,e)}this.boundaryCleanupPending||this.computeForces()}}enforceCellBufferCapacity(){(this.numCells>this.allocatedCellCount||this.cellCap>this.allocatedCellCap)&&(this.useCells=!1)}setBoundaryMode(e){if(this.boundaryMode===e)return;let t=this.boundaryMode;if(this.boundaryMode=e,this.computeGrid(),this.enforceCellBufferCapacity(),this.uniformData){let e=new DataView(this.uniformData);e.setUint32(92,+!!this.useCells,!0),e.setUint32(96,this.boundaryModeCode(),!0),this.device.queue.writeBuffer(this.uniformBuffer,0,this.uniformData)}if(this.vizUniformBuffer){let e=new ArrayBuffer(4);new DataView(e).setUint32(0,this.boundaryModeCode(),!0),this.device.queue.writeBuffer(this.vizUniformBuffer,52,e)}this.boundaryCleanupPending=!0,this.sanitizeBoundaryTransition(t,e)}groupAtomsByMolecule(e){let t=new Map;for(let n=0;n<e.length;n++){let r=e[n],i=t.get(r);i?i.push(n):t.set(r,[n])}return[...t.values()]}wrappedAxes(e){switch(e){case`periodic`:return[!0,!0,!0];case`open-top`:return[!0,!1,!0];default:return[!1,!1,!1]}}setViewOptions(e){this.atomScale=e.atomScale,this.forceOpacity=e.forceOpacity,this.showForces=e.showForces,this.showBonds=e.showBonds,this.showBox=e.showBox;let t=Math.max(1,Math.round(e.periodicTiles??1));this.periodicTilesX=Math.max(1,Math.min(6,Math.round(e.periodicTilesX??t))),this.periodicTilesY=Math.max(1,Math.min(6,Math.round(e.periodicTilesY??t))),this.periodicTilesZ=Math.max(1,Math.min(6,Math.round(e.periodicTilesZ??t)));let n=new ArrayBuffer(4);new DataView(n).setFloat32(0,this.forceOpacity,!0),this.device.queue.writeBuffer(this.vizUniformBuffer,48,n)}renderTileGrid(){return this.boundaryMode===`periodic`?[this.periodicTilesX,this.periodicTilesY,this.periodicTilesZ]:[1,1,1]}renderTileCount(){let[e,t,n]=this.renderTileGrid();return e*t*n}createComputePipelines(){let e=this.device;this.computeLayout=e.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:`uniform`}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:`storage`}},{binding:2,visibility:GPUShaderStage.COMPUTE,buffer:{type:`storage`}},{binding:3,visibility:GPUShaderStage.COMPUTE,buffer:{type:`storage`}},{binding:4,visibility:GPUShaderStage.COMPUTE,buffer:{type:`storage`}},{binding:5,visibility:GPUShaderStage.COMPUTE,buffer:{type:`storage`}},{binding:6,visibility:GPUShaderStage.COMPUTE,buffer:{type:`storage`}},{binding:7,visibility:GPUShaderStage.COMPUTE,buffer:{type:`storage`}}]}),this.computeBindGroup=e.createBindGroup({layout:this.computeLayout,entries:[{binding:0,resource:{buffer:this.uniformBuffer}},{binding:1,resource:{buffer:this.posBuffer}},{binding:2,resource:{buffer:this.atomParamsBuffer}},{binding:3,resource:{buffer:this.forceBuffer}},{binding:4,resource:{buffer:this.velBuffer}},{binding:5,resource:{buffer:this.reductionBuffer}},{binding:6,resource:{buffer:this.cellHeadBuffer}},{binding:7,resource:{buffer:this.cellAtomsBuffer}}]});let t=e.createPipelineLayout({bindGroupLayouts:[this.computeLayout]});this.bondedLayout=e.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:`read-only-storage`}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:`read-only-storage`}},{binding:2,visibility:GPUShaderStage.COMPUTE,buffer:{type:`read-only-storage`}}]}),this.bondedBindGroup=e.createBindGroup({layout:this.bondedLayout,entries:[{binding:0,resource:{buffer:this.molRangesBuffer}},{binding:1,resource:{buffer:this.molBondsBuffer}},{binding:2,resource:{buffer:this.molAnglesBuffer}}]});let n=e.createPipelineLayout({bindGroupLayouts:[this.computeLayout,this.bondedLayout]});this.reactiveLayout=e.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:`uniform`}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:`read-only-storage`}},{binding:2,visibility:GPUShaderStage.COMPUTE,buffer:{type:`read-only-storage`}},{binding:3,visibility:GPUShaderStage.COMPUTE,buffer:{type:`storage`}},{binding:4,visibility:GPUShaderStage.COMPUTE,buffer:{type:`read-only-storage`}},{binding:5,visibility:GPUShaderStage.COMPUTE,buffer:{type:`read-only-storage`}},{binding:6,visibility:GPUShaderStage.COMPUTE,buffer:{type:`storage`}},{binding:7,visibility:GPUShaderStage.COMPUTE,buffer:{type:`storage`}},{binding:8,visibility:GPUShaderStage.COMPUTE,buffer:{type:`storage`}},{binding:9,visibility:GPUShaderStage.COMPUTE,buffer:{type:`storage`}}]}),this.reactiveBindGroup=e.createBindGroup({layout:this.reactiveLayout,entries:[{binding:0,resource:{buffer:this.uniformBuffer}},{binding:1,resource:{buffer:this.posBuffer}},{binding:2,resource:{buffer:this.atomParamsBuffer}},{binding:3,resource:{buffer:this.forceBuffer}},{binding:4,resource:{buffer:this.velBuffer}},{binding:5,resource:{buffer:this.molBondsBuffer}},{binding:6,resource:{buffer:this.reactiveBondsBuffer}},{binding:7,resource:{buffer:this.reactiveCountBuffer}},{binding:8,resource:{buffer:this.atomBondCountsBuffer}},{binding:9,resource:{buffer:this.reactiveProposalBuffer}}]});let r=e.createPipelineLayout({bindGroupLayouts:[this.reactiveLayout]}),i=n=>e.createComputePipeline({layout:t,compute:{module:e.createShaderModule({code:en+`
`+n}),entryPoint:`main`}});this.pipelines={lj:i(tn),coulomb:i(nn),bonded:e.createComputePipeline({layout:n,compute:{module:e.createShaderModule({code:en+`
`+rn}),entryPoint:`main`}}),reactivePropose:e.createComputePipeline({layout:r,compute:{module:e.createShaderModule({code:_n}),entryPoint:`main`}}),reactiveCommit:e.createComputePipeline({layout:r,compute:{module:e.createShaderModule({code:vn}),entryPoint:`main`}}),reactiveMaintain:e.createComputePipeline({layout:r,compute:{module:e.createShaderModule({code:bn}),entryPoint:`main`}}),reactiveForce:e.createComputePipeline({layout:r,compute:{module:e.createShaderModule({code:yn}),entryPoint:`main`}}),integratePos:i(an),integrateVel:i(on),cullBoundary:i(sn),thermoReduce:i(cn),thermoScale:i(ln),cellClear:i(un),cellBuild:i(dn)}}createRenderPipeline(){let e=this.device,t=e.createShaderModule({code:fn}),n=e.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:`uniform`}},{binding:1,visibility:GPUShaderStage.VERTEX,buffer:{type:`read-only-storage`}},{binding:2,visibility:GPUShaderStage.VERTEX,buffer:{type:`read-only-storage`}},{binding:3,visibility:GPUShaderStage.VERTEX,buffer:{type:`read-only-storage`}}]});this.renderBindGroup=e.createBindGroup({layout:n,entries:[{binding:0,resource:{buffer:this.cameraBuffer}},{binding:1,resource:{buffer:this.posBuffer}},{binding:2,resource:{buffer:this.atomParamsBuffer}},{binding:3,resource:{buffer:this.velBuffer}}]}),this.renderPipeline=e.createRenderPipeline({layout:e.createPipelineLayout({bindGroupLayouts:[n]}),vertex:{module:t,entryPoint:`vs`},fragment:{module:t,entryPoint:`fs`,targets:[{format:this.format}]},primitive:{topology:`triangle-list`,cullMode:`none`},depthStencil:{format:`depth24plus`,depthWriteEnabled:!0,depthCompare:`less`}})}createBondPipeline(){let e=this.device,t=e.createShaderModule({code:pn}),n=e.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:`uniform`}},{binding:1,visibility:GPUShaderStage.VERTEX,buffer:{type:`uniform`}},{binding:2,visibility:GPUShaderStage.VERTEX,buffer:{type:`read-only-storage`}},{binding:3,visibility:GPUShaderStage.VERTEX,buffer:{type:`read-only-storage`}},{binding:4,visibility:GPUShaderStage.VERTEX,buffer:{type:`read-only-storage`}}]});this.bondBindGroup=e.createBindGroup({layout:n,entries:[{binding:0,resource:{buffer:this.cameraBuffer}},{binding:1,resource:{buffer:this.vizUniformBuffer}},{binding:2,resource:{buffer:this.posBuffer}},{binding:3,resource:{buffer:this.molBondsBuffer}},{binding:4,resource:{buffer:this.velBuffer}}]}),this.reactiveBondBindGroup=e.createBindGroup({layout:n,entries:[{binding:0,resource:{buffer:this.cameraBuffer}},{binding:1,resource:{buffer:this.vizUniformBuffer}},{binding:2,resource:{buffer:this.posBuffer}},{binding:3,resource:{buffer:this.reactiveBondsBuffer}},{binding:4,resource:{buffer:this.velBuffer}}]}),this.bondPipeline=e.createRenderPipeline({layout:e.createPipelineLayout({bindGroupLayouts:[n]}),vertex:{module:t,entryPoint:`vs`},fragment:{module:t,entryPoint:`fs`,targets:[{format:this.format,blend:{color:{srcFactor:`src-alpha`,dstFactor:`one-minus-src-alpha`,operation:`add`},alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`}}}]},primitive:{topology:`line-list`},depthStencil:{format:`depth24plus`,depthWriteEnabled:!1,depthCompare:`less`}})}createBoxPipeline(){let e=this.device,t=e.createShaderModule({code:mn}),n=e.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:`uniform`}},{binding:1,visibility:GPUShaderStage.VERTEX,buffer:{type:`uniform`}}]});this.boxBindGroup=e.createBindGroup({layout:n,entries:[{binding:0,resource:{buffer:this.cameraBuffer}},{binding:1,resource:{buffer:this.vizUniformBuffer}}]}),this.boxPipeline=e.createRenderPipeline({layout:e.createPipelineLayout({bindGroupLayouts:[n]}),vertex:{module:t,entryPoint:`vs`},fragment:{module:t,entryPoint:`fs`,targets:[{format:this.format,blend:{color:{srcFactor:`src-alpha`,dstFactor:`one-minus-src-alpha`,operation:`add`},alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`}}}]},primitive:{topology:`line-list`},depthStencil:{format:`depth24plus`,depthWriteEnabled:!1,depthCompare:`less`}})}createAttractionPipelines(){let e=this.device,t=e.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:`uniform`}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:`read-only-storage`}},{binding:2,visibility:GPUShaderStage.COMPUTE,buffer:{type:`read-only-storage`}},{binding:3,visibility:GPUShaderStage.COMPUTE,buffer:{type:`read-only-storage`}},{binding:4,visibility:GPUShaderStage.COMPUTE,buffer:{type:`storage`}},{binding:5,visibility:GPUShaderStage.COMPUTE,buffer:{type:`storage`}}]});this.attractionBuildBindGroup=e.createBindGroup({layout:t,entries:[{binding:0,resource:{buffer:this.vizUniformBuffer}},{binding:1,resource:{buffer:this.posBuffer}},{binding:2,resource:{buffer:this.atomParamsBuffer}},{binding:3,resource:{buffer:this.velBuffer}},{binding:4,resource:{buffer:this.segCountBuffer}},{binding:5,resource:{buffer:this.segPairsBuffer}}]}),this.attractionBuildPipeline=e.createComputePipeline({layout:e.createPipelineLayout({bindGroupLayouts:[t]}),compute:{module:e.createShaderModule({code:hn}),entryPoint:`main`}});let n=e.createShaderModule({code:gn}),r=e.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:`uniform`}},{binding:1,visibility:GPUShaderStage.VERTEX,buffer:{type:`uniform`}},{binding:2,visibility:GPUShaderStage.VERTEX,buffer:{type:`read-only-storage`}},{binding:3,visibility:GPUShaderStage.VERTEX,buffer:{type:`read-only-storage`}},{binding:4,visibility:GPUShaderStage.VERTEX,buffer:{type:`read-only-storage`}},{binding:5,visibility:GPUShaderStage.VERTEX,buffer:{type:`read-only-storage`}}]});this.attractionBindGroup=e.createBindGroup({layout:r,entries:[{binding:0,resource:{buffer:this.cameraBuffer}},{binding:1,resource:{buffer:this.vizUniformBuffer}},{binding:2,resource:{buffer:this.posBuffer}},{binding:3,resource:{buffer:this.segCountBuffer}},{binding:4,resource:{buffer:this.segPairsBuffer}},{binding:5,resource:{buffer:this.velBuffer}}]}),this.attractionPipeline=e.createRenderPipeline({layout:e.createPipelineLayout({bindGroupLayouts:[r]}),vertex:{module:n,entryPoint:`vs`},fragment:{module:n,entryPoint:`fs`,targets:[{format:this.format,blend:{color:{srcFactor:`src-alpha`,dstFactor:`one-minus-src-alpha`,operation:`add`},alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`}}}]},primitive:{topology:`line-list`},depthStencil:{format:`depth24plus`,depthWriteEnabled:!1,depthCompare:`less`}})}atomGroups(){return Math.ceil(this.numAtoms/xn)}molGroups(){return Math.ceil(this.numMol/xn)}cellGroups(){return Math.ceil(this.numCells/xn)}buildCells(e,t){this.useCells&&(e.setPipeline(this.pipelines.cellClear),e.dispatchWorkgroups(this.cellGroups()),e.setPipeline(this.pipelines.cellBuild),e.dispatchWorkgroups(t))}cullForBoundary(e){let t=this.atomGroups();if(e){e.setPipeline(this.pipelines.cullBoundary),e.dispatchWorkgroups(t);return}let n=this.device.createCommandEncoder(),r=n.beginComputePass();r.setBindGroup(0,this.computeBindGroup),r.setPipeline(this.pipelines.cullBoundary),r.dispatchWorkgroups(t),r.end(),this.device.queue.submit([n.finish()])}unwrapDelta(e,t){return t<=0?e:e-t*Math.round(e/t)}unwrapMoleculesForRemovedWrap(e,t,n){let r=new Map;for(let e of this.topologyBonds){let t=e.i,n=e.j,i=r.get(t);i?i.push(n):r.set(t,[n]);let a=r.get(n);a?a.push(t):r.set(n,[t])}for(let i of this.atomsByMolecule){let a=-1;for(let e of i)if(t[e*4+3]>0){a=e;break}if(a<0)continue;let o=new Set(i),s=new Set,c=[];for(s.add(a),c.push(a);c.length>0;){let i=c.shift(),a=r.get(i);if(!a)continue;let l=e[i*4+0],u=e[i*4+1],d=e[i*4+2];for(let r of a){if(!o.has(r)||t[r*4+3]<=0||s.has(r))continue;let a=e[r*4+0]-e[i*4+0],f=e[r*4+1]-e[i*4+1],p=e[r*4+2]-e[i*4+2];n[0]&&(a=this.unwrapDelta(a,this.params.box[0])),n[1]&&(f=this.unwrapDelta(f,this.params.box[1])),n[2]&&(p=this.unwrapDelta(p,this.params.box[2])),e[r*4+0]=l+a,e[r*4+1]=u+f,e[r*4+2]=d+p,s.add(r),c.push(r)}}let l=e[a*4+0],u=e[a*4+1],d=e[a*4+2];for(let r of i){if(t[r*4+3]<=0||s.has(r))continue;let i=e[r*4+0]-l,a=e[r*4+1]-u,o=e[r*4+2]-d;n[0]&&(i=this.unwrapDelta(i,this.params.box[0])),n[1]&&(a=this.unwrapDelta(a,this.params.box[1])),n[2]&&(o=this.unwrapDelta(o,this.params.box[2])),e[r*4+0]=l+i,e[r*4+1]=u+a,e[r*4+2]=d+o}}}async sanitizeBoundaryTransition(e,t){try{let[n,r,i]=this.wrappedAxes(e),[a,o,s]=this.wrappedAxes(t),c=[n&&!a,r&&!o,i&&!s],l=await this.readbackPositions(),u=await this.readbackVelocities();(c[0]||c[1]||c[2])&&(this.unwrapMoleculesForRemovedWrap(l,u,c),this.device.queue.writeBuffer(this.posBuffer,0,l));let d=new Float32Array(this.numAtoms*4);this.device.queue.writeBuffer(this.forceBuffer,0,d),this.computeForces()}finally{this.boundaryCleanupPending=!1}}computeForces(){let e=this.device.createCommandEncoder(),t=e.beginComputePass();t.setBindGroup(0,this.computeBindGroup);let n=this.atomGroups();this.buildCells(t,n),t.setPipeline(this.pipelines.lj),t.dispatchWorkgroups(n),t.setPipeline(this.pipelines.coulomb),t.dispatchWorkgroups(n),this.numMol>0&&(t.setBindGroup(1,this.bondedBindGroup),t.setPipeline(this.pipelines.bonded),t.dispatchWorkgroups(this.molGroups())),this.reactiveOn===1&&(t.setBindGroup(0,this.reactiveBindGroup),t.setPipeline(this.pipelines.reactiveForce),t.dispatchWorkgroups(Math.ceil(this.maxReactiveBonds/xn)),t.setBindGroup(0,this.computeBindGroup)),t.end(),this.device.queue.submit([e.finish()])}stepSimulation(e){if(this.boundaryCleanupPending)return;let t=this.device.createCommandEncoder(),n=t.beginComputePass();n.setBindGroup(0,this.computeBindGroup);let r=this.atomGroups(),i=this.molGroups();for(let t=0;t<e;t++)n.setPipeline(this.pipelines.integratePos),n.dispatchWorkgroups(r),this.cullForBoundary(n),this.buildCells(n,r),this.reactiveOn===1&&this.reactiveStepCounter%Mn===0&&(n.setBindGroup(0,this.reactiveBindGroup),n.setPipeline(this.pipelines.reactiveMaintain),n.dispatchWorkgroups(1),n.setPipeline(this.pipelines.reactivePropose),n.dispatchWorkgroups(r),n.setPipeline(this.pipelines.reactiveCommit),n.dispatchWorkgroups(r),n.setBindGroup(0,this.computeBindGroup)),n.setPipeline(this.pipelines.lj),n.dispatchWorkgroups(r),n.setPipeline(this.pipelines.coulomb),n.dispatchWorkgroups(r),this.numMol>0&&(n.setBindGroup(1,this.bondedBindGroup),n.setPipeline(this.pipelines.bonded),n.dispatchWorkgroups(i)),this.reactiveOn===1&&(n.setBindGroup(0,this.reactiveBindGroup),n.setPipeline(this.pipelines.reactiveForce),n.dispatchWorkgroups(Math.ceil(this.maxReactiveBonds/xn)),n.setBindGroup(0,this.computeBindGroup)),n.setPipeline(this.pipelines.integrateVel),n.dispatchWorkgroups(r),n.setPipeline(this.pipelines.thermoReduce),n.dispatchWorkgroups(1),n.setPipeline(this.pipelines.thermoScale),n.dispatchWorkgroups(r),this.reactiveStepCounter++;n.end(),this.device.queue.submit([t.finish()])}render(e){this.writeCamera(e),this.ensureDepth();let t=this.renderTileCount(),n=this.showForces&&this.showAttractions;n&&this.device.queue.writeBuffer(this.segCountBuffer,0,new Uint32Array([0]));let r=this.device.createCommandEncoder();if(n){let e=r.beginComputePass();e.setPipeline(this.attractionBuildPipeline),e.setBindGroup(0,this.attractionBuildBindGroup),e.dispatchWorkgroups(this.atomGroups()),e.end()}let i=this.context.getCurrentTexture().createView(),a=r.beginRenderPass({colorAttachments:[{view:i,clearValue:{r:.043,g:.047,b:.063,a:1},loadOp:`clear`,storeOp:`store`}],depthStencilAttachment:{view:this.depthTexture.createView(),depthClearValue:1,depthLoadOp:`clear`,depthStoreOp:`store`}});a.setPipeline(this.renderPipeline),a.setBindGroup(0,this.renderBindGroup),a.draw(6,this.numAtoms*t),this.showBox&&(a.setPipeline(this.boxPipeline),a.setBindGroup(0,this.boxBindGroup),a.draw(2,12*t)),this.showBonds&&(this.numBonds>0||this.reactiveOn===1)&&(a.setPipeline(this.bondPipeline),this.numBonds>0&&(a.setBindGroup(0,this.bondBindGroup),a.draw(2,this.numBonds*t)),this.reactiveOn===1&&(a.setBindGroup(0,this.reactiveBondBindGroup),a.draw(2,this.maxReactiveBonds*t))),n&&(a.setPipeline(this.attractionPipeline),a.setBindGroup(0,this.attractionBindGroup),a.draw(2,this.maxSeg*t)),a.end(),this.device.queue.submit([r.finish()])}writeCamera(e){let t=new ArrayBuffer(Cn),n=new Float32Array(t),r=this.renderTileGrid();n.set(e.viewProj,0),n[16]=e.right[0],n[17]=e.right[1],n[18]=e.right[2],n[19]=this.atomScale,n[20]=e.up[0],n[21]=e.up[1],n[22]=e.up[2],n[23]=0,n[24]=r[0],n[25]=r[1],n[26]=r[2],n[27]=0,n[28]=this.params.box[0],n[29]=this.params.box[1],n[30]=this.params.box[2],n[31]=0,this.device.queue.writeBuffer(this.cameraBuffer,0,t)}ensureDepth(){let e=this.canvas.width,t=this.canvas.height;this.depthTexture&&this.depthSize.w===e&&this.depthSize.h===t||(this.depthTexture?.destroy(),this.depthTexture=this.device.createTexture({size:{width:e,height:t},format:`depth24plus`,usage:GPUTextureUsage.RENDER_ATTACHMENT}),this.depthSize={w:e,h:t})}async readbackPositions(){return this.readback(this.posBuffer)}async readbackVelocities(){return this.readback(this.velBuffer)}async readbackReactiveBondPairs(){let e=this.device.createBuffer({size:16,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ}),t=this.device.createCommandEncoder();t.copyBufferToBuffer(this.reactiveCountBuffer,0,e,0,16),this.device.queue.submit([t.finish()]),await e.mapAsync(GPUMapMode.READ);let n=new Uint32Array(e.getMappedRange().slice(0));e.unmap(),e.destroy();let r=Math.min(this.maxReactiveBonds,n[0]??0);if(r<=0)return new Uint32Array;let i=r*16,a=this.device.createBuffer({size:i,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ}),o=this.device.createCommandEncoder();o.copyBufferToBuffer(this.reactiveBondsBuffer,0,a,0,i),this.device.queue.submit([o.finish()]),await a.mapAsync(GPUMapMode.READ);let s=new Uint32Array(a.getMappedRange().slice(0));a.unmap(),a.destroy();let c=new Uint32Array(r*2),l=0;for(let e=0;e<r;e++){let t=s[e*4+0],n=s[e*4+1];t===4294967295||n===4294967295||t>=this.numAtoms||n>=this.numAtoms||t===n||(c[l*2+0]=t,c[l*2+1]=n,l++)}return c.slice(0,l*2)}async readback(e){let t=this.numAtoms*16,n=this.device.createBuffer({size:t,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ}),r=this.device.createCommandEncoder();r.copyBufferToBuffer(e,0,n,0,t),this.device.queue.submit([r.finish()]),await n.mapAsync(GPUMapMode.READ);let i=new Float32Array(n.getMappedRange().slice(0));return n.unmap(),n.destroy(),i}destroy(){this.depthTexture?.destroy(),this.posBuffer?.destroy(),this.velBuffer?.destroy(),this.forceBuffer?.destroy(),this.atomParamsBuffer?.destroy(),this.reductionBuffer?.destroy(),this.uniformBuffer?.destroy(),this.cameraBuffer?.destroy(),this.vizUniformBuffer?.destroy(),this.molRangesBuffer?.destroy(),this.molBondsBuffer?.destroy(),this.molAnglesBuffer?.destroy(),this.reactiveBondsBuffer?.destroy(),this.reactiveCountBuffer?.destroy(),this.atomBondCountsBuffer?.destroy(),this.reactiveProposalBuffer?.destroy(),this.segCountBuffer?.destroy(),this.segPairsBuffer?.destroy(),this.cellHeadBuffer?.destroy(),this.cellAtomsBuffer?.destroy(),this.device?.destroy()}},Fn=class{constructor(e){this.rebuildInterval=20,this.stepsSinceRebuild=0,this.enabled=!1}shouldRebuild(){return this.enabled?this.stepsSinceRebuild>=this.rebuildInterval?(this.stepsSinceRebuild=0,!0):(this.stepsSinceRebuild++,!1):!1}},In=class{constructor(e){this.config=e}update(e){this.config=e}get enabled(){return this.config.thermostatEnabled}static temperatureFrom(e){let t=e.length/4,n=0;for(let r=0;r<t;r++){let t=e[r*4+0],i=e[r*4+1],a=e[r*4+2],o=e[r*4+3];n+=o*(t*t+i*i+a*a)}let r=Math.max(1,3*t-3);return n/(r*Ot)}},Ln=15,Rn={[z.H.id]:{maxBonds:1,covalentRadius:.031},[z.C.id]:{maxBonds:4,covalentRadius:.076},[z.O.id]:{maxBonds:2,covalentRadius:.066},[z.N.id]:{maxBonds:3,covalentRadius:.071},[z.Cl.id]:{maxBonds:1,covalentRadius:.102},[z.Br.id]:{maxBonds:1,covalentRadius:.12}},zn=1.25,Bn=class{constructor(e){this.params=null,this.runtime=null,this.neighborList=null,this.thermostat=null,this.running=!1,this.loopActive=!1,this.rafHandle=0,this.cameraProvider=null,this.statsListener=null,this.structureListener=null,this.lastFrameTime=0,this.fps=0,this.framesSinceSample=0,this.framesSinceStructureSample=0,this.temperature=NaN,this.sampling=!1,this.structureSampling=!1,this.simulatedTimePs=0,this.atomTypeIds=null,this.staticBonds=[],this.loop=()=>{if(!this.loopActive||!this.runtime)return;let e=performance.now(),t=e-this.lastFrameTime;this.lastFrameTime=e,this.running&&t>0&&(this.fps=.9*this.fps+1e3/t*.1),this.running&&(this.neighborList?.shouldRebuild(),this.backend.stepSimulation(this.runtime.stepsPerFrame),this.simulatedTimePs+=this.runtime.stepsPerFrame*this.params.dt,this.maybeSampleTemperature(),this.maybeSampleStructures(),this.emitStats()),this.cameraProvider&&this.backend.render(this.cameraProvider()),this.rafHandle=requestAnimationFrame(this.loop)},this.backend=e}setCameraProvider(e){this.cameraProvider=e}setStatsListener(e){this.statsListener=e}setStructureListener(e){this.structureListener=e}async start(e,t,n,r){this.params=e,this.runtime=r,this.atomTypeIds=t.atomTypeIds.slice(),this.staticBonds=t.bonds.slice(),this.neighborList=new Fn(e),this.thermostat=new In(r),await this.backend.initialize(e,t,n,r),this.backend.setThermostat(r.targetTemperature,r.thermostatEnabled),this.backend.setForceGuard(r.forceGuardEnabled),this.backend.setReactiveBonding(r.reactiveBondingEnabled),this.backend.setCutoffRadius(r.cutoffRadius),this.backend.setBoundaryMode(r.boundaryMode),this.temperature=NaN,this.framesSinceSample=0,this.framesSinceStructureSample=0,this.simulatedTimePs=0,this.structureSampling=!1,this.structureListener&&this.atomTypeIds&&this.structureListener(this.buildStructureSummary(e.numAtoms,this.atomTypeIds,this.staticBonds,new Uint32Array)),this.loopActive=!0,this.running=!0,this.lastFrameTime=performance.now(),this.loop()}setRuntime(e){this.runtime=e,this.thermostat?.update(e),this.backend.setThermostat(e.targetTemperature,e.thermostatEnabled),this.backend.setForceGuard(e.forceGuardEnabled),this.backend.setReactiveBonding(e.reactiveBondingEnabled),this.backend.setCutoffRadius(e.cutoffRadius),this.backend.setBoundaryMode(e.boundaryMode)}setViewOptions(e){this.backend.setViewOptions(e)}pause(){this.running=!1}resume(){this.running||!this.params||(this.running=!0,this.lastFrameTime=performance.now())}get isRunning(){return this.running}async snapshotAtomState(){if(!this.params)return null;let[e,t]=await Promise.all([this.backend.readbackPositions(),this.backend.readbackVelocities()]);return{positions:e,velocities:t,numAtoms:this.params.numAtoms,simulatedTimePs:this.simulatedTimePs}}restoreSimulatedTime(e){this.simulatedTimePs=Math.max(0,e)}destroy(){this.loopActive=!1,this.running=!1,cancelAnimationFrame(this.rafHandle),this.backend.destroy()}maybeSampleTemperature(){this.sampling||!this.params||++this.framesSinceSample<30||(this.framesSinceSample=0,this.sampling=!0,this.backend.readbackVelocities().then(e=>{this.temperature=In.temperatureFrom(e)}).finally(()=>{this.sampling=!1}))}maybeSampleStructures(){this.structureSampling||!this.params||!this.atomTypeIds||!this.structureListener||++this.framesSinceStructureSample<Ln||(this.framesSinceStructureSample=0,this.structureSampling=!0,Promise.all([this.backend.readbackReactiveBondPairs().catch(()=>new Uint32Array),this.backend.readbackPositions().catch(()=>null)]).then(([e,t])=>{let n=e;this.runtime?.reactiveBondingEnabled&&t&&n.length===0&&(n=this.inferReactivePairsFromPositions(t,this.atomTypeIds,this.staticBonds,this.params));let r=this.buildStructureSummary(this.params.numAtoms,this.atomTypeIds,this.staticBonds,n);this.structureListener?.(r)}).finally(()=>{this.structureSampling=!1}))}inferReactivePairsFromPositions(e,t,n,r){let i=r.numAtoms,a=new Set,o=new Uint8Array(i);for(let e of n){let t=Math.min(e.i,e.j),n=Math.max(e.i,e.j);a.add(`${t}:${n}`),e.i>=0&&e.i<i&&o[e.i]++,e.j>=0&&e.j<i&&o[e.j]++}let s=[];for(let n=0;n<i;n++){let c=Rn[t[n]];if(!(!c||o[n]>=c.maxBonds))for(let l=n+1;l<i;l++){let i=Rn[t[l]];if(!i||o[l]>=i.maxBonds||a.has(`${n}:${l}`))continue;let u=e[n*4+0]-e[l*4+0],d=e[n*4+1]-e[l*4+1],f=e[n*4+2]-e[l*4+2];(this.runtime?.boundaryMode===`periodic`||this.runtime?.boundaryMode===`open-top`)&&(u-=r.box[0]*Math.round(u/r.box[0]),f-=r.box[2]*Math.round(f/r.box[2]),this.runtime?.boundaryMode===`periodic`&&(d-=r.box[1]*Math.round(d/r.box[1])));let p=u*u+d*d+f*f;if(p<1e-10)continue;let m=c.covalentRadius+i.covalentRadius,h=m*zn;p>h*h||s.push({i:n,j:l,score:p/(m*m)})}}s.sort((e,t)=>e.score-t.score);let c=[];for(let e of s){let n=Rn[t[e.i]],r=Rn[t[e.j]];!n||!r||o[e.i]>=n.maxBonds||o[e.j]>=r.maxBonds||(o[e.i]++,o[e.j]++,c.push(e.i,e.j))}return Uint32Array.from(c)}buildStructureSummary(e,t,n,r){let i=new Int32Array(e),a=new Uint8Array(e);for(let t=0;t<e;t++)i[t]=t;let o=e=>{let t=e;for(;i[t]!==t;)t=i[t];for(;i[e]!==e;){let n=i[e];i[e]=t,e=n}return t},s=(e,t)=>{let n=o(e),r=o(t);if(n!==r){if(a[n]<a[r]){let e=n;n=r,r=e}i[r]=n,a[n]===a[r]&&a[n]++}};for(let t of n)t.i>=0&&t.i<e&&t.j>=0&&t.j<e&&s(t.i,t.j);for(let t=0;t+1<r.length;t+=2){let n=r[t],i=r[t+1];n<e&&i<e&&s(n,i)}let c=new Map;for(let e of Object.values(z))c.set(e.id,e.symbol);let l=new Map;for(let n=0;n<e;n++){let e=o(n),r=c.get(t[n])??`?`,i=l.get(e);i?i.set(r,(i.get(r)??0)+1):l.set(e,new Map([[r,1]]))}let u=new Map,d=new Map;for(let e of l.values()){let t=this.formatFormula(e);u.set(t,(u.get(t)??0)+1);let n=[...e.values()].reduce((e,t)=>e+t,0);d.set(t,n>1?`molecule`:`atom`)}return[...u.entries()].map(([e,t])=>({name:e,count:t,kind:d.get(e)??`atom`})).sort((e,t)=>t.count-e.count||e.name.localeCompare(t.name))}formatFormula(e){let t=[...e.keys()],n=e.has(`C`),r=[];if(n){r.push(`C`),e.has(`H`)&&r.push(`H`);for(let e of t.filter(e=>e!==`C`&&e!==`H`).sort((e,t)=>e.localeCompare(t)))r.push(e)}else r.push(...t.sort((e,t)=>e.localeCompare(t)));let i=``;for(let t of r){let n=e.get(t)??0;n<=0||(i+=t,n>1&&(i+=String(n)))}return i||`?`}emitStats(){!this.statsListener||!this.params||this.statsListener({fps:this.fps,numAtoms:this.params.numAtoms,temperature:this.temperature,simulatedTimePs:this.simulatedTimePs})}},Vn=class{constructor(e){this.target=[1,1,1],this.distance=5,this.azimuth=.6,this.elevation=.4,this.projection=`perspective`,this.dragging=!1,this.lastX=0,this.lastY=0,this.canvas=e,this.attachControls(),this.resize()}frameBox(e){this.target=[e[0]/2,e[1]/2,e[2]/2],this.distance=Math.max(e[0],e[1],e[2])*1.8}setProjection(e){this.projection=e}getProjection(){return this.projection}snapToAxis(e){let t=Math.PI/2-.001;switch(e){case`+x`:this.azimuth=0,this.elevation=0;break;case`-x`:this.azimuth=Math.PI,this.elevation=0;break;case`+z`:this.azimuth=t,this.elevation=0;break;case`-z`:this.azimuth=-t,this.elevation=0;break;case`+y`:this.elevation=t;break;case`-y`:this.elevation=-t;break}}getBasis(){let e=this.computeEye(),{right:t,up:n}=qn(e,this.target,[0,1,0]);return{right:t,up:n,forward:Gn(Un(this.target,e))}}computeEye(){let e=Math.cos(this.elevation);return[this.target[0]+this.distance*e*Math.cos(this.azimuth),this.target[1]+this.distance*Math.sin(this.elevation),this.target[2]+this.distance*e*Math.sin(this.azimuth)]}resize(){let e=Math.min(window.devicePixelRatio||1,2),t=Math.max(1,Math.floor(this.canvas.clientWidth*e)),n=Math.max(1,Math.floor(this.canvas.clientHeight*e));(this.canvas.width!==t||this.canvas.height!==n)&&(this.canvas.width=t,this.canvas.height=n)}getCamera(){this.resize();let e=this.canvas.width/this.canvas.height,{view:t,right:n,up:r}=qn(this.computeEye(),this.target,[0,1,0]),i;if(this.projection===`perspective`)i=Yn(45*Math.PI/180,e,.02,1e3);else{let t=this.distance*.5,n=t*e;i=Jn(-n,n,-t,t,.05,1e3)}return{viewProj:Xn(i,t),right:n,up:r}}attachControls(){this.canvas.addEventListener(`pointerdown`,e=>{this.dragging=!0,this.lastX=e.clientX,this.lastY=e.clientY,this.canvas.setPointerCapture(e.pointerId)}),this.canvas.addEventListener(`pointerup`,e=>{this.dragging=!1,this.canvas.releasePointerCapture(e.pointerId)}),this.canvas.addEventListener(`pointermove`,e=>{if(!this.dragging)return;let t=e.clientX-this.lastX,n=e.clientY-this.lastY;if(this.lastX=e.clientX,this.lastY=e.clientY,e.shiftKey){let e=qn(this.computeEye(),this.target,[0,1,0]),r=this.distance*.0018;this.target=[this.target[0]-e.right[0]*t*r+e.up[0]*n*r,this.target[1]-e.right[1]*t*r+e.up[1]*n*r,this.target[2]-e.right[2]*t*r+e.up[2]*n*r]}else this.azimuth+=t*.01,this.elevation=Hn(this.elevation+n*.01,-1.5,1.5)}),this.canvas.addEventListener(`wheel`,e=>{e.preventDefault();let t=Math.exp(e.deltaY*.001);this.distance=Hn(this.distance*t,.5,200)},{passive:!1})}};function Hn(e,t,n){return Math.min(n,Math.max(t,e))}function Un(e,t){return[e[0]-t[0],e[1]-t[1],e[2]-t[2]]}function Wn(e,t){return[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]]}function Gn(e){let t=Math.hypot(e[0],e[1],e[2])||1;return[e[0]/t,e[1]/t,e[2]/t]}function Kn(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]}function qn(e,t,n){let r=Gn(Un(t,e)),i=Gn(Wn(r,n)),a=Wn(i,r),o=new Float32Array(16);return o[0]=i[0],o[1]=a[0],o[2]=-r[0],o[3]=0,o[4]=i[1],o[5]=a[1],o[6]=-r[1],o[7]=0,o[8]=i[2],o[9]=a[2],o[10]=-r[2],o[11]=0,o[12]=-Kn(i,e),o[13]=-Kn(a,e),o[14]=Kn(r,e),o[15]=1,{view:o,right:i,up:a}}function Jn(e,t,n,r,i,a){let o=new Float32Array(16);return o[0]=2/(t-e),o[5]=2/(r-n),o[10]=1/(i-a),o[12]=-(t+e)/(t-e),o[13]=-(r+n)/(r-n),o[14]=i/(i-a),o[15]=1,o}function Yn(e,t,n,r){let i=1/Math.tan(e/2),a=new Float32Array(16);return a[0]=i/t,a[5]=i,a[10]=r/(n-r),a[11]=-1,a[14]=n*r/(n-r),a}function Xn(e,t){let n=new Float32Array(16);for(let r=0;r<4;r++)for(let i=0;i<4;i++){let a=0;for(let n=0;n<4;n++)a+=e[n*4+i]*t[r*4+n];n[r*4+i]=a}return n}var Zn={[z.H.id]:{maxBonds:1,covalentRadius:.031,bondStiffness:12e4},[z.C.id]:{maxBonds:4,covalentRadius:.076,bondStiffness:16e4},[z.O.id]:{maxBonds:2,covalentRadius:.066,bondStiffness:17e4},[z.N.id]:{maxBonds:3,covalentRadius:.071,bondStiffness:155e3},[z.Cl.id]:{maxBonds:1,covalentRadius:.102,bondStiffness:11e4},[z.Br.id]:{maxBonds:1,covalentRadius:.12,bondStiffness:9e4}},Qn=.65,$n=1.5;function er(e,t){let n=Math.max(0,Math.round(t)),r=[];if(e.kind===`molecule`&&e.molecule)for(let t=0;t<n;t++)r.push({kind:`molecule`,tmpl:e.molecule,nn:e.nn});else if(e.kind===`ionic`){let[t,i]=e.elements;for(let a=0;a<n;a++)r.push({kind:`mono`,el:t,nn:e.nn}),r.push({kind:`mono`,el:i,nn:e.nn})}else{let t=e.elements[0];for(let i=0;i<n;i++)r.push({kind:`mono`,el:t,nn:e.nn})}return r}function tr(e){let t=e.map(e=>e.length),n=Array(e.length).fill(0),r=t.reduce((e,t)=>e+t,0),i=[];for(let a=0;a<r;a++){let r=-1,a=-1/0;for(let i=0;i<e.length;i++){if(n[i]>=t[i])continue;let e=t[i]===0?-1/0:n[i]/t[i];-e>a&&(a=-e,r=i)}i.push(e[r][n[r]]),n[r]++}return i}function nr(e){let t=e>>>0;return()=>{t|=0,t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function rr(e){return()=>{let t=0,n=0;for(;t===0;)t=e();for(;n===0;)n=e();return Math.sqrt(-2*Math.log(t))*Math.cos(2*Math.PI*n)}}function ir(e,t){let[n,r,i]=e.box,a=[];for(let t of e.components){let e=It[t.materialKey];if(!e)continue;let n=er(e,t.count);n.length>0&&a.push(n)}let o=tr(a);o.length===0&&o.push({kind:`mono`,el:z.Ar,nn:z.Ar.sigma});let s=0,c=0,l=0;for(let e of o)e.kind===`molecule`?(s+=e.tmpl.sites.length,l++):c++;let u=s+c,d=new Float32Array(u*4),f=new Float32Array(u*4),p=new Float32Array(u*4),m=new Int32Array(u),h=new Int32Array(u),g=[],_=[],v=[],y=[],b=nr(2654435769),x=rr(b),S=ar(o,e.box,b),C=0,w=s,T=0,E=0,ee=new Map;for(let e=0;e<o.length;e++){let t=o[e],[a,s,c]=S[e];if(t.kind===`molecule`){let e=t.tmpl,o=C;C+=e.sites.length;let l=E++,u=lr(x);for(let t=0;t<e.sites.length;t++){let g=e.sites[t],_=o+t;ee.set(g.el.id,g.el);let v=ur(u,g.pos);or(d,_,J(a+v[0],n),J(s+v[1],r),J(c+v[2],i),Tt(g)),sr(p,_,Et(g),Dt(g),l,g.el.id),f[_*4+3]=g.el.mass,m[_]=g.el.id,h[_]=l}let v=g.length;for(let t of e.bonds)g.push({i:o+t.a,j:o+t.b,r0:t.r0,k:t.k});let b=_.length;for(let t of e.angles)_.push({i:o+t.a,j:o+t.b,k:o+t.c,theta0:t.theta0,kTheta:t.k});y.push(v,e.bonds.length,b,e.angles.length),T++}else{let e=t.el,o=E++,l=w++;ee.set(e.id,e),or(d,l,J(a,n),J(s,r),J(c,i),e.charge),sr(p,l,e.sigma,e.epsilon,o,e.id),f[l*4+3]=e.mass,m[l]=e.id,h[l]=o}}dr(d,p,h,e.box);let te=fr(d,m,h,p,g,_,y,E,e.box);cr(f,e.temperature,x);let D={atomTypes:[...ee.values()].map(e=>({name:e.symbol,mass:e.mass,charge:e.charge,sigma:e.sigma,epsilon:e.epsilon})),atomTypeIds:m,moleculeIds:h,bonds:g,angles:_,dihedrals:v,molRanges:new Uint32Array(y.length>0?y:[0,0,0,0])};return{params:{dt:e.dt,numAtoms:u,numMolecules:l+te,cutoffRadius:t,box:[n,r,i],coulombConstant:kt},topology:D,initial:{positions:d,velocities:f,atomParams:p}}}function J(e,t){return(e%t+t)%t}function ar(e,t,n){let[r,i,a]=t,o=e.length,s=r*i*a,c=Math.cbrt(s/Math.max(1,o)),l=Math.max(1,Math.round(r/c)),u=Math.max(1,Math.round(i/c)),d=Math.max(1,Math.round(a/c));for(;l*u*d<o;){let e=r/l,t=i/u,n=a/d;e>=t&&e>=n?l++:t>=n?u++:d++}let f=r/l,p=i/u,m=a/d,h=e.reduce((e,t)=>Math.max(e,t.nn),0),g=Math.max(0,(f-h)/2)*.95,_=Math.max(0,(p-h)/2)*.95,v=Math.max(0,(m-h)/2)*.95,y=Array(l*u*d);for(let e=0;e<y.length;e++)y[e]=e;for(let e=y.length-1;e>0;e--){let t=Math.floor(n()*(e+1)),r=y[e];y[e]=y[t],y[t]=r}let b=[];for(let e=0;e<o;e++){let t=y[e],r=t%l,i=Math.floor(t/l)%u,a=Math.floor(t/(l*u));b.push([(r+.5)*f+(n()*2-1)*g,(i+.5)*p+(n()*2-1)*_,(a+.5)*m+(n()*2-1)*v])}return b}function or(e,t,n,r,i,a){e[t*4+0]=n,e[t*4+1]=r,e[t*4+2]=i,e[t*4+3]=a}function sr(e,t,n,r,i,a){e[t*4+0]=n,e[t*4+1]=r,e[t*4+2]=i,e[t*4+3]=a}function cr(e,t,n){let r=e.length/4,i=0,a=0,o=0,s=0;for(let c=0;c<r;c++){let r=e[c*4+3],l=Math.sqrt(Ot*t/r),u=l*n(),d=l*n(),f=l*n();e[c*4+0]=u,e[c*4+1]=d,e[c*4+2]=f,i+=r*u,a+=r*d,o+=r*f,s+=r}let c=i/s,l=a/s,u=o/s;for(let t=0;t<r;t++)e[t*4+0]-=c,e[t*4+1]-=l,e[t*4+2]-=u}function lr(e){let t=e(),n=e(),r=e(),i=Math.hypot(t,n,r)||1;t/=i,n/=i,r/=i;let a=2*Math.PI*(.5*(e()+1)),o=Math.cos(a),s=Math.sin(a),c=1-o;return[c*t*t+o,c*t*n-s*r,c*t*r+s*n,c*t*n+s*r,c*n*n+o,c*n*r-s*t,c*t*r-s*n,c*n*r+s*t,c*r*r+o]}function ur(e,t){return[e[0]*t[0]+e[1]*t[1]+e[2]*t[2],e[3]*t[0]+e[4]*t[1]+e[5]*t[2],e[6]*t[0]+e[7]*t[1]+e[8]*t[2]]}function dr(e,t,n,r){let i=n.length;if(i<2)return;let a=0;for(let e=0;e<i;e++)n[e]>a&&(a=n[e]);let o=a+1,s=new Float32Array(o*3),c=new Int32Array(o),l=i>3500?2:5;for(let a=0;a<l;a++){s.fill(0),c.fill(0);let a=0;for(let o=0;o<i;o++){let l=n[o],u=e[o*4+0],d=e[o*4+1],f=e[o*4+2],p=t[o*4+0];for(let m=o+1;m<i;m++){let i=n[m];if(l===i)continue;let o=t[m*4+0],h=Math.max(.08,.55*(p+o)),g=u-e[m*4+0],_=d-e[m*4+1],v=f-e[m*4+2];g-=r[0]*Math.round(g/r[0]),_-=r[1]*Math.round(_/r[1]),v-=r[2]*Math.round(v/r[2]);let y=g*g+_*_+v*v;if(y>=h*h)continue;a++;let b=Math.sqrt(Math.max(y,1e-12)),x=1/b,S=(h-b)*.5*.7,C=g*x*S,w=_*x*S,T=v*x*S;s[l*3+0]+=C,s[l*3+1]+=w,s[l*3+2]+=T,c[l]++,s[i*3+0]-=C,s[i*3+1]-=w,s[i*3+2]-=T,c[i]++}}if(a===0)break;for(let t=0;t<i;t++){let i=n[t],a=c[i];a!==0&&(e[t*4+0]=J(e[t*4+0]+s[i*3+0]/a,r[0]),e[t*4+1]=J(e[t*4+1]+s[i*3+1]/a,r[1]),e[t*4+2]=J(e[t*4+2]+s[i*3+2]/a,r[2]))}}}function fr(e,t,n,r,i,a,o,s,c){let l=t.length;if(l<2)return 0;let u=new Uint8Array(l);for(let e of i)e.i>=0&&e.i<l&&u[e.i]++,e.j>=0&&e.j<l&&u[e.j]++;let d=new Uint8Array(l),f=new Float32Array(l),p=new Float32Array(l),m=new Uint8Array(l);for(let e=0;e<l;e++){let n=Zn[t[e]];n&&(d[e]=n.maxBonds,f[e]=n.covalentRadius,p[e]=n.bondStiffness,u[e]===0&&(m[e]=1))}let h=[];for(let t=0;t<l;t++){if(m[t]===0||d[t]===0)continue;let r=e[t*4+0],i=e[t*4+1],a=e[t*4+2];for(let o=t+1;o<l;o++){if(m[o]===0||d[o]===0||n[t]===n[o])continue;let s=r-e[o*4+0],l=i-e[o*4+1],u=a-e[o*4+2];s-=c[0]*Math.round(s/c[0]),l-=c[1]*Math.round(l/c[1]),u-=c[2]*Math.round(u/c[2]);let p=s*s+l*l+u*u;if(p<1e-10)continue;let g=f[t]+f[o];if(g<=0)continue;let _=g*Qn,v=g*$n;if(p<_*_||p>v*v)continue;let y=Math.sqrt(p);h.push({i:t,j:o,distance:y,score:y/g})}}if(h.length===0)return 0;h.sort((e,t)=>e.score-t.score);let g=new Int32Array(l),_=new Uint8Array(l);for(let e=0;e<l;e++)g[e]=e;let v=e=>{let t=e;for(;g[t]!==t;)t=g[t];for(;g[e]!==e;){let n=g[e];g[e]=t,e=n}return t},y=(e,t)=>{let n=v(e),r=v(t);if(n!==r){if(_[n]<_[r]){let e=n;n=r,r=e}g[r]=n,_[n]===_[r]&&_[n]++}};for(let e of i)y(e.i,e.j);let b=u.slice(),x=[];for(let e of h){if(b[e.i]>=d[e.i]||b[e.j]>=d[e.j])continue;let t=f[e.i]+f[e.j],n=Math.max(t*.95,e.distance*.98),r=Math.sqrt(p[e.i]*p[e.j]);x.push({i:e.i,j:e.j,r0:n,k:r}),b[e.i]++,b[e.j]++,y(e.i,e.j)}if(x.length===0)return 0;let S=new Map,C=new Uint8Array(l);for(let e of x){let t=v(e.i);if(t===v(e.j)){if(!C[e.i]){C[e.i]=1;let n=S.get(t);n?n.push(e.i):S.set(t,[e.i])}if(!C[e.j]){C[e.j]=1;let n=S.get(t);n?n.push(e.j):S.set(t,[e.j])}}}let w=new Map;for(let e of x){let t=v(e.i),n=w.get(t);n?n.push(e):w.set(t,[e])}let T=0,E=s;for(let[e,t]of w){let s=S.get(e);if(!s||s.length===0)continue;let c=E++;for(let e of s)n[e]=c,r[e*4+2]=c;let l=i.length;for(let e of t)i.push({i:e.i,j:e.j,r0:e.r0,k:e.k});o.push(l,t.length,a.length,0),T++}return T}function pr(e){if(!e||typeof e!=`object`)return!1;let t=e;return!(t.version!==1||!hr(t.config)||t.atomState!==void 0&&!mr(t.atomState)||t.projection!==void 0&&t.projection!==`orthographic`&&t.projection!==`perspective`)}function mr(e){if(!e||typeof e!=`object`)return!1;let t=e;return!(typeof t.numAtoms!=`number`||t.numAtoms<1||typeof t.simulatedTimePs!=`number`||!Array.isArray(t.positions)||!Array.isArray(t.velocities)||t.positions.length!==t.velocities.length||t.positions.length!==t.numAtoms*4||t.positions.length%4!=0||!t.positions.every(e=>typeof e==`number`)||!t.velocities.every(e=>typeof e==`number`))}function hr(e){if(!e||typeof e!=`object`)return!1;let t=e;if(!Array.isArray(t.components)||!Array.isArray(t.box)||t.box.length!==3||typeof t.dt!=`number`||typeof t.temperature!=`number`)return!1;for(let e of t.components){if(!e||typeof e!=`object`)return!1;let t=e;if(typeof t.materialKey!=`string`||typeof t.count!=`number`)return!1}return t.box.every(e=>typeof e==`number`)}var Y=document.querySelector(`sim-app`),X=null,Z=null,gr=!1,Q={...H},$={...Bt},_r=`perspective`,vr=null,yr=[];Y.stepsPerFrame=Q.stepsPerFrame,Y.boundaryMode=Q.boundaryMode,Y.targetTemperature=Q.targetTemperature,Y.thermostatEnabled=Q.thermostatEnabled,Y.forceGuardEnabled=Q.forceGuardEnabled,Y.reactiveBondingEnabled=Q.reactiveBondingEnabled,Y.cutoffRadius=Q.cutoffRadius,Y.basisProvider=()=>Z?.getBasis()??null;async function br(e,t){if(!gr){gr=!0;try{X?.destroy(),await Y.updateComplete;let n=Y.canvas;Z=new Vn(n),Z.frameBox(e.box),Z.setProjection(_r),X=new Bn(new Pn(n)),X.setCameraProvider(()=>Z.getCamera()),X.setStatsListener(e=>{Y.stats=e}),X.setStructureListener(e=>{yr=e,Y.legendEntries=e});let{params:r,topology:i,initial:a}=ir(e,Q.cutoffRadius);if(t){let e=r.numAtoms*4;if(t.numAtoms!==r.numAtoms)throw Error(`Saved atom state does not match the current configuration (atom count mismatch).`);if(t.positions.length!==e||t.velocities.length!==e)throw Error(`Saved atom state has invalid array sizes.`);a.positions=new Float32Array(t.positions),a.velocities=new Float32Array(t.velocities)}let o={...H,...Q,targetTemperature:e.temperature};Q=o,Y.stepsPerFrame=Q.stepsPerFrame,Y.boundaryMode=Q.boundaryMode,Y.targetTemperature=Q.targetTemperature,Y.thermostatEnabled=Q.thermostatEnabled,Y.forceGuardEnabled=Q.forceGuardEnabled,Y.reactiveBondingEnabled=Q.reactiveBondingEnabled,Y.cutoffRadius=Q.cutoffRadius,await X.start(r,i,a,o),t&&X.restoreSimulatedTime(t.simulatedTimePs),X.setViewOptions($),vr=Sr(e),Y.activeConfig=Sr(e),Y.legendEntries=yr,Y.running=!0}catch(e){console.error(`Simulation failed to start:`,e),xr(e)}finally{gr=!1}}}Y.addEventListener(`config-change`,e=>{br(e.detail)}),Y.addEventListener(`file-save`,async()=>{if(!vr)return;let e=await X?.snapshotAtomState(),t=e?{numAtoms:e.numAtoms,simulatedTimePs:e.simulatedTimePs,positions:Array.from(e.positions),velocities:Array.from(e.velocities)}:void 0,n={version:1,savedAt:new Date().toISOString(),config:Sr(vr),atomState:t,runtime:{...Q},view:{...$},projection:_r},r=JSON.stringify(n,null,2),i=new Blob([r],{type:`application/json`}),a=URL.createObjectURL(i),o=document.createElement(`a`);o.href=a,o.download=`simulation-${new Date().toISOString().replaceAll(`:`,`-`)}.json`,o.click(),URL.revokeObjectURL(a)}),Y.addEventListener(`file-load`,e=>{let t=e.detail;if(!pr(t)){xr(`Invalid simulation file format`);return}t.runtime&&(Q={...Q,...t.runtime},Y.stepsPerFrame=Q.stepsPerFrame,Y.boundaryMode=Q.boundaryMode,Y.targetTemperature=Q.targetTemperature,Y.thermostatEnabled=Q.thermostatEnabled,Y.forceGuardEnabled=Q.forceGuardEnabled,Y.reactiveBondingEnabled=Q.reactiveBondingEnabled,Y.cutoffRadius=Q.cutoffRadius,X?.setRuntime(Q)),t.view&&($={...$,...t.view},X?.setViewOptions($)),t.projection&&(_r=t.projection,Z?.setProjection(_r)),br(t.config,t.atomState)}),Y.addEventListener(`file-load-error`,e=>{let t=e.detail;xr(`Could not read simulation file: ${t}`)}),Y.addEventListener(`runtime-change`,e=>{let t=e.detail;Q={...Q,...t},Y.stepsPerFrame=Q.stepsPerFrame,Y.boundaryMode=Q.boundaryMode,Y.targetTemperature=Q.targetTemperature,Y.thermostatEnabled=Q.thermostatEnabled,Y.forceGuardEnabled=Q.forceGuardEnabled,Y.reactiveBondingEnabled=Q.reactiveBondingEnabled,Y.cutoffRadius=Q.cutoffRadius,X?.setRuntime(Q)}),Y.addEventListener(`view-change`,e=>{$={...$,...e.detail},X?.setViewOptions($)}),Y.addEventListener(`camera-axis`,e=>{Z?.snapToAxis(e.detail)}),Y.addEventListener(`projection-change`,e=>{_r=e.detail,Z?.setProjection(_r)}),Y.addEventListener(`toggle-run`,()=>{X&&(X.isRunning?(X.pause(),Y.running=!1):(X.resume(),Y.running=!0))}),window.addEventListener(`resize`,()=>Z?.resize());function xr(e){let t=e instanceof Error?e.message:String(e),n=document.createElement(`div`);n.textContent=`Could not start the simulation: ${t}`,n.style.cssText=`position:fixed;bottom:16px;left:16px;right:16px;padding:12px 16px;background:#3a1d1d;color:#ffd7d7;border:1px solid #6b2b2b;border-radius:8px;font-family:system-ui;z-index:10`,document.body.appendChild(n)}function Sr(e){return{components:e.components.map(e=>({...e})),box:[e.box[0],e.box[1],e.box[2]],dt:e.dt,temperature:e.temperature}}