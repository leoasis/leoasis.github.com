webpackJsonp([0x620f737b6699],{493:function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function u(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function l(e,t){var n={};for(var r in e)t.indexOf(r)>=0||Object.prototype.hasOwnProperty.call(e,r)&&(n[r]=e[r]);return n}function s(e,t){var n=t.onNewComment,r=t.language,o=l(t,["onNewComment","language"]);for(var a in o)e.page[a]=o[a];e.language=r,n&&(e.callbacks={onNewComment:[n]})}Object.defineProperty(t,"__esModule",{value:!0});var c=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},f=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),d=n(1),p=r(d),h=n(2),m=r(h),y=["shortname","identifier","title","url","category_id","onNewComment","language"],g=!1,b=function(e){function t(){return a(this,t),i(this,(t.__proto__||Object.getPrototypeOf(t)).apply(this,arguments))}return u(t,e),f(t,[{key:"componentDidMount",value:function(){this.loadDisqus()}},{key:"componentDidUpdate",value:function(){this.loadDisqus()}},{key:"shouldComponentUpdate",value:function(e,t){return e.identifier!==this.props.identifier}},{key:"render",value:function(){var e=this,t=Object.keys(this.props).reduce(function(t,n){return y.some(function(e){return e===n})?t:c({},t,o({},n,e.props[n]))},{});return p.default.createElement("div",t,p.default.createElement("div",{id:"disqus_thread"}))}},{key:"addDisqusScript",value:function(){if(!g){var e=this.disqus=document.createElement("script"),t=document.getElementsByTagName("head")[0]||document.getElementsByTagName("body")[0];e.async=!0,e.type="text/javascript",e.src="//"+this.props.shortname+".disqus.com/embed.js",t.appendChild(e),g=!0}}},{key:"loadDisqus",value:function(){var e=this,t={};y.forEach(function(n){"shortname"!==n&&e.props[n]&&(t[n]=e.props[n])}),"undefined"!=typeof DISQUS?DISQUS.reset({reload:!0,config:function(){s(this,t),this.page.url=this.page.url.replace(/#/,"")+"#!newthread"}}):(window.disqus_config=function(){s(this,t)},this.addDisqusScript())}}]),t}(p.default.Component);b.displayName="DisqusThread",b.propTypes={id:m.default.string,shortname:m.default.string.isRequired,identifier:m.default.string,title:m.default.string,url:m.default.string,category_id:m.default.string,onNewComment:m.default.func,language:m.default.string},b.defaultProps={url:"undefined"==typeof window?null:window.location.href},t.default=b},494:function(e,t,n){"use strict";e.exports=n(493)},199:function(e,t,n){(function(r){"use strict";function o(e){return e&&e.__esModule?e:{default:e}}function a(e){var t=e.siteUrl,n=e.pagePath;return r.createElement(l.default,{shortname:"leogcrespo",identifier:n,url:""+t+n})}t.__esModule=!0,t.default=a;var i=n(1),u=(o(i),n(494)),l=o(u);e.exports=t.default}).call(t,n(4))},74:function(e,t,n){(function(r){"use strict";function o(e){return e&&e.__esModule?e:{default:e}}function a(e){var t=e.children;return r.createElement("h1",{css:{margin:0}},t)}t.__esModule=!0,t.default=a;var i=n(1);o(i);e.exports=t.default}).call(t,n(4))},41:function(e,t,n){(function(r){"use strict";function o(e){return e&&e.__esModule?e:{default:e}}function a(e){var t=e.children;return r.createElement("p",{css:i({marginBottom:(0,s.rhythm)(.5),fontFamily:s.headerFontFamily},(0,s.scale)(.05),{color:l.gray50})},t)}t.__esModule=!0;var i=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e};t.default=a;var u=n(1),l=(o(u),n(21)),s=n(10);e.exports=t.default}).call(t,n(4))},206:function(e,t,n){(function(e){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function a(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function i(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}t.__esModule=!0,t.pageQuery=void 0;var u=n(1),l=r(u),s=n(71),c=r(s),f=n(39),d=(r(f),n(49)),p=r(d),h=n(74),m=r(h),y=n(41),g=r(y),b=n(199),v=r(b),_=(n(10),function(t){function n(){return o(this,n),a(this,t.apply(this,arguments))}return i(n,t),n.prototype.render=function(){var t=this.props.data.markdownRemark,n=(0,p.default)(this.props,"data.site.siteMetadata.title");return e.createElement("div",null,e.createElement(c.default,{title:t.frontmatter.title+" | "+n}),e.createElement(m.default,null,t.frontmatter.title),e.createElement(g.default,null,t.frontmatter.date),e.createElement("div",{dangerouslySetInnerHTML:{__html:t.html}}),e.createElement(v.default,{siteUrl:this.props.data.site.siteMetadata.url,pagePath:this.props.location.pathname}))},n}(l.default.Component));t.default=_;t.pageQuery="** extracted graphql fragment **"}).call(t,n(4))}});
//# sourceMappingURL=component---src-templates-blog-post-js-51c1f8067c000fca4219.js.map