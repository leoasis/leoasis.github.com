---
title: GraphQL Persisted Documents
date: "2018-04-27T00:00:00.000Z"
path: "/graphql-persisted-documents"
---

A while ago I started introducing GraphQL at a project I was working at the time in my previous job. We were already applying some concepts without yet adopting it, but since those improved our codebase we decided to go all in and start using it so we could benefit from both the technology and its ecosystem.

We've learned a lot of things while implementing GraphQL in our app. But today I want to talk about one particular optimization we implemented that can improve a lot of the work done to run queries in production. I think it's a must for any serious GraphQL setup in production, and it's not hard to set up. That optimization is known as persisted queries or persisted documents, and I will be sharing our approach to it.

Let's first talk about how a GraphQL query travels from the client to a server and how it gets executed.

> Just a small side note, when I'm talking about _queries_ here, I'm really referring to any kind of GraphQL operation, which is not only queries, but also mutations and subscriptions.

In a typical GraphQL setup, we have a client crafting a query and sending it via HTTP to the server, with the payload of the request being the query text, along with the variables, if any. The server then receives that text, and parses it to extract an AST for the query, which is a structure (a plain object in Javascript) that allows to work with it in an easier way than just manipulating strings and searching within its contents. When that AST representation is created, it is then validated against the schema to verify that the query is actually something that can be answered. That is, the fields are correct, input types and fragment types match whatever is defined in the schema, and the query has all scalar leaf fields, among other things. Only after these things are done, the server proceeds to execute the query with its variables and send a response with the data that satisfies that query.

In most applications, the queries the app requests are fixed, they don't change. That is, by the time we deploy our application, only the queries that we explicitly coded ourselves are the ones that the app is going to perform. Unless you're dynamically crafting GraphQL queries, there will be a finite set of operations that your app will ask the server to execute, and only the variables passed to them will be the dynamic part of the request.

In these situations, where every query is static, it makes no sense to send the server the same query text over and over for all the queries we request. If we could make it so that both the client and the server know in advance the entire set of queries, we could assign each a short identifier and make the client refer to a particular query by that identifier instead of the full query text. We would then save this map from identifier to query so that the server can look up the corresponding query given the id it got from the client. This is what is known as persisted queries or persisted documents. The idea is that you persist the queries in some storage and you can refer to each of them with an identifier, which is usually a hash of the query text. How/where you persist those queries (and for how long) is up to you, depending on your needs.

By doing that, we're immediately reducing the amount of data that travels between the client and the server through the network, which translates into lower latency and faster responses.

But that's not the only optimization this allows. Since the queries are fixed, and we know we wrote them against the schema the server has, we already know that they are valid queries, so there's no need to validate them every time we want to execute them. In fact, there's not even a need to parse them over and over, we can parse them as a build-time process and keep them around in their parsed format (the AST) so that the server can use that directly. This will save some time from each request to the server, as we will no longer be parsing and validating each query that arrives. We would directly execute the query and provide the results back. This is especially useful if you're using a Javascript backend, as it's single threaded, and given that parsing and validating is a synchronous process, you'd be blocking other requests that the process could take while doing this task.

It's also worth mentioning that this also has security benefits, since by only allowing persisted queries to be executed, we don't care about bad users attempting to craft potentially dangerous queries. Only the ones we wrote in the client (and tested and validated before deploying) are the ones that will be executed. There's [another blog post](https://dev-blog.apollodata.com/securing-your-graphql-api-from-malicious-queries-16130a324a6b) where [Max Stoiber](https://twitter.com/mxstbr) talks about other alternatives to security in graphql without using persisted queries.

## How we persist queries

So far, we talked about what a persisted query is, and how that helps optimize the process of asking for data and getting a result back with GraphQL in production.

In this section, we'll talk about how we're actually doing this in a project I worked on in my past job.

Let's split this between client and server.

### The Client

We co-locate the queries we send from the client with the UI that requires it. We're using React, so we co-locate the queries with the component that gets the result of that query injected.

We write those queries in .graphql files and import them into our components like this:

```js
import query from "./query.graphql";

// query is the compiled document AST, which is a JS object
```

To make that work, we use the webpack loader that comes in the [graphql-tag](https://github.com/apollographql/graphql-tag) package.

Besides that, we are also using another loader I created and open sourced, the [graphql-persisted-document-loader](https://github.com/leoasis/graphql-persisted-document-loader), that attaches the document id (a hash of the document's contents) as a property to the compiled AST. This way, we can access the document id very easily by just doing:

```js
import query from "./query.graphql";

console.log(query.documentId); // => 5eef6cd6a52ee0d67bfbb0fdc72bbbde4d70331834eeec95787fe71b45f0a491
```

Since we're using [Apollo Client](https://www.apollographql.com/client) to manage our client side GraphQL, we configured a custom [link](https://www.apollographql.com/docs/link/) to teach the client how to request the server for data using the queries we provide. In this custom link, we send only the `documentId` (and the variables) as part of the http request to the server, which we grab from the `query` we receive in the link.

```js
class Link extends ApolloLink {
  // …

  request({ query, variables, operationName }) {
    return new Observable(observer => {
      const body = {
        id: query.documentId,
        variables,
        operationName
      };

      this.callGraphQLServer(body).then(
        ({ data }) => {
          if (!observer.closed) {
            observer.next(data);
            observer.complete();
          }
        },
        error => {
          if (!observer.closed) {
            observer.error(error);
          }
        }
      );
    });
  }
}

function createApolloClient() {
  const cache = new InMemoryCache();

  return new ApolloClient({
    cache: cache,
    link: new Link()
  });
}
```

There are a lot of ways to do this, even [apollo-link-http has support for persisted queries](https://www.apollographql.com/docs/link/links/http.html#persisted-queries) by letting you send an extensions object and not send the query, so you could compose links to have a similar effect to what we did above.

So with this setup, we already have the client sending the ids for the queries we want, and have those ids already calculated by webpack and part of the compiled query AST, so this has no computation cost at run time.

### The Server

We have a graphql endpoint that listens for client requests. It uses a lookup object by query id to already compiled AST so that it doesn't have to parse and validate again.
The server then just looks the query up in the map, and executes it. We use graphql's `execute` function (instead of the `graphql` function) to avoid the mentioned parsing and validation steps. This approach is a bit naive, as we load all the queries in memory. If we had a lot of them, we would have memory issues, so a better solution would be needed. Since we only need to do lookups by id, any key value store would work fine, also a relational database table.

Contrary to strategies such as [Apollo-link-persisted-queries](https://github.com/apollographql/apollo-link-persisted-queries), that persist the queries on demand as the client requests for them (check [how the protocol works](https://github.com/apollographql/apollo-link-persisted-queries/blob/master/README.md#protocol)), we do this offline, via scripts. Since we weren't using Apollo Engine (which by the way you should definitely try if you can, as it does a lot of awesome things for you), that implements the protocol to deal with them and handles concurrency, we wanted to avoid that problem completely instead of implementing a solution that was very likely to miss some concurrency edge case. By persisting the queries offline via a script we don't have to deal with those problems, though we can switch to that on-demand approach if we decide to move to Apollo Engine at a later time.

We use a library called [persistgraphql](https://github.com/apollographql/persistgraphql), also from Apollo, that statically searches for all the queries in your codebase and extracts them into a file. We post process that file and calculate the queries ids as a hash of their contents, and also compile the queries into their AST representation.

It's important to note that the hash algorithm we use here is the same as the one we configure in the webpack loader in the client. The loader internally uses persistgraphql so we are sure the extracted query will be the same string, so the same hash algorithm will return the same value.

We currently don't do this next step (maybe an idea for an OSS project?), but we could post process these queries even more by optimizing them in a similar way as the Relay Compiler. We could simplify duplicate fields, inline fragment fields, remove unreachable fields, etc. This would not change the output response for the queries, but would save even more time in traversing the AST to execute them.

### Old queries

When using persisted queries, and making the server not accept any arbitrary query, only the ones persisted, is important to not discard old queries previously persisted but that no longer exist in the current version of the app.

We have to deal with old clients that may have not updated to the last version of the app. This is especially important for native apps, but it's also important on the web, as it also happens, albeit probably within a smaller time frame as clients always get the latest version when they refresh the page.

As your application code evolves, if you happen to change a query by adding or removing a field or even changing its name, the id of that query will change, since that id is a hash of the query contents. When we make a change, we need to make sure that a new query and id is added to the lookup object via the script, but we also need to keep the old query persisted, no longer used in the current code, for older versions of the client to still be able to request them to the server.

This is why our script to persist queries has a way to “lock” the queries to a particular app version, so that those are not discarded in a future run of the script.

Whenever we regenerate the queries, not versioned queries (the ones that are brand new in development and haven't yet been deployed in production) are always discarded and replaced with the most current ones, while the versioned ones are retained.

So when developing, we would code on features modifying and creating queries, and running the persist script to update with the latest changes in every PR against the development branch.

When we are about to release, we cut a branch and we bump the app's version. We then run the persist script in the “lock” mode with every change in the release, so all the queries present in the code get versioned to this release's version. If queries from a previous version are still around in the code (because they were not modified) they get locked to the latest version. If they are not, they will stay locked to the version they were last seen. This way we know the most recent version a query was used for all the queries that we ever persisted.

When to discard old queries that are no longer used is something that really depends on each app, and requires some analytics data to verify when users are no longer using those. This is why at least for now we do that process manually for our queries. There is no automated script to remove old queries, we just go and remove them from the file when we are sure they are no longer used. That information usually comes from metrics we collect that tell us that a particular query hasn't been executed for some time, and when that happens we consider it is no longer being used anymore.

## More stuff you can do

The concept of statically analyzable queries is very powerful, and you can use it beyond optimization use cases. For example, we use this information to make sure we have all the queries tested, and fail the test suite if there's a new query without a test. How we approach testing for our GraphQL queries is something I want to share as well, and I'll do that in a future post.

## Conclusion

Adopting GraphQL is something that brings benefits to the codebase as soon as you start using it. But if you start adopting the advanced patterns and tooling around it, you will benefit even more, both in performance and productivity.

I strongly suggest that you apply an approach that serves only persisted queries in your production app (unless you have to craft queries dynamically, or provide a public API with GraphQL), as it will provide you with security and performance benefits that will cause a big impact to your users and will give you less headaches. Even if the setup seems like too much work, it really pays off.

Feel free to drop a comment (or [follow and reply to me on Twitter](https://twitter.com/leogcrespo)) if you liked (or didn't like) this post, and if you have any suggestion that you want to make or if you want to share your experience doing the same thing as I did. Hope you found this post useful!
