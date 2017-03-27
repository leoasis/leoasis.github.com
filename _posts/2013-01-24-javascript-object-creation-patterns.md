---
layout: post
title: Javascript object creation patterns
category: posts
---

I'm writing this post because my folks at work thought it might be helpful, since not all of the devs out there are familiar with the way that Javascript objects and prototypes work.

These concepts are basic for all Javascript developers, and by basic I mean that in the way of "building the basis for the rest of the concepts you'll learn in Javascript", and not the "it's sooo trivial, how can't you know that?" meaning.

This is the summary of the patterns I'll cover:

1. Object literal
2. Function that returns an object
3. Constructor function
4. Constructor function with prototype
5. Object.create

## Object literal

This is the most used pattern. It's just defining the properties of an object between curly braces. That's it.
You can create one time objects by using the object literal and assigning the properties and methods you need.

```js
var guy = {
  name: "John",
  awesome: true,
  aboutMe: function() {
    return this.awesome ? "I'm awesome!" : "I'm lame :(";
  }
};
```

The good thing about this pattern is its simplicity. Just create an object right away and start using it. The bad thing is that it is explicit: you need to specify each and every property that the object has, there is no "class" already defined elsewhere that you can just use to create an instance with.

This pattern is mostly suitable for creating one time objects, singleton objects, or objects that act as hashes.
It is not good for creating multiple similar objects, because by definition, this pattern is a one time creational one: you define the object and you get it built.

## Function that returns an object

This patterns adds into the previous one, by encapsulating the object definition inside a function. It is just the factory method pattern.

```js
function createGuy(name, awesome) {
  function awesomeness() {
    return "I'm awesome!";
  }

  function lameness() {
    return "I'm lame :(";
  }

  return {
    name: name,
    awesome: awesome,
    aboutMe: function() {
      return this.awesome ? awesomeness() : lameness();
    }
  };
}

var guy = createGuy("John", true);
```

This one is suitable for creating complex objects, and you don't want the caller to know how it is built. It also adds a way to define "private" methods, by declaring them inside the scope of the factory function, which will not be visible outside that scope.

As we're creating a full blown new object each time we call the function, we have memory usage issues if we want to create a lot of "instances" (actually, to the engine they are independent objects that happen to have properties and functions that behave the same).

## Constructor function

This pattern is similar to the previous one, but with some subtle differences. We don't return the object anymore, in fact, the function itself doesn't return anything. Also, we set the object-to-be-constructed's properties by using `this`. There is also another difference in the caller, and it's an important one: the function is called with a prefixed `new` operator. This indicates that we are using that function as a constructor. Basically what it does internally is creating a new object, making it accessible to the constructor via the `this` keyword, assigning the object's *prototype* to the one pointed by the function's `prototype` property, and returning it implicitly. We'll see that thing about prototypes in the following pattern, so for now just look at this example:

```js
function Guy(name, awesome) {

  // Some "private" methods
  function awesomeness() {
    return "I'm awesome!";
  }

  function lameness() {
    return "I'm lame :(";
  }

  this.name = name;
  this.awesome = awesome;
  this.aboutMe = function() {
    return this.awesome ? awesomeness() : lameness();
  };
}

var guy = new Guy("John", true);
```

As it is so similar to the previous pattern, it remains useful in the same scenarios or needs. As a drawback, you *have* to remember to call that function with the `new` operator. If you don't, it will be treated as a regular function, and in regular functions `this` points to the global object, that is, `window` for browsers and `global` for nodejs.

## Constructor function with prototype

This patterns makes use of the previously described `prototype` property from the function, to set the object's *prototype* (note that I'm making a distinction here, since those two concepts, while related, are not the same).

We could rewrite the previous example like this:

```js
function Guy(name, awesome) {
  this.name = name;
  this.awesome = awesome;
}

Guy.prototype.aboutMe = function() {
  return this.awesome ? "I'm awesome!" : "I'm lame :(";
};

var guy = new Guy("John", true);
```

What's the difference? Well to understand that, we need to know that in Javascript, every object has an internal property (not accessible, at least not in a standard way) that is the *prototype*. This *prototype* is another object, which will be used in the lookup chain for the methods being called in the object.
Also, a function (which is also an object in Javascript) contains a property called `prototype`, which is not the function's *prototype*, but a special property that the engine uses when using the function as a constructor (using the `new` keyword) to assign the *prototype* to the newly created object.

In the example, we're constructing a new object, `guy`, that has a *prototype* which contains a method called `aboutMe`. With the lookup chain, we can call `guy.aboutMe()` and it will finally call the *prototype*'s method.

So what's the benefit of doing this? As you can see, we're defining a set of methods and properties to be shared by the instances created using that constructor, just like in the patterns before, but in this case, this is *true* sharing: all the instances have a *prototype* which is the *same* object for all. In terms of performance, this is a huge win if we're creating a lot of instances, since the methods and properties will be in just one object, and not copied all over the instances.

One thing to emphasize here, is that the Function's `prototype` property is a *reference* to the *prototypes* of the objects created by that function as a constructor. So as a reference, we can get access to it and modify it.

Consider this code is after the code in the previous example:

```js
Guy.prototype.aboutMe = function() {
  return "I'm beyond awesome!";
};

console.log(guy.aboutMe());
```

Here what we're doing is changing a method of the object that is the *prototype* of `guy`. So now it is clear (perhaps not that clear?) that this code prints "I'm beyond awesome!", because the aboutMe lookup goes up to the object's *prototype* and finds the new aboutMe method (oh, now I got it).

This example is somewhat different, consider that the previous code never happened, and instead this one did:

```js
Guy.prototype = {
  aboutMe: function() {
    return "I'm beyond awesome!";
  }
};

console.log(guy.aboutMe());
```

Is this the same behavior as the example before? Not quite. If you look closer, you'll see that what I just did was to change the function's `prototype` *reference* to a new object. So what this means is that we don't have a reference to the *prototype* of the instances created by the constructor anymore. This code will print "I'm awesome!", and will ignore this new aboutMe method, because we never changed `guy`'s *prototype*.

But if we had something like this *after* this previous example:

```js
var newGuy = new Guy("Larry", false);
console.log(newGuy.aboutMe());
```

This will indeed call the new `aboutMe` method. Why? Because at the moment this instance was created, the function's `prototype` was already the new one, so `newGuy` now has the *prototype* currently referenced by `Guy.prototype`, which is different than `guy`'s *prototype*.

### Prototype chain

Remember that I said that the object's *prototypes* are just objects? So this *prototype* could have its own *prototype* that in turn could have its own *prototype* and so on... This is what is called a *prototype chain*, which is essentially the lookup chain that the engine uses to find the code to execute upon a given call.

This *prototype chain* is something like inheritance, since basically that is just a lookup chain to know which code to execute. So we could create a new constructor function that has its `prototype` be an object that has as *prototype* the `prototype` of `Guy`, so that the objects created with this constructor would "extend" `Guy`'s functionality:

```js
function NewGuy(name, awesome) {
  this.name = name;
  this.awesome = awesome;
}

NewGuy.prototype = new Guy(null, null);
NewGuy.prototype.shout = function() {
  return "Aaaaaaahhhh";
}

var john = new NewGuy("New John", true);
john.aboutMe();
john.shout();
```

Well, that works, but it is not pretty. First, we're duplicating the constructor, and second, we're creating a new `Guy` and passing null parameters (and this actually works because the constructor `Guy` does not play enough with the parameters to make all this explode with a null exception). There is a technique to fix this, that is used by many libraries that implement "class extension", "class inheritance" and such. It's something like this:

```js
function NewGuy() {
  Guy.apply(this, arguments);
}

var ctor = function() {}; // empty constructor
ctor.prototype = Guy.prototype;

NewGuy.prototype = new ctor();
NewGuy.prototype.shout = function() {
  return "Aaaaaaahhhh";
}

var john = new NewGuy("New John", true);
john.aboutMe();
john.shout();
```

What did we do here? We'll get to the constructor in a minute. Notice the `ctor` constructor function. It is an empty function, but we set its `prototype` property to the `Guy`'s one. So now if we create a new `ctor` instance, we're going to have an empty object whose *prototype* is the same as the one we would get if we created an instance using the `Guy` constructor. That's the key!

As for the constructor, notice we're just calling the `Guy` constructor and passing whatever arguments we get from outside. Notice here we didn't call `Guy` with `new`, since that would create a new object, and what we want now is to get the same code executed when creating a `NewGuy` instance.

## Object.create

Phewww that last one was pretty long. Got your breath back already? Good. One more to go!

There is one more pattern, which is not available in all browsers (well, it IS in all browsers but IE < 9). It goes like this:

```js
var guyPrototype = {
  aboutMe: function() {
    return this.awesome ? "I'm awesome!" : "I'm lame :(";
  }
}
var guy = Object.create(guyPrototype);
guy.name = name;
guy.awesome = awesome;
```

Here we're doing something similar to the previous pattern. We're creating objects that have a *prototype*. This time we do that differently, by using `Object.create`. What this does is another way to do what `new` does for constructor functions. You set the prototype object as the parameter of `Object.create` and it returns a new object whose *prototype* is that passed object.

This pattern is useful for creating multiple instances from a prototype, just like the previous one. It is also easier to understand (once you get what this prototype fuzz is all about) than the *constructor* functions with `this` and the `new` keyword. Some people also like this more because it indicates more clearly the prototipal nature of Javascript.

For the old IE lovers, you can get similar functionality by creating a shim of `Object.create` with this code ([Crockford][crockford_url]'s example):

```js
if (typeof Object.create !== "function") {
  Object.create = function (o) {
    function F() {}
    F.prototype = o;
    return new F();
  };
}
```

Or use this optimized version that reuses the constructor function:

```js
if (typeof Object.create !== "function") {
  Object.create = (function () {
    function F() {}
    return function (o) {
      F.prototype = o;
      return new F();
    };
  })();
}
```

Now that you understand how `new` works, I'll let you understand this code as an exercise.

This shim is not complete though. `Object.create` has an optional second parameter used to define the new object's extra properties. Anyway, you can add that to your shim if you like, or just use it without this second parameter.

## To sum up

We've covered different patterns for creating objects in Javascript. It's important that you understand the pros and cons of each pattern, because none is pure evil or pure goodness, each pattern work in some cases, does not work in others, or is overkill for some other case. It is your job to use them wisely, with a fundamented reason.

Hope this helped someone! You're free to go or leave a comment, whatever you please :)

See ya!

[crockford_url]: http://www.crockford.com
