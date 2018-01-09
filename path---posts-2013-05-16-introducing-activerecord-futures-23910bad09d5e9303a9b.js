webpackJsonp([0x719384539f89],{370:function(e,a){e.exports={data:{site:{siteMetadata:{title:"Lenny's Blog",url:"https://leoasis.github.io"}},markdownRemark:{id:"/Users/lenny/dev/leoasis.github.io/src/pages/2013-05-16-activerecord-futures/index.md absPath of file >>> MarkdownRemark",html:'<p>I’m back! Long time no see!</p>\n<p>I’ve been in a mix of lazyness, busy, short on ideas to post, and waiting to finish some projects I’ve been working on.</p>\n<p>This is one of them. I’ve released a gem and reached a feature-enough state, enough at least to write a post about it. The idea grew from past experience with .NET and NHibernate, and trying to find something similar in the Ruby world, especially in the Rails world.</p>\n<p>If you don’t want to read the story and motivation of it, and just want to rush to the code, here it is:</p>\n<p><a href="https://github.com/leoasis/activerecord-futures">https://github.com/leoasis/activerecord-futures</a></p>\n<h2>The Problem</h2>\n<p>What I wanted to tackle with this gem was the fact that most performance problems in any web application are due to IO. Especially database IO. As you may already know, reading from disk or from the network are costly operations. And if you have your database in a separate server, which you should in production, you have both!</p>\n<p>Also, if database access is done synchronously, it will block, wasting precious time that you could be using to do other stuff. Well, you know, you could access asynchronously, and have all IO access non blocking. But I am talking about Rails here, so let’s stick with blocking access.</p>\n<p>So the first thing you should try to do is have the least number of queries per request you can have. Trying to eagerly include associations when you know that you will need them right away, avoid select n + 1, caching, and all that stuff. Those tips are vital to increasing the performance of our app, but still, there’s more you can do.</p>\n<p>It’s a very common thing to need several queries to fulfill a request. And they are not always solvable eagerly including associations, since those queries do not always involve associations. For example, say you want to have a list of articles that is paginated. You would do something like this:</p>\n<div class="gatsby-highlight">\n      <pre class="language-ruby"><code><span class="token comment"># inside an action in a controller...</span>\npage_size <span class="token operator">=</span> <span class="token number">20</span>\npage_start <span class="token operator">=</span> <span class="token punctuation">(</span>params<span class="token punctuation">[</span><span class="token symbol">:page</span><span class="token punctuation">]</span> <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">*</span> page_size\n<span class="token variable">@articles</span> <span class="token operator">=</span> <span class="token constant">Article</span><span class="token punctuation">.</span><span class="token function">order</span><span class="token punctuation">(</span><span class="token symbol">:name</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">limit</span><span class="token punctuation">(</span>page_size<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">offset</span><span class="token punctuation">(</span>page_start<span class="token punctuation">)</span>\n<span class="token variable">@articles_count</span> <span class="token operator">=</span> <span class="token constant">Article</span><span class="token punctuation">.</span>count\n</code></pre>\n      </div>\n<p>Of course, you are using a gem to paginate, and not doing this manually. I did this to show you more explicitly that pagination involves always two queries to the database. Well, you might say that there’s no way to reduce those 2 queries any further, and you’d be right. You <em>DO</em> need those 2 queries. But do you need to go <em>twice</em> to the database and ask for a single query each time? No! we could issue both queries in a single round trip, using multiple statements.</p>\n<p>Before going further with this, let’s see another example. Suppose you are now diplaying the index page of a marketplace, where you see the newest articles, the top shoppers, the top purchased categories and interesting articles based on your previous purchases. You may have something like this:</p>\n<div class="gatsby-highlight">\n      <pre class="language-ruby"><code><span class="token variable">@newest_articles</span> <span class="token operator">=</span> <span class="token constant">Article</span><span class="token punctuation">.</span><span class="token function">order</span><span class="token punctuation">(</span><span class="token string">"published_at desc"</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">limit</span><span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">)</span>\n<span class="token variable">@top_shoppers</span> <span class="token operator">=</span> <span class="token constant">User</span><span class="token punctuation">.</span><span class="token function">order</span><span class="token punctuation">(</span><span class="token string">"purchase_count desc"</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">limit</span><span class="token punctuation">(</span><span class="token number">5</span><span class="token punctuation">)</span>\n<span class="token variable">@top_categories</span> <span class="token operator">=</span> <span class="token constant">Category</span><span class="token punctuation">.</span>most_purchased\n<span class="token variable">@interesting_articles</span> <span class="token operator">=</span> <span class="token constant">Article</span><span class="token punctuation">.</span><span class="token function">interesting_for</span><span class="token punctuation">(</span>current_user<span class="token punctuation">)</span>\n</code></pre>\n      </div>\n<p>Here you see again that we cannot reduce the query amount any further, since that is exactly the info that we need to show. Still, we’re making 4 database round trips, without counting the potential extra one for <code>current_user</code>. We can do better than that!</p>\n<h2>The Solution</h2>\n<p>Meet <a href="https://github.com/leoasis/activerecord-futures">ActiveRecord::Futures</a>.</p>\n<p>This gem extends ActiveRecord by allowing it to do just that: batch queries in a single round trip to the database. It makes use of multiple statements, which is simply sending a set of queries in a single text command, and receiving a response that is the set of results of those queries. Internally the gem multiplexes the results to the corresponding places.</p>\n<p>Using the future pattern, you build up your relation with the conditions that you need, and before retrieving the result, you tell it that you want a “future value”, that is, a value that you will use later on. Let’s use the pagination example for this. This is how you would rewrite it:</p>\n<div class="gatsby-highlight">\n      <pre class="language-ruby"><code><span class="token comment"># inside an action in a controller...</span>\npage_size <span class="token operator">=</span> <span class="token number">20</span>\npage_start <span class="token operator">=</span> <span class="token punctuation">(</span>params<span class="token punctuation">[</span><span class="token symbol">:page</span><span class="token punctuation">]</span> <span class="token operator">-</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token operator">*</span> page_size\n<span class="token variable">@articles</span> <span class="token operator">=</span> <span class="token constant">Article</span><span class="token punctuation">.</span><span class="token function">order</span><span class="token punctuation">(</span><span class="token symbol">:name</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">limit</span><span class="token punctuation">(</span>page_size<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">offset</span><span class="token punctuation">(</span>page_start<span class="token punctuation">)</span><span class="token punctuation">.</span>future\n<span class="token variable">@articles_count</span> <span class="token operator">=</span> <span class="token constant">Article</span><span class="token punctuation">.</span>future_count<span class="token punctuation">.</span>value\n</code></pre>\n      </div>\n<p>Notice the <code>future</code> and <code>future_count.value</code> changes? Let’s see what this does. The <code>future</code> call tells the relation that you want the result from the query it builds, but not yet. It enqueues the query in a list, waiting to be sent when it really needs to. <code>future_count</code> does something similar. But instead of equeuing the query of the relation, it enqueues the <code>count</code> of it.</p>\n<p>Now here comes the important part. When we call <code>value</code> on the object returned from <code>future_count</code>, we are now saying that we want the result <em>now</em>. We are triggering the future. And when that happens, all the queued queries will be sent at once to the database, then received at once after the <em>single round trip</em>, and sent back to the respective futures. So <code>value</code> will return the result of the count query, and enumerating  the <code>@articles</code> (or calling <code>to_a</code>) will return the array of articles. One thing to note here is that when we do the latter action, <em>no query will be sent</em>, since the result is already there, it came from the previous action.</p>\n<p>This is what we gain. Same amount of queries, less round trips to the database. Nice, isn’t it?</p>\n<p>That’s the idea behind <a href="https://github.com/leoasis/activerecord-futures">ActiveRecord::Futures</a>. If you want to see more, just go to the <a href="https://github.com/leoasis/activerecord-futures">Github repo</a> and check the Readme.</p>\n<p>See ya!</p>',frontmatter:{title:"Introducing ActiveRecord Futures",date:"May 16, 2013"}}},pathContext:{path:"/introducing-activerecord-futures"}}}});
//# sourceMappingURL=path---posts-2013-05-16-introducing-activerecord-futures-23910bad09d5e9303a9b.js.map