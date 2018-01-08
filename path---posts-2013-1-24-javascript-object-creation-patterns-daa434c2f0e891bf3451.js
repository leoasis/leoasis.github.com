webpackJsonp([0x8faa3d6904ac],{368:function(n,s){n.exports={data:{site:{siteMetadata:{title:"Lenny's Blog",url:"https://leoasis.github.io"}},markdownRemark:{id:"/Users/lenny/dev/leoasis.github.io/src/pages/2013-01-24-javascript-object-creation-patterns/index.md absPath of file >>> MarkdownRemark",html:'<p>I’m writing this post because my folks at work thought it might be helpful, since not all of the devs out there are familiar with the way that Javascript objects and prototypes work.</p>\n<p>These concepts are basic for all Javascript developers, and by basic I mean that in the way of “building the basis for the rest of the concepts you’ll learn in Javascript”, and not the “it’s sooo trivial, how can’t you know that?” meaning.</p>\n<p>This is the summary of the patterns I’ll cover:</p>\n<ol>\n<li>Object literal</li>\n<li>Function that returns an object</li>\n<li>Constructor function</li>\n<li>Constructor function with prototype</li>\n<li>Object.create</li>\n</ol>\n<h2>Object literal</h2>\n<p>This is the most used pattern. It’s just defining the properties of an object between curly braces. That’s it.\nYou can create one time objects by using the object literal and assigning the properties and methods you need.</p>\n<div class="gatsby-highlight">\n      <pre class="language-js"><code><span class="token keyword">var</span> guy <span class="token operator">=</span> <span class="token punctuation">{</span>\n  name<span class="token punctuation">:</span> <span class="token string">"John"</span><span class="token punctuation">,</span>\n  awesome<span class="token punctuation">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>\n  aboutMe<span class="token punctuation">:</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">.</span>awesome <span class="token operator">?</span> <span class="token string">"I\'m awesome!"</span> <span class="token punctuation">:</span> <span class="token string">"I\'m lame :("</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span><span class="token punctuation">;</span>\n</code></pre>\n      </div>\n<p>The good thing about this pattern is its simplicity. Just create an object right away and start using it. The bad thing is that it is explicit: you need to specify each and every property that the object has, there is no “class” already defined elsewhere that you can just use to create an instance with.</p>\n<p>This pattern is mostly suitable for creating one time objects, singleton objects, or objects that act as hashes.\nIt is not good for creating multiple similar objects, because by definition, this pattern is a one time creational one: you define the object and you get it built.</p>\n<h2>Function that returns an object</h2>\n<p>This patterns adds into the previous one, by encapsulating the object definition inside a function. It is just the factory method pattern.</p>\n<div class="gatsby-highlight">\n      <pre class="language-js"><code><span class="token keyword">function</span> <span class="token function">createGuy</span><span class="token punctuation">(</span>name<span class="token punctuation">,</span> awesome<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">function</span> <span class="token function">awesomeness</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">return</span> <span class="token string">"I\'m awesome!"</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n\n  <span class="token keyword">function</span> <span class="token function">lameness</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">return</span> <span class="token string">"I\'m lame :("</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n\n  <span class="token keyword">return</span> <span class="token punctuation">{</span>\n    name<span class="token punctuation">:</span> name<span class="token punctuation">,</span>\n    awesome<span class="token punctuation">:</span> awesome<span class="token punctuation">,</span>\n    aboutMe<span class="token punctuation">:</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n      <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">.</span>awesome <span class="token operator">?</span> <span class="token function">awesomeness</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">:</span> <span class="token function">lameness</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n  <span class="token punctuation">}</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n\n<span class="token keyword">var</span> guy <span class="token operator">=</span> <span class="token function">createGuy</span><span class="token punctuation">(</span><span class="token string">"John"</span><span class="token punctuation">,</span> <span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre>\n      </div>\n<p>This one is suitable for creating complex objects, and you don’t want the caller to know how it is built. It also adds a way to define “private” methods, by declaring them inside the scope of the factory function, which will not be visible outside that scope.</p>\n<p>As we’re creating a full blown new object each time we call the function, we have memory usage issues if we want to create a lot of “instances” (actually, to the engine they are independent objects that happen to have properties and functions that behave the same).</p>\n<h2>Constructor function</h2>\n<p>This pattern is similar to the previous one, but with some subtle differences. We don’t return the object anymore, in fact, the function itself doesn’t return anything. Also, we set the object-to-be-constructed’s properties by using <code>this</code>. There is also another difference in the caller, and it’s an important one: the function is called with a prefixed <code>new</code> operator. This indicates that we are using that function as a constructor. Basically what it does internally is creating a new object, making it accessible to the constructor via the <code>this</code> keyword, assigning the object’s <em>prototype</em> to the one pointed by the function’s <code>prototype</code> property, and returning it implicitly. We’ll see that thing about prototypes in the following pattern, so for now just look at this example:</p>\n<div class="gatsby-highlight">\n      <pre class="language-js"><code><span class="token keyword">function</span> <span class="token function">Guy</span><span class="token punctuation">(</span>name<span class="token punctuation">,</span> awesome<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n\n  <span class="token comment">// Some "private" methods</span>\n  <span class="token keyword">function</span> <span class="token function">awesomeness</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">return</span> <span class="token string">"I\'m awesome!"</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n\n  <span class="token keyword">function</span> <span class="token function">lameness</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">return</span> <span class="token string">"I\'m lame :("</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n\n  <span class="token keyword">this</span><span class="token punctuation">.</span>name <span class="token operator">=</span> name<span class="token punctuation">;</span>\n  <span class="token keyword">this</span><span class="token punctuation">.</span>awesome <span class="token operator">=</span> awesome<span class="token punctuation">;</span>\n  <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token function-variable function">aboutMe</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">.</span>awesome <span class="token operator">?</span> <span class="token function">awesomeness</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">:</span> <span class="token function">lameness</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n\n<span class="token keyword">var</span> guy <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Guy</span><span class="token punctuation">(</span><span class="token string">"John"</span><span class="token punctuation">,</span> <span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre>\n      </div>\n<p>As it is so similar to the previous pattern, it remains useful in the same scenarios or needs. As a drawback, you <em>have</em> to remember to call that function with the <code>new</code> operator. If you don’t, it will be treated as a regular function, and in regular functions <code>this</code> points to the global object, that is, <code>window</code> for browsers and <code>global</code> for nodejs.</p>\n<h2>Constructor function with prototype</h2>\n<p>This patterns makes use of the previously described <code>prototype</code> property from the function, to set the object’s <em>prototype</em> (note that I’m making a distinction here, since those two concepts, while related, are not the same).</p>\n<p>We could rewrite the previous example like this:</p>\n<div class="gatsby-highlight">\n      <pre class="language-js"><code><span class="token keyword">function</span> <span class="token function">Guy</span><span class="token punctuation">(</span>name<span class="token punctuation">,</span> awesome<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">this</span><span class="token punctuation">.</span>name <span class="token operator">=</span> name<span class="token punctuation">;</span>\n  <span class="token keyword">this</span><span class="token punctuation">.</span>awesome <span class="token operator">=</span> awesome<span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n\nGuy<span class="token punctuation">.</span>prototype<span class="token punctuation">.</span><span class="token function-variable function">aboutMe</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">.</span>awesome <span class="token operator">?</span> <span class="token string">"I\'m awesome!"</span> <span class="token punctuation">:</span> <span class="token string">"I\'m lame :("</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span><span class="token punctuation">;</span>\n\n<span class="token keyword">var</span> guy <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Guy</span><span class="token punctuation">(</span><span class="token string">"John"</span><span class="token punctuation">,</span> <span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre>\n      </div>\n<p>What’s the difference? Well to understand that, we need to know that in Javascript, every object has an internal property (not accessible, at least not in a standard way) that is the <em>prototype</em>. This <em>prototype</em> is another object, which will be used in the lookup chain for the methods being called in the object.\nAlso, a function (which is also an object in Javascript) contains a property called <code>prototype</code>, which is not the function’s <em>prototype</em>, but a special property that the engine uses when using the function as a constructor (using the <code>new</code> keyword) to assign the <em>prototype</em> to the newly created object.</p>\n<p>In the example, we’re constructing a new object, <code>guy</code>, that has a <em>prototype</em> which contains a method called <code>aboutMe</code>. With the lookup chain, we can call <code>guy.aboutMe()</code> and it will finally call the <em>prototype</em>’s method.</p>\n<p>So what’s the benefit of doing this? As you can see, we’re defining a set of methods and properties to be shared by the instances created using that constructor, just like in the patterns before, but in this case, this is <em>true</em> sharing: all the instances have a <em>prototype</em> which is the <em>same</em> object for all. In terms of performance, this is a huge win if we’re creating a lot of instances, since the methods and properties will be in just one object, and not copied all over the instances.</p>\n<p>One thing to emphasize here, is that the Function’s <code>prototype</code> property is a <em>reference</em> to the <em>prototypes</em> of the objects created by that function as a constructor. So as a reference, we can get access to it and modify it.</p>\n<p>Consider this code is after the code in the previous example:</p>\n<div class="gatsby-highlight">\n      <pre class="language-js"><code>Guy<span class="token punctuation">.</span>prototype<span class="token punctuation">.</span><span class="token function-variable function">aboutMe</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">return</span> <span class="token string">"I\'m beyond awesome!"</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span><span class="token punctuation">;</span>\n\nconsole<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>guy<span class="token punctuation">.</span><span class="token function">aboutMe</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre>\n      </div>\n<p>Here what we’re doing is changing a method of the object that is the <em>prototype</em> of <code>guy</code>. So now it is clear (perhaps not that clear?) that this code prints “I’m beyond awesome!”, because the aboutMe lookup goes up to the object’s <em>prototype</em> and finds the new aboutMe method (oh, now I got it).</p>\n<p>This example is somewhat different, consider that the previous code never happened, and instead this one did:</p>\n<div class="gatsby-highlight">\n      <pre class="language-js"><code>Guy<span class="token punctuation">.</span>prototype <span class="token operator">=</span> <span class="token punctuation">{</span>\n  aboutMe<span class="token punctuation">:</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">return</span> <span class="token string">"I\'m beyond awesome!"</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span><span class="token punctuation">;</span>\n\nconsole<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>guy<span class="token punctuation">.</span><span class="token function">aboutMe</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre>\n      </div>\n<p>Is this the same behavior as the example before? Not quite. If you look closer, you’ll see that what I just did was to change the function’s <code>prototype</code> <em>reference</em> to a new object. So what this means is that we don’t have a reference to the <em>prototype</em> of the instances created by the constructor anymore. This code will print “I’m awesome!”, and will ignore this new aboutMe method, because we never changed <code>guy</code>’s <em>prototype</em>.</p>\n<p>But if we had something like this <em>after</em> this previous example:</p>\n<div class="gatsby-highlight">\n      <pre class="language-js"><code><span class="token keyword">var</span> newGuy <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Guy</span><span class="token punctuation">(</span><span class="token string">"Larry"</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\nconsole<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>newGuy<span class="token punctuation">.</span><span class="token function">aboutMe</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre>\n      </div>\n<p>This will indeed call the new <code>aboutMe</code> method. Why? Because at the moment this instance was created, the function’s <code>prototype</code> was already the new one, so <code>newGuy</code> now has the <em>prototype</em> currently referenced by <code>Guy.prototype</code>, which is different than <code>guy</code>’s <em>prototype</em>.</p>\n<h3>Prototype chain</h3>\n<p>Remember that I said that the object’s <em>prototypes</em> are just objects? So this <em>prototype</em> could have its own <em>prototype</em> that in turn could have its own <em>prototype</em> and so on… This is what is called a <em>prototype chain</em>, which is essentially the lookup chain that the engine uses to find the code to execute upon a given call.</p>\n<p>This <em>prototype chain</em> is something like inheritance, since basically that is just a lookup chain to know which code to execute. So we could create a new constructor function that has its <code>prototype</code> be an object that has as <em>prototype</em> the <code>prototype</code> of <code>Guy</code>, so that the objects created with this constructor would “extend” <code>Guy</code>’s functionality:</p>\n<div class="gatsby-highlight">\n      <pre class="language-js"><code><span class="token keyword">function</span> <span class="token function">NewGuy</span><span class="token punctuation">(</span>name<span class="token punctuation">,</span> awesome<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">this</span><span class="token punctuation">.</span>name <span class="token operator">=</span> name<span class="token punctuation">;</span>\n  <span class="token keyword">this</span><span class="token punctuation">.</span>awesome <span class="token operator">=</span> awesome<span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n\nNewGuy<span class="token punctuation">.</span>prototype <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Guy</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">,</span> <span class="token keyword">null</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\nNewGuy<span class="token punctuation">.</span>prototype<span class="token punctuation">.</span><span class="token function-variable function">shout</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">return</span> <span class="token string">"Aaaaaaahhhh"</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n\n<span class="token keyword">var</span> john <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">NewGuy</span><span class="token punctuation">(</span><span class="token string">"New John"</span><span class="token punctuation">,</span> <span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\njohn<span class="token punctuation">.</span><span class="token function">aboutMe</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\njohn<span class="token punctuation">.</span><span class="token function">shout</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre>\n      </div>\n<p>Well, that works, but it is not pretty. First, we’re duplicating the constructor, and second, we’re creating a new <code>Guy</code> and passing null parameters (and this actually works because the constructor <code>Guy</code> does not play enough with the parameters to make all this explode with a null exception). There is a technique to fix this, that is used by many libraries that implement “class extension”, “class inheritance” and such. It’s something like this:</p>\n<div class="gatsby-highlight">\n      <pre class="language-js"><code><span class="token keyword">function</span> <span class="token function">NewGuy</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  Guy<span class="token punctuation">.</span><span class="token function">apply</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">,</span> arguments<span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n\n<span class="token keyword">var</span> <span class="token function-variable function">ctor</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span><span class="token punctuation">;</span> <span class="token comment">// empty constructor</span>\nctor<span class="token punctuation">.</span>prototype <span class="token operator">=</span> Guy<span class="token punctuation">.</span>prototype<span class="token punctuation">;</span>\n\nNewGuy<span class="token punctuation">.</span>prototype <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ctor</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\nNewGuy<span class="token punctuation">.</span>prototype<span class="token punctuation">.</span><span class="token function-variable function">shout</span> <span class="token operator">=</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  <span class="token keyword">return</span> <span class="token string">"Aaaaaaahhhh"</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n\n<span class="token keyword">var</span> john <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">NewGuy</span><span class="token punctuation">(</span><span class="token string">"New John"</span><span class="token punctuation">,</span> <span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\njohn<span class="token punctuation">.</span><span class="token function">aboutMe</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\njohn<span class="token punctuation">.</span><span class="token function">shout</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n</code></pre>\n      </div>\n<p>What did we do here? We’ll get to the constructor in a minute. Notice the <code>ctor</code> constructor function. It is an empty function, but we set its <code>prototype</code> property to the <code>Guy</code>’s one. So now if we create a new <code>ctor</code> instance, we’re going to have an empty object whose <em>prototype</em> is the same as the one we would get if we created an instance using the <code>Guy</code> constructor. That’s the key!</p>\n<p>As for the constructor, notice we’re just calling the <code>Guy</code> constructor and passing whatever arguments we get from outside. Notice here we didn’t call <code>Guy</code> with <code>new</code>, since that would create a new object, and what we want now is to get the same code executed when creating a <code>NewGuy</code> instance.</p>\n<h2>Object.create</h2>\n<p>Phewww that last one was pretty long. Got your breath back already? Good. One more to go!</p>\n<p>There is one more pattern, which is not available in all browsers (well, it IS in all browsers but IE &#x3C; 9). It goes like this:</p>\n<div class="gatsby-highlight">\n      <pre class="language-js"><code><span class="token keyword">var</span> guyPrototype <span class="token operator">=</span> <span class="token punctuation">{</span>\n  aboutMe<span class="token punctuation">:</span> <span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">.</span>awesome <span class="token operator">?</span> <span class="token string">"I\'m awesome!"</span> <span class="token punctuation">:</span> <span class="token string">"I\'m lame :("</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n<span class="token keyword">var</span> guy <span class="token operator">=</span> Object<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span>guyPrototype<span class="token punctuation">)</span><span class="token punctuation">;</span>\nguy<span class="token punctuation">.</span>name <span class="token operator">=</span> name<span class="token punctuation">;</span>\nguy<span class="token punctuation">.</span>awesome <span class="token operator">=</span> awesome<span class="token punctuation">;</span>\n</code></pre>\n      </div>\n<p>Here we’re doing something similar to the previous pattern. We’re creating objects that have a <em>prototype</em>. This time we do that differently, by using <code>Object.create</code>. What this does is another way to do what <code>new</code> does for constructor functions. You set the prototype object as the parameter of <code>Object.create</code> and it returns a new object whose <em>prototype</em> is that passed object.</p>\n<p>This pattern is useful for creating multiple instances from a prototype, just like the previous one. It is also easier to understand (once you get what this prototype fuzz is all about) than the <em>constructor</em> functions with <code>this</code> and the <code>new</code> keyword. Some people also like this more because it indicates more clearly the prototipal nature of Javascript.</p>\n<p>For the old IE lovers, you can get similar functionality by creating a shim of <code>Object.create</code> with this code (<a href="http://www.crockford.com">Crockford</a>’s example):</p>\n<div class="gatsby-highlight">\n      <pre class="language-js"><code><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> Object<span class="token punctuation">.</span>create <span class="token operator">!==</span> <span class="token string">"function"</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  Object<span class="token punctuation">.</span><span class="token function-variable function">create</span> <span class="token operator">=</span> <span class="token keyword">function</span> <span class="token punctuation">(</span>o<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">function</span> <span class="token function">F</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>\n    F<span class="token punctuation">.</span>prototype <span class="token operator">=</span> o<span class="token punctuation">;</span>\n    <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">F</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n</code></pre>\n      </div>\n<p>Or use this optimized version that reuses the constructor function:</p>\n<div class="gatsby-highlight">\n      <pre class="language-js"><code><span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">typeof</span> Object<span class="token punctuation">.</span>create <span class="token operator">!==</span> <span class="token string">"function"</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n  Object<span class="token punctuation">.</span>create <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">function</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n    <span class="token keyword">function</span> <span class="token function">F</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>\n    <span class="token keyword">return</span> <span class="token keyword">function</span> <span class="token punctuation">(</span>o<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n      F<span class="token punctuation">.</span>prototype <span class="token operator">=</span> o<span class="token punctuation">;</span>\n      <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">F</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span><span class="token punctuation">;</span>\n  <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n</code></pre>\n      </div>\n<p>Now that you understand how <code>new</code> works, I’ll let you understand this code as an exercise.</p>\n<p>This shim is not complete though. <code>Object.create</code> has an optional second parameter used to define the new object’s extra properties. Anyway, you can add that to your shim if you like, or just use it without this second parameter.</p>\n<h2>To sum up</h2>\n<p>We’ve covered different patterns for creating objects in Javascript. It’s important that you understand the pros and cons of each pattern, because none is pure evil or pure goodness, each pattern work in some cases, does not work in others, or is overkill for some other case. It is your job to use them wisely, with a fundamented reason.</p>\n<p>Hope this helped someone! You’re free to go or leave a comment, whatever you please :)</p>\n<p>See ya!</p>',
frontmatter:{title:"Javascript object creation patterns",date:"January 24, 2013"}}},pathContext:{path:"/javascript-object-creation-patterns"}}}});
//# sourceMappingURL=path---posts-2013-1-24-javascript-object-creation-patterns-daa434c2f0e891bf3451.js.map