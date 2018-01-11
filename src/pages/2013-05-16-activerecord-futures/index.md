---
title: Introducing ActiveRecord Futures
date: "2013-05-16T22:12:03.284Z"
path: "/activerecord-futures"
---

I'm back! Long time no see!

I've been in a mix of lazyness, busy, short on ideas to post, and waiting to finish some projects I've been working on.

This is one of them. I've released a gem and reached a feature-enough state, enough at least to write a post about it. The idea grew from past experience with .NET and NHibernate, and trying to find something similar in the Ruby world, especially in the Rails world.

If you don't want to read the story and motivation of it, and just want to rush to the code, here it is:

[https://github.com/leoasis/activerecord-futures][gem]

## The Problem

What I wanted to tackle with this gem was the fact that most performance problems in any web application are due to IO. Especially database IO. As you may already know, reading from disk or from the network are costly operations. And if you have your database in a separate server, which you should in production, you have both!

Also, if database access is done synchronously, it will block, wasting precious time that you could be using to do other stuff. Well, you know, you could access asynchronously, and have all IO access non blocking. But I am talking about Rails here, so let's stick with blocking access.

So the first thing you should try to do is have the least number of queries per request you can have. Trying to eagerly include associations when you know that you will need them right away, avoid select n + 1, caching, and all that stuff. Those tips are vital to increasing the performance of our app, but still, there's more you can do.

It's a very common thing to need several queries to fulfill a request. And they are not always solvable eagerly including associations, since those queries do not always involve associations. For example, say you want to have a list of articles that is paginated. You would do something like this:

```ruby
# inside an action in a controller...
page_size = 20
page_start = (params[:page] - 1) * page_size
@articles = Article.order(:name).limit(page_size).offset(page_start)
@articles_count = Article.count
```

Of course, you are using a gem to paginate, and not doing this manually. I did this to show you more explicitly that pagination involves always two queries to the database. Well, you might say that there's no way to reduce those 2 queries any further, and you'd be right. You _DO_ need those 2 queries. But do you need to go _twice_ to the database and ask for a single query each time? No! we could issue both queries in a single round trip, using multiple statements.

Before going further with this, let's see another example. Suppose you are now diplaying the index page of a marketplace, where you see the newest articles, the top shoppers, the top purchased categories and interesting articles based on your previous purchases. You may have something like this:

```ruby
@newest_articles = Article.order("published_at desc").limit(10)
@top_shoppers = User.order("purchase_count desc").limit(5)
@top_categories = Category.most_purchased
@interesting_articles = Article.interesting_for(current_user)
```

Here you see again that we cannot reduce the query amount any further, since that is exactly the info that we need to show. Still, we're making 4 database round trips, without counting the potential extra one for `current_user`. We can do better than that!

## The Solution

Meet [ActiveRecord::Futures][gem].

This gem extends ActiveRecord by allowing it to do just that: batch queries in a single round trip to the database. It makes use of multiple statements, which is simply sending a set of queries in a single text command, and receiving a response that is the set of results of those queries. Internally the gem multiplexes the results to the corresponding places.

Using the future pattern, you build up your relation with the conditions that you need, and before retrieving the result, you tell it that you want a "future value", that is, a value that you will use later on. Let's use the pagination example for this. This is how you would rewrite it:

```ruby
# inside an action in a controller...
page_size = 20
page_start = (params[:page] - 1) * page_size
@articles = Article.order(:name).limit(page_size).offset(page_start).future
@articles_count = Article.future_count.value
```

Notice the `future` and `future_count.value` changes? Let's see what this does. The `future` call tells the relation that you want the result from the query it builds, but not yet. It enqueues the query in a list, waiting to be sent when it really needs to. `future_count` does something similar. But instead of equeuing the query of the relation, it enqueues the `count` of it.

Now here comes the important part. When we call `value` on the object returned from `future_count`, we are now saying that we want the result _now_. We are triggering the future. And when that happens, all the queued queries will be sent at once to the database, then received at once after the _single round trip_, and sent back to the respective futures. So `value` will return the result of the count query, and enumerating the `@articles` (or calling `to_a`) will return the array of articles. One thing to note here is that when we do the latter action, _no query will be sent_, since the result is already there, it came from the previous action.

This is what we gain. Same amount of queries, less round trips to the database. Nice, isn't it?

That's the idea behind [ActiveRecord::Futures][gem]. If you want to see more, just go to the [Github repo][gem] and check the Readme.

See ya!

[gem]: https://github.com/leoasis/activerecord-futures
