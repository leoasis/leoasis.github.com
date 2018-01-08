webpackJsonp([86227130285851],{373:function(n,a){n.exports={data:{site:{siteMetadata:{title:"Lenny's Blog",url:"https://leoasis.github.io"}},markdownRemark:{id:"/Users/lenny/dev/leoasis.github.io/blog/src/pages/2017-06-26-reparenting-a-component/index.md absPath of file >>> MarkdownRemark",html:'<p>When working with React, we almost never have to think about the underlying <a href="https://facebook.github.io/react/docs/reconciliation.html">reconciliation algorithm</a> that calculates the update to the DOM. It just works: we write our components with the UI logic inside the render function, handle events and perform state changes, and bam!, we’re done. If we’re working with arrays, the reconciliation algorithm may ask us to provide the <code>key</code> attribute, but that’s okay when you <a href="https://facebook.github.io/react/docs/lists-and-keys.html">understand how keys work</a>.</p>\n<p>In most cases, especially if the data is flowing exclusively via props, it doesn’t matter if we’re updating a component or mounting a new one. Since the data to render is all provided to the component, the final result will be the same if the component got updated, or if React had to mount it because it wasn’t there.</p>\n<p>But there are cases where the reconciliation becomes a leaky abstraction. If we’re relying on the component’s local state for something, or if we’re dealing with state that lives in the DOM (like selection state inside form inputs), then it <em>does</em> matter if we’re updating a component or creating a new one, because that would mean we will <em>retain</em> that internal state, or wipe it and start with a fresh one.</p>\n<p>So why a leaky abstraction? That’s because you need to know <em>when</em> React will decide to mount or update a component. To know a bit more about it, I suggest you to <a href="TODO">read the documentation about the heuristics inside the reconciliation algorithm</a>. Two important ones relevant to this post are:</p>\n<ol>\n<li>React will unmount the old tree of components and remount a new one if the new root of the tree is of a different type than the previous one.</li>\n<li>Keys to assign identity to a component while diffing is only supported locally (i.e. inside a component’s render function) for siblings, but it’s not able to identify and “reparent” between completely different nodes in the component tree.</li>\n</ol>\n<p>In my particular use case, I had a panel that collapsed or expanded showing some items depending on the page where it was rendered. But that panel was nested in a component that would become unmounted whenever the page changed, because the component type was already different a couple of levels above in the tree, making the reconciliation algorithm wipe the subtree and create a new one with the component with the new type as a root.</p>\n<p>That collapse and expansion was done with an animation whenever we detected the component’s children <em>changed</em>, so I needed to have a way to detect that change. But since the component was being unmounted and remounted, the animation never triggered, as the state never technically changed.</p>\n<p>Ideally, that could have been solved by designing the component tree so that the reconciliation worked <em>with</em> us (instead of against us). For example, if this panel lived in a sidebar that is shown in both pages, a valid solution would have been to move that sidebar component to a layout component, and only re-render the main content whenever the url changes. That way, the sidebar would be updated and not remounted because the parents’ types would be the same.</p>\n<p>That may have been an option in my particular case, even though we didn’t go with it for other reasons. But anyway, I believe there are plenty of valid use cases where doing that is not possible, at least not easily. In those cases, you need to resort to other solutions.</p>\n<p>So I tried to make reparenting work. This is what I came up with to solve it, I will explain what’s going on below, but here is the code:</p>\n<div class="gatsby-highlight">\n      <pre class="language-jsx"><code><span class="token keyword">import</span> React<span class="token punctuation">,</span> <span class="token punctuation">{</span> Component <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">\'react\'</span><span class="token punctuation">;</span>\n<span class="token keyword">import</span> PropTypes <span class="token keyword">from</span> <span class="token string">\'proptypes\'</span><span class="token punctuation">;</span>\n<span class="token keyword">import</span> ReactDOM <span class="token keyword">from</span> <span class="token string">\'react-dom\'</span><span class="token punctuation">;</span>\n\n<span class="token keyword">const</span> store <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">;</span>\n\n<span class="token keyword">function</span> <span class="token function">getMountNode</span><span class="token punctuation">(</span>uid<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>store<span class="token punctuation">[</span>uid<span class="token punctuation">]</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    store<span class="token punctuation">[</span>uid<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token punctuation">{</span>\n      mountNode<span class="token punctuation">:</span> document<span class="token punctuation">.</span><span class="token function">createElement</span><span class="token punctuation">(</span><span class="token string">\'div\'</span><span class="token punctuation">)</span><span class="token punctuation">,</span>\n      inUse<span class="token punctuation">:</span> <span class="token boolean">true</span>\n    <span class="token punctuation">}</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>\n    store<span class="token punctuation">[</span>uid<span class="token punctuation">]</span><span class="token punctuation">.</span>inUse <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n\n  <span class="token keyword">return</span> store<span class="token punctuation">[</span>uid<span class="token punctuation">]</span><span class="token punctuation">.</span>mountNode<span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n\n<span class="token keyword">function</span> <span class="token function">removeMountNode</span><span class="token punctuation">(</span>uid<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">const</span> record <span class="token operator">=</span> store<span class="token punctuation">[</span>uid<span class="token punctuation">]</span><span class="token punctuation">;</span>\n\n  record<span class="token punctuation">.</span>inUse <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>\n\n  <span class="token function">setTimeout</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span>\n    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>store<span class="token punctuation">[</span>uid<span class="token punctuation">]</span><span class="token punctuation">.</span>inUse<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n      ReactDOM<span class="token punctuation">.</span><span class="token function">unmountComponentAtNode</span><span class="token punctuation">(</span>store<span class="token punctuation">[</span>uid<span class="token punctuation">]</span><span class="token punctuation">.</span>mountNode<span class="token punctuation">)</span><span class="token punctuation">;</span>\n      <span class="token keyword">delete</span> store<span class="token punctuation">[</span>uid<span class="token punctuation">]</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n  <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n\n<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token keyword">class</span> <span class="token class-name">Reparentable</span> <span class="token keyword">extends</span> <span class="token class-name">Component</span> <span class="token punctuation">{</span>\n  <span class="token keyword">static</span> propTypes <span class="token operator">=</span> <span class="token punctuation">{</span>\n    uid<span class="token punctuation">:</span> PropTypes<span class="token punctuation">.</span>string<span class="token punctuation">.</span>isRequired<span class="token punctuation">,</span>\n    children<span class="token punctuation">:</span> PropTypes<span class="token punctuation">.</span>element<span class="token punctuation">.</span>isRequired\n  <span class="token punctuation">}</span>\n\n  <span class="token function">componentDidMount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">const</span> mountNode <span class="token operator">=</span> <span class="token function">getMountNode</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>uid<span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token keyword">this</span><span class="token punctuation">.</span>el<span class="token punctuation">.</span><span class="token function">appendChild</span><span class="token punctuation">(</span>mountNode<span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n    <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">renderChildrenIntoNode</span><span class="token punctuation">(</span>mountNode<span class="token punctuation">)</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n\n  <span class="token function">componentDidUpdate</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">const</span> mountNode <span class="token operator">=</span> <span class="token function">getMountNode</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>uid<span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function">renderChildrenIntoNode</span><span class="token punctuation">(</span>mountNode<span class="token punctuation">)</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n\n  <span class="token function">componentWillUnmount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token function">removeMountNode</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>uid<span class="token punctuation">)</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n\n  <span class="token function">renderChildrenIntoNode</span><span class="token punctuation">(</span>node<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token comment">// We use this instead of `render` because this also handles</span>\n    <span class="token comment">// passing the context</span>\n    ReactDOM<span class="token punctuation">.</span><span class="token function">unstable_renderSubtreeIntoContainer</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">,</span> <span class="token keyword">this</span><span class="token punctuation">.</span>props<span class="token punctuation">.</span>children<span class="token punctuation">,</span> node<span class="token punctuation">)</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n\n  <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">return</span> <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">ref</span><span class="token script language-javascript"><span class="token punctuation">=</span><span class="token punctuation">{</span><span class="token punctuation">(</span>el<span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token punctuation">{</span> <span class="token keyword">this</span><span class="token punctuation">.</span>el <span class="token operator">=</span> el<span class="token punctuation">;</span> <span class="token punctuation">}</span><span class="token punctuation">}</span></span><span class="token punctuation">></span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n</code></pre>\n      </div>\n<p>And to use it, you need to wrap the component that can be reparented in this <code>Reparentable</code> component, in all the places where it should be rendered, like this:</p>\n<div class="gatsby-highlight">\n      <pre class="language-jsx"><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span><span class="token punctuation">></span></span>\n  <span class="token punctuation">{</span><span class="token keyword">this</span><span class="token punctuation">.</span>state<span class="token punctuation">.</span>showingPage <span class="token operator">===</span> <span class="token string">\'page1\'</span> <span class="token operator">&amp;&amp;</span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>Page1</span><span class="token punctuation">></span></span>\n      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>Reparentable</span> <span class="token attr-name">uid</span><span class="token attr-value"><span class="token punctuation">=</span><span class="token punctuation">"</span>1<span class="token punctuation">"</span></span><span class="token punctuation">></span></span>\n        <span class="token operator">&lt;</span>FooComponent <span class="token punctuation">{</span>…someProps<span class="token punctuation">}</span> <span class="token operator">/</span><span class="token operator">></span>\n      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>Reparentable</span><span class="token punctuation">></span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>Page1</span><span class="token punctuation">></span></span><span class="token punctuation">}</span>\n  <span class="token punctuation">{</span><span class="token keyword">this</span><span class="token punctuation">.</span>state<span class="token punctuation">.</span>showingPage <span class="token operator">===</span> <span class="token string">\'page2\'</span> <span class="token operator">&amp;&amp;</span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>Page2</span><span class="token punctuation">></span></span>\n      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>Reparentable</span> <span class="token attr-name">uid</span><span class="token attr-value"><span class="token punctuation">=</span><span class="token punctuation">"</span>1<span class="token punctuation">"</span></span><span class="token punctuation">></span></span>\n        <span class="token operator">&lt;</span>FooComponent <span class="token punctuation">{</span>…someOtherProps<span class="token punctuation">}</span> <span class="token operator">/</span><span class="token operator">></span>\n      <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>Reparentable</span><span class="token punctuation">></span></span>\n    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>Page2</span><span class="token punctuation">></span></span><span class="token punctuation">}</span>\n<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">></span></span>\n</code></pre>\n      </div>\n<p>Thanks to React’s nice API, the way to use this component is still pretty straightforward. There’s nothing more than rendering components and passing props.</p>\n<p>So let’s talk about what’s going on in the implementation of that component. The trick of all this is to <em>keep the references of the DOM nodes</em> that React uses to render a component and then call <code>ReactDOM.render</code> on them, so that React updates whatever instance was previously rendered in those nodes.</p>\n<p>The <code>Reparentable</code> component renders a single div, to which we attach a ref to hold on to the DOM element instance. Then in the <code>componentDidMount</code> and <code>componentDidUpdate</code> lifecycle hooks, we get (or create if it doesn’t exist yet) a DOM node based on the <code>uid</code> prop we received, append it to our div if we didn’t already, and tell React to render the children into that DOM node. If the <code>uid</code> is the same, the DOM node we get will be the same, so rendering into the same DOM node will make React perform the reconciliation there. Since we are rendering the same type of element, the component will be <em>updated</em> by React instead of mounted.</p>\n<p>When the <code>Reparentable</code> component unmounts, it will remove the DOM node we were using to render the children, but we’ll still keep the reference around in a global object. Notice that we don’t unmount the React instance in that node yet. We wait a bit for that, in case another <code>Reparentable</code> component attempts to use it (by rendering with the same <code>ui</code> prop). If that happens, we will keep the DOM node reference around since it was claimed. If that doesn’t happen, then we effectively unmount the React instance in that node and we remove the reference so that it can be garbage collected by the JS runtime.</p>\n<p>Because we don’t unmount the instance if it gets used by another <code>Reparentable</code> instance, we effectively reparented the DOM node and the instance, and the next time it receives a render, it will update the instance, instead of mounting it.</p>\n<p>One more thing to notice is that the example is using <code>ReactDOM.unstable_renderSubtreeIntoContainer</code> instead of <code>ReactDOM.render</code>. This is because the former allows to propagate the <code>context</code> into that subtree, which is not possible if we called <code>ReactDOM.render</code>, since it assumes we want to render a completely isolated tree. The fact that the name contains <code>unstable</code> in it should be enough warning not to use it, but there is no other way to achieve this context propagation as far as I know. Maybe this method will become stable in a future version of React, or a better solution will be available.</p>\n<p>Here is an example of how you see it in action:</p>\n<p><img src="/reparenting-a-component-4a8a47c8fb4bf616190ea2d2fca4f6c2.gif" alt="Reparenting a component"></p>\n<p>Notice how the state is preserved (the click count and the text inside the input) when switching pages, which is destroying the entire tree for the old page and creating the tree for the new page.</p>\n<h2>Problems</h2>\n<p>As you may imagine, no solution is perfect, and actually this solution has a couple of important problems. One problem is that it relies on the user assigning unique global <code>uid</code>s. If you ever render two <code>Reparentable</code> components at the same time with the same <code>uid</code>, the last one to mount will steal the DOM node from the other one, which is surely not what you want.</p>\n<p>Another problem is the hacky way we have to know if the DOM node is going to be reparented: we keep the node alive for some time (in our case, we wait until the next event loop tick), and after that we unmount and remove the reference. But the truth is that we can never be sure if the node is going to be used again at any point in the future. So waiting “for a bit” is not reliable.</p>\n<p>If you are interested in this problem, and similar related problems, I suggest you to go to this thread and read it:</p>\n<p><a href="https://gist.github.com/chenglou/34b155691a6f58091953">https://gist.github.com/chenglou/34b155691a6f58091953</a></p>\n<p>There are some great ideas on how to solve this problem properly in that thread, and I hope that at some point those ideas become useful to bake a reparenting solution right inside React in the future.</p>\n<p>This solution worked well for us, it’s far from perfect, but at least shows the idea behind reusing nodes with React instances mounted on them to support reparenting.</p>\n<p>Hope you find this useful! If you had a similar problem and you solved it differently, be sure to leave a comment or tweet to me and share your approach.</p>',frontmatter:{title:"Reparenting a Component",date:"June 26, 2017"}}},pathContext:{path:"/reparenting-a-component"}}}});
//# sourceMappingURL=path---posts-2017-6-26-reparenting-a-component-b273c9187dd9286ebb10.js.map