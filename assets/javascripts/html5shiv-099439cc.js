!function(t,e){function n(){var t=g.elements;return"string"==typeof t?t.split(" "):t}function i(t){var e=f[t[d]];return e||(e={},h++,t[d]=h,f[h]=e),e}function o(t,n,o){return n||(n=e),l?n.createElement(t):(o||(o=i(n)),n=o.cache[t]?o.cache[t].cloneNode():p.test(t)?(o.cache[t]=o.createElem(t)).cloneNode():o.createElem(t),n.canHaveChildren&&!u.test(t)?o.frag.appendChild(n):n)}function r(t,e){e.cache||(e.cache={},e.createElem=t.createElement,e.createFrag=t.createDocumentFragment,e.frag=e.createFrag()),t.createElement=function(n){return g.shivMethods?o(n,t,e):e.createElem(n)},t.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+n().join().replace(/\w+/g,function(t){return e.createElem(t),e.frag.createElement(t),'c("'+t+'")'})+");return n}")(g,e.frag)}function s(t){t||(t=e);var n=i(t);if(g.shivCSS&&!a&&!n.hasCSS){var o,s=t;o=s.createElement("p"),s=s.getElementsByTagName("head")[0]||s.documentElement,o.innerHTML="x<style>article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}mark{background:#FF0;color:#000}</style>",o=s.insertBefore(o.lastChild,s.firstChild),n.hasCSS=!!o}return l||r(t,n),t}var a,l,c=t.html5||{},u=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,p=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,d="_html5shiv",h=0,f={};!function(){try{var t=e.createElement("a");t.innerHTML="<xyz></xyz>",a="hidden"in t;var n;if(!(n=1==t.childNodes.length)){e.createElement("a");var i=e.createDocumentFragment();n="undefined"==typeof i.cloneNode||"undefined"==typeof i.createDocumentFragment||"undefined"==typeof i.createElement}l=n}catch(o){l=a=!0}}();var g={elements:c.elements||"abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",version:"3.6.2pre",shivCSS:!1!==c.shivCSS,supportsUnknownElements:l,shivMethods:!1!==c.shivMethods,type:"default",shivDocument:s,createElement:o,createDocumentFragment:function(t,o){if(t||(t=e),l)return t.createDocumentFragment();for(var o=o||i(t),r=o.frag.cloneNode(),s=0,a=n(),c=a.length;c>s;s++)r.createElement(a[s]);return r}};t.html5=g,s(e)}(this,document);