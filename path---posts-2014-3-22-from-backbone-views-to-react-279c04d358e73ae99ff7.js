webpackJsonp([95793729785671],{371:function(e,t){e.exports={data:{site:{siteMetadata:{title:"Lenny's Blog",url:"https://leoasis.github.io"}},markdownRemark:{id:"/Users/lenny/dev/leoasis.github.io/src/pages/2014-03-22-from_backbone_views_to_react/index.md absPath of file >>> MarkdownRemark",html:'<p>Today I’d like to talk about why I happened to like React, or why I moved from using traditional Backbone views to React components. Well, not actually traditional Backbone views, since I used (actually still use) Marionette together with Handlebars templates and Rivets model binding, which happen to be a great combination, but the truth is that React changes the approach in such a way some problems just dissapear for the developer. In any case, I will share my usage of these other tools combined in a future post, since I think it’s worth sharing, but that’s for another day. Today, I’ll talk about React. With Backbone.</p>\n<h2>Backbone Views</h2>\n<p>If I had to suggest a guide to learn Backbone best practices, I’d suggest <a href="http://pragmatic-backbone.com">Pragmatic Backbone</a>. I’ve found a lot of gold there, and also validated a lot of other practices that I found were the best in my experience. However, there were some things about what is said there that I didn’t agree that much with. Hey, it’s a free world!</p>\n<p>Particularly, the <a href="http://pragmatic-backbone.com/views">views</a> section talks about a fact that made some noise to me when I first read it. It was about making sure that the only place to put any logic to manipulate the DOM should be placed in the <code>render</code> method. And more so, whenever anything changed that was of interest by the view, just re-render the view. Hey, that’s rather inefficient, isn’t it? Rewrite the whole view when I just need to modify a single span tag? And what about forms? Re-rendering would cause the focus to be lost, or some other state that was not yet transferred to the models. Then, the article continues to talk about adding conditional logic in the render method to try to only change what’s different. That would cause a lot of if-else statements, or, at least, a very large render method. Why not handle changes separately and just change what’s needed there? That’s how model binding libraries work anyway. And also, as I was using them, I didn’t have to actually write any code in the view, only add some attributes in the view’s template to mark those as bindable to the model’s properties. So as I didn’t have to write any additional code that manipulated the DOM, it was implicitly there, spread in a lot of listeners of properties and touching different parts of the view.</p>\n<p>But then, what’s the benefit of having just a single function to manipulate the DOM of any given view? Well, to start with, you have a method that whenever called will render the view in sync with the model it represents, it is a <em>complete</em> representation of the model state. Also, if the model state does not change, the render method will render the same thing always, so we can think of it as being a <em>pure function</em> with respect to the model state. And we get the benefits of having a <em>pure function</em>:</p>\n<ul>\n<li>easily testable due to it just being a matter of input/ouput expectations (no side effects),</li>\n<li>idempotent, so that it doesn’t matter if you call it once or many times with the same input, it will render the same thing,</li>\n<li>easily composable, since they are no more than functions that take some parameters and return some input, so we can build reusable pure functions to create a bigger pure function composed of those little ones,</li>\n<li>subject to optimization: if you reason about pure functions, there are a lot of things you can derive and apply to them, like memoization, paralellization, optimizing the order in which they are called, and more.</li>\n<li>declarative representation, since the composition of rendering functions of the internal components denote the actual thing we’re trying to render.</li>\n</ul>\n<p>What if you could take advantage of that and had this enforced directly so that you don’t have to be careful of not manipulating DOM outside the render method? And what if we could have all this and make it performant as well?</p>\n<h2>And then came React</h2>\n<p>It wasn’t the first time I saw React that it cliked me. As the docs say, give it five minutes. I started grasping the benefits of React while learning the design, the API, what it really provided. It’s not performance. At least, not ONLY performance. It’s a functional way to think about the UI, by thinking of components with a single render method that must be a pure function in terms of the components properties and state.</p>\n<p>And it turned out that while migrating some of the views I had with Marionette, Rivets and Handlebars, a lot of problems regarding model binding and synchronization just weren’t there, I could think about rendering the whole stuff always and React would then manage to optimally update the DOM.</p>\n<p>Let’s see a simple example in both ways to show you what this means:</p>\n<p>First for Backbone.View with Marionette and Rivets:</p>\n<script src="https://gist.github.com/leoasis/9701509.js?file=marionette_rivets.js"></script>\n<p>And now with React:</p>\n<script src="https://gist.github.com/leoasis/9701509.js?file=react.js"></script>\n<p>Notice that in the React version, we’re not using any plugin or library, just plain React and Backbone. Actually, the only thing we need is a small mixin to <code>forceUpdate</code> the component whenever any event happens in the model or collection. It’s really simple:</p>\n<script src="https://gist.github.com/leoasis/9701509.js?file=react_backbone.js"></script>\n<p>That’s it! You have a list of elements that updates whenever the collection or any item changes. To make a fair comparison, think of what Marionette and Rivets are doing internally listening to events in the models and collections. Now React allows us to completely remove that code and create components by thinking about what to render, not how, and that is by rendering everything into a Virtual DOM that can later be used to optimize the actual DOM manipulation.</p>\n<h2>Other benefits from React</h2>\n<p>We also have some secondary benefits of using a level of indirection when rendering the DOM. Since the Virtual DOM is just plain Javascript, it can be easily created on the server. And then we can calculate the first state of the entire DOM to generate the html for the page. We’d get server side rendering almost for free! We only need to send the same props to the client and make React do the DOM reconciliation to continue from what was rendered.</p>\n<h2>The End</h2>\n<p>Well, this is the story and the reasons why I started migrating my Backbone.Views into React components. This is a journey that I’ve just started, so I will keep posting my learnings along the way.</p>\n<p>Every day I’m more convinced that functional programming ideas are best to create simpler, more declarative, more correct, less buggy, less cumbersome code. Hope I sprinkled you with some functional powder and hope you start learning about it! Start with React!</p>',frontmatter:{title:"From Backbone Views To React",date:"March 22, 2014"}}},pathContext:{path:"/from-backbone-views-to-react"}}}});
//# sourceMappingURL=path---posts-2014-3-22-from-backbone-views-to-react-279c04d358e73ae99ff7.js.map