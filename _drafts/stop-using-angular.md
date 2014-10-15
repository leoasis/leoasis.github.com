---
layout: post
title: Let's Stop Using Angular
category: posts
---

For the past two years or so I've been developing in my full time job with Angular for client side Javascript. While I love leaning new stuff, I was never sold on it. I didn't use it in my personal projects or fun projects or freelance projects where the tech stack was for me to choose.
This post is to write down what I, after said two years, found that's wrong about this framework. I'm doing this to have my thoughts clearly written down and be as objective as I can possible be when it comes to choosing a library/framework. Also I hope someone would read this so that she can follow this advise, or not, but at least we can discuss about it. I truly believe that despite being the most popular framework out there, it is by far the worst choice you could make, and only time will prove me right.

What follows is a (by no means complete) list of things that are wrong about this framework, explaining why they are so, with examples and trying to be objective, unless stated otherwise :)

Here we go!

## Angular embraces mutability

Almost everything in Angular revolves around keeping references to things. You don't have to modify them, otherwise Angular won't keep track of the same object and it won't detect changes anymore. In order for angular to do its job, it expects you to mutate the object that is being referenced, so that its digest cycle can track the changes.
(WHY IS THIS BAD)

## Scope inheritance design is flawed (all devs step into the problem of overriding a property in the child scope)

Have you ever had this issue (LINK)? That problem is due to how scope inheritance works, which relies on normal prototype inheritance. So some may claim it is not a bug in Angular, it is how inheritance works. But I say that the fact this happens to any developer from time to time, be it new or experienced, _is_ a problem with Angular, since it chose that API to interact with developers. If all developers step into the same problem when using some specific API, then there is a problem with that API, there is something that is not well thought, and can (and should) be improved. Choosing an inheritance chain with scopes and having to _know_ which directive causes a new scope to be created and which not, is not a particularly good API.

## Directives are too low level (inside the link function, you're on your own with regards to DOM manipulation)

The directive linking function is like an all-inclusive hotel in the Caribbean: you can do pretty much anything you want. But also, you're left on your own. You have this place to manipulate the DOM, manipulate the scope, manipulate services, interact with the associated controller, do transclusion, and whatnot. Given that there is no middle-ground abstraction to create custom components other than this, this is way too low level and leaves you pretty much with no clue of what's to do here. It's like an empty sheet of paper. Sometimes it's easier to have something written and work from that, than to start on your own. I think the directive API should have some intermediate ways to do the common-case, in a simpler way than the current API provides.

## Too many ways to define a service

Factories, Providers, Services, Values, Constants. Too many ways to define injectable components. You almost always use factories and values, and in some more complex cases you need some startup code and use a provider. In those cases you may also need to use constant. Services are just too specific and never had to use them in my entire experience with angular. In any case, there are way too many choices and if you're not an experienced developer with the framework you may end up confused with what you need to use in your particular case.

## Reimplements modules instead of embracing existing ones

Angular implements its own module system for tracking dependencies between components. It is a good thing when using angular on its own, or without any module system, but when you want to use one, you are redundantly wrapping angular modules in CommonJS or AMD modules to make them work in the rest of your app. Also, you cannot define dependencies other than other angular components in this way, so you get a solution that reinvents the wheel but only for its own needs. I think it would be wiser to embrace the existing work and be more friendly with code that lives outside angular.

## Dirty checking the model data does not scale (not as dirty checking the view data)

Angular starts to get slow when there are more than 2000 bindings in your page. It is true that more than 2000 pieces of information at the same time are no good for humans to see, but the truth is that angular binding is not dependant on the visible elements on the page, but on the amount of data being watched on the page. There may be a lot more watches of data than elements being shown, and that's the actual problem with angular. It dirty checks on the data. Some other solutions, like React, do dirty checking at the view level, by diffing the DOM state using lightweight representations of it. This is way more performant, since this doesn't depend on how much data you have, and it is directly proportional on the amount of DOM elements you have in your page, which directly corresponds to how well you design your pages for humans to use.

## API is halfway there (enygmatic symbols to use in a directive)

Have you seen how the directive API looks in angular? (EXAMPLE OF restrict, require, scope, and such). This is so cryptic. You need to rely on special characters, symbols and conventions in between to see what that actually does. That is not a good sign of a clear, easy to use API.
Same thing goes for syntax of ngOptions and ngRepeat, for which I always need some documentation lookup to see how to structure. Again, not clear.

## Too many ways to do the same thing, no best way to do it (class directives, controller-as syntax, services for stateful things)

Angular provides a lot of ways to do the same thing, like different kinds of services (we saw that before). There's also several ways to use a directive, and several ways to use a controller. You can expose your controller functions using `controller-as`, or you can just use normal controllers with a scope. This adds into complexity, barrier for new developers, lack of conventions, and lack of best practices to enforce. This is bad for the ecosystem around angular, both user-developers and library-developers.

## No clear way to tell behavior from the html (what is a directive and what is an attribute for a directive? what does that directive do and what it has access to? is the scope of that directive inheriting the controller's or is it isolated?)

Directives go into your html. They can be declared as tags, attributes, classes (huh?) or even comments (whattt???). This makes it really hard to tell a normal attribute versus a directive, and you're no longer safe or comfortable at least to change the html, since you could be removing a directive or a directive parameter without notice.
This is a really dangerous way to work. Comments and css classes shouldn't be allowed by angular to start with, but some more thought should be done when designing your app and make directives as clear as possible, since the html becomes the API for them, so you should make that API clear for the user, which may or may not be yourself.

## Cannot be used to run server side in a decent way (only using phantom or some other headless browser)

Angular needs a DOM to work. This is unlike other approaches where string templates are used, or even a virtual representation of the DOM that is not coupled to an existing DOM. And in the server we don't have a DOM available. At least not a real one. We have some libraries that create DOM structures that claim to be compatible, and they may be up to some extent, but they won't be exactly the DOM that angular needs. Some approaches for rendering server side with angular is by using a headless browser to execute angular and then get the rendered html from there. That is not an optimal solution since it requires a browser to be up and running, which causes a lot of overhead to the request.

## You need to use low level APIs really soon ($watch, $apply)

A good practice in angular is to break up your app into modular directives with specific functionality. In those places, you need to couple with both the scope and the DOM. If you do anything beyond trivial, you'll find yourself starting to use `$apply` because you'll be outside the context where angular knows what to do. Especially if you start using external plugins that manipulate the DOM.
Also, both in directives and in controllers, if you really want to react to changes in the data and not rely on the view calling you to update based on changes of the input models, you'll start using `$watch` a lot too. While this is not complex at all, and it's not hard to reason (though it's easy to cause loops if you update state when watching changes that trigger other watches and so on), you get out of the simple and wonderful land where angular does the job for you, and you need to keep telling angular what to do.

## Performance improvements are too granular, and not at the correct points

ngModelOptions is a directive option that allows you to reduce the number of digests to be done on the model attached to it. But really? I need to do performance optimization in the _view template_? Isn't there some kind of place I can hook to add an optimization, which is not invasive and is in a clear, explicit way where I can see it? Or even a way to apply global optimizations?
