---
title: React Patterns - Render Callback
date: "2017-03-27T22:12:03.284Z"
path: "/react-patterns-render-callback"
---

> Edit: Since this post was published, the term "render props" became popular to name this concept. They both refer to the same thing.

I wanted to start documenting some React patterns that are common when developing. Most importantly because doing this will make me do some research in order to understand more accurately when those patterns are a good fit and when they aren't, and what are the tradeoffs involved in using or not using them. Hope you find these posts as useful as they are for me!

So today, I want to start with this pattern called “Render callbacks”. I think the name was coined by [Ryan Florence](https://twitter.com/ryanflorence) on Twitter, not happy with the alternative name “function as child”, which was not entirely precise, as this pattern isn't only constrained to the `children` prop.

## When to use it

You want to extract some functionality you have in a component, the parent, into another component, that will be rendered as a child of that parent. The functionality can't entirely live in the child component, and thus configuring it with simple value props is not enough. You want the child to do something, but then some part of the logic requires the parent to provide it with something further to do.

Basically what you want is a way for the parent to provide some logic to the child, and the child have the control on how to execute that logic.

## What it is

You provide the child component with a function prop that will be called at some point internally in the child. This prop is called the "render callback". That function is able to receive parameters that will be assigned by the child the moment it is called, with the information the child has when doing its stuff. The child is the one to decide if it wants to call that function or not, again depending on its internal logic.

```jsx
class Parent extends React.Component {
  render() {
    return <Child foo={bar => <div>Hello {bar}!</div>} />;
  }
}
```

In the child, simply call the prop as a function wherever (and if) it makes sense, passing the relevant parameters to it:

```jsx
class Child extends React.Component {
  // Do some complex stuff in the lifecycle...

  render() {
    if (someLogic) {
      return <div>Nothing to do here!</div>;
    } else {
      return this.props.foo(this.state.barCalculatedSomehow);
    }
  }
}
```

Let's see an example to make that a little clearer...

## An example: Component to do data fetching

Let's say you have a component that needs to fetch some data in order to render it somehow. Maybe you'd do something like this:

```jsx
class StuffList extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      error: null,
      data: null
    };
  }

  componentDidMount() {
    fetch(`/user/${this.props.userId}/stuff`).then(
      data => this.setState({ loading: false, data }),
      error => this.setState({ loading: false, error })
    );
  }

  render() {
    if (this.state.loading) return <Loading />;
    if (this.state.error) {
      return <ErrorMessage error={this.state.error} />;
    }

    return (
      <ul>
        {this.data.map(thing => (
          <li key={thing.id}>
            <h2>{thing.name}</h2>
            <p>{thing.text}</p>
          </li>
        ))}
      </ul>
    );
  }
}
```

We're using the component's lifecycle and state to accomplish what we want. We store in the state wether we have loaded data or not, wether we had an error from the request or not, and the data itself, when the request succeeds. Then in the `componentDidMount` lifecycle hook, we go and perform the fetch, using the necessary props, and update the state when we have a successful request, and when we have a failure.

> Note: If we wanted a more complete example, we'd also have to add code in `componentWillReceiveProps` and `componentDidUpdate` to handle the case where the props relevant to the fetch request change (`userId` in this case), and perform a new request (and maybe cancel/ignore the previous one if it's still inflight). For simplicity, this is not included in the example.

Finally, we have our render function, that uses all that state and either renders a loading screen, an error message, or the actual results in a nice way, accordingly.

Let's think about what this component is doing. We're having multiple responsibilities: handling the logic around fetching data, coping with loading and error states, and also rendering all those states. What we want is to extract the logic regarding fetching data, dealing with the different states, and rendering the loading and error states. We only care about rendering the successful data in our component.

Let's start writing something about how we'd want to use this component in our original one. We know for sure we'll pass the necessary parameters to fetch the data as props, in this case, the `userId`:

```jsx
// I want my render logic to happen somewhere,
// but I need access to `this.state.data` that now lives
// inside `FetchStuff`
<FetchStuff userId={this.props.userId} ... />
```

Now, in order to _provide_ the child component with the necessary info to render the data when the request is successful, we'll provide a render callback prop. That render callback should receive the data as its first parameter:

```jsx
<FetchStuff
  userId={this.props.userId}
  renderData={data => (
    <ul>
      {data.map(thing => (
        <li key={thing.id}>
          <h2>{thing.name}</h2>
          <p>{thing.text}</p>
        </li>
      ))}
    </ul>
  )}
/>
```

With that usage in mind, this is the implementation of `FetchStuff`:

```jsx
class FetchStuff extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      error: null,
      data: null
    };
  }

  componentDidMount() {
    fetch(`/user/${this.props.userId}/stuff`).then(
      data => this.setState({ loading: false, data }),
      error => this.setState({ loading: false, error })
    );
  }

  render() {
    if (this.state.loading) return <Loading />;
    if (this.state.error) {
      return <ErrorScreen error={this.state.error} />;
    }

    return this.props.renderData(this.state.data);
  }
}
```

Notice how we call `this.props.renderData(...)` as a function and pass the relevant parameters into it. That's the pattern in action. We extracted all the functionality that we didn't want to live in `StuffList` and moved it into a reusable component that accepts a function to determine how to render the data it fetched.

## Another example: A tooltip

Say you want to use a tooltip component. This is one way to do it:

```jsx
<TooltipTrigger tooltipContent={<span>This is the tooltip</span>}>
  <div>Hover me!</div>
</TooltipTrigger>
```

We wrap some element around a `TooltipTrigger` component, which wraps the children in an element that when hovered, will show the tooltip. We specify the content of the tooltip as a prop that accepts a react element. A simple implementation of the `TooltipTrigger` could be something like this:

```jsx
class TooltipTrigger extends React.Component {
  constructor() {
    super();

    this.state = { hovering: false };
  }

  handleMouseEnter = () => {
    this.setState({ hovering: true });
  };

  handleMouseLeave = () => {
    this.setState({ hovering: false });
  };

  render() {
    return (
      <div
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        style={{ position: "relative" }}
      >
        {this.props.children}
        {this.state.hovering && (
          <div
            style={{
              position:
                "absolute" /* plus some other styles to position the tooltip */
            }}
          >
            <Tooltip>{this.props.tooltipContent}</Tooltip>
          </div>
        )}
      </div>
    );
  }
}
```

Notice we only render the `Tooltip` component whenever we're hovering the `div`, and we don't render it otherwise. Ok that was fairly easy, right?

Let's think about some potential problems this solution has: What if the content of the tooltip is complex enough that you don't want to create the react elements until you really need to show them? Or maybe you don't have the necessary information for that content yet. It'd be really nice to be able to provide the contents in a lazy way, such that the elements are only created when the `TooltipTrigger` considers it's needed. Sounds like a nice use case for a _render callback_.

If we didn't wrap the content in a render callback, the elements would be created right away even when the tooltip decides not to render them yet. Fairly enough, these are just lightweight objects that only _describe_ what the UI will look like, but it's still work we don't need to do. Also, if the content depends on getting the info from data we don't yet have, trying to access it right away would cause a runtime error, especially if we need to access nested properties.

So now, let's try passing a render callback instead of passing a react element as the content. Let's see how that looks in the code:

```jsx
<TooltipTrigger
  tooltipContent={() => (
    <span>Something very complex with {data.we.may.not.yet.have}</span>
  )}
>
  <div>Hover me!</div>
</TooltipTrigger>
```

And this is how we'd modify the `TooltipTrigger` implementation:

```jsx
class TooltipTrigger extends React.Component {
  // ...

  render() {
    return (
      <div
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        style={{ position: "relative" }}
      >
        {this.props.children}
        {this.state.hovering && (
          <div
            style={{
              position:
                "absolute" /* plus some other styles to position the tooltip */
            }}
          >
            <Tooltip>
              {this.props.tooltipContent() /* Notice the change here! */}
            </Tooltip>
          </div>
        )}
      </div>
    );
  }
}
```

Here we are using the render callback to render some content whenever the tooltip is hovered. The only change needed in the `TooltipTrigger` implementation is the use of `this.props.tooltipContent`, which now is a function and we have to call it to get the elements.

In this case, compared to the previous example, we used the render callback pattern in the tooltip to delegate the responsibility of wether to render something or not, to another component.

## More examples in the wild

There are a lot of examples out there that make use of this pattern. Let's see some of those with a short explanation of each.

### React router

[https://github.com/ReactTraining/react-router](https://github.com/ReactTraining/react-router)

Uses the pattern to do both things actually. The `Route` component fetches the location data and query string params from the history, and passes that info to the function provided as render callback. Also, it decides wether to call the function or not depending on wether the route matches the path or not.

```jsx
<Route path="/some/url" render={() => <h3>Hello.</h3>} />
```

### React Measure

[https://github.com/souporserious/react-measure](https://github.com/souporserious/react-measure)

Measures the dimensions of an element (width, height, top, bottom, etc) and provides it as the parameter of the render callback, which allows the parent component to do any kind of crazy logic with the dimensions.

```jsx
const ItemToMeasure = () => (
  <Measure>
    {dimensions => (
      <div>
        Some content here
        <pre>{JSON.stringify(dimensions, null, 2)}</pre>
      </div>
    )}
  </Measure>
);
```

What's interesting here is that the render callback in this case is passed as `children`. This may look like something special is going on here, but remember that in React, the `children` prop is just another prop, only that it has some syntactic sugar that allows it to be passed as the content of the JSX tag.

### React Media

[https://github.com/reacttraining/react-media](https://github.com/reacttraining/react-media)

Same idea as before, but in this case the parameter that is injected into the render callback is wether the media query specified as prop matches or not:

```jsx
class App extends React.Component {
  render() {
    return (
      <div>
        <Media query="(max-width: 599px)">
          {matches =>
            matches ? (
              <p>The document is less than 600px wide.</p>
            ) : (
              <p>The document is at least 600px wide.</p>
            )
          }
        </Media>
      </div>
    );
  }
}
```

### React-Motion

[https://github.com/chenglou/react-motion](https://github.com/chenglou/react-motion)

A library that let's you create animations. You specify the animation configuration as props to the `Motion` component, and you also pass a render callback as the children. The callback gets called repeatedly with the intermediate values of the calculated animation, rendering all the intermediate states of the UI.

```jsx
<Motion defaultStyle={{ x: 0 }} style={{ x: spring(10) }}>
  {value => <div>{value.x}</div>}
</Motion>
```

### React Native's ListView

[https://facebook.github.io/react-native/docs/listview.html](https://facebook.github.io/react-native/docs/listview.html)

One way to create lists in React Native is with a `ListView`, provided in the core React Native library. Instead of directly rendering the list of items as children of the component, it defines the `renderRow` prop which is a render callback that specifies how to render a row given the data for that item, which is specified in another prop called the `dataSource`. In this case, the render callback pattern is used to specify placeholders for custom content that the `ListView` can use internally while rendering the list. This also allows for internal performance optimizations, since the component can decide when to render each item in a granular way.

```jsx
<ListView
  dataSource={this.state.dataSource}
  renderRow={rowData => <Text>{rowData}</Text>}
/>
```

## Advantages

We've already seen some of the advantages of this pattern. The most obvious one is that it helps to decouple your rendering logic from the way to get the necessary data to actually render, or the logic to conditionally render that.

Another benefit, is that because we're using components, the render method is still declarative, and it's easy to see at a glance what's going on.

Also, contrary to using [Higher order components (HoC)](https://facebook.github.io/react/docs/higher-order-components.html), you don't pollute your props namespace with the props that can be potentially injected by HoCs. In render callbacks, the injected stuff comes as parameters.

## Disadvantages

No pattern comes without its drawbacks. As we all know, everything is a matter of tradeoffs...

One problem the pattern has, is that since we're creating a function inline in every render, that may conflict with some optimizations that could be done in the `shouldComponentUpdate` hook in the component that receives the render callback. Since the function is a new instance every time, shallow comparison of the props is no longer a valid solution. You could probably hoist the render callback or pre-bind it if using `this`, but that'd reduce the advantage of being able to quickly scan the `render` method and see what's going on. This is probably subjective though.

This pattern also is not suitable when the data required to render something is also needed in some life cycle hook. This includes being able to do side effects, because those cannot be done in the render method, so you need to do them in some lifecycle hook that allows them.

This is because the render callback is passed as a prop to another component in the render method, so you don't have access to those parameters outside the function, and particularly not in the lifecycle hooks of the parent. If you need that though, you can pass the parameters as props into another component that contains the rendering logic you previously had inlined in the render callback. At that point, you're dealing with a regular component that gets its data injected via props. Another option would be to use a [Higher order component (HoC)](https://facebook.github.io/react/docs/higher-order-components.html).

One caveat with this approach that you could run into pretty easily, is potentially using stale props or state inside the render callback. This happens if you use _destructuring_ of props or state and use those values inside the render callback as a closure. Here's an example of this:

```jsx
class Greeter extends React.Component {
  render() {
    const { name } = this.props;

    return (
      <Clock
        renderEverySecond={time => {
          return (
            <h1>
              Hello {name} - The time is {time.toString()}
            </h1>
          );
        }}
      />
    );
  }
}

class Clock extends React.Component {
  constructor() {
    super();
    this.state = { element: null };
  }

  componentDidMount() {
    const { renderEverySecond } = this.props;

    setInterval(() => {
      this.setState({
        element: renderEverySecond(new Date())
      });
    }, 1000);
  }

  render() {
    return this.state.element;
  }
}
```

This may be a contrived example, but tends to happen often in practice. In this case, if you attempted to render the `Greeter` component more than once with a different `name` prop, you'd still be seeing the message that updates every second using the first prop ever passed. That's because the first `renderEverySecond` render callback is being stored internally inside the `Clock` component and that's the function being executed every second. Even if future renders of `Greeter` passed a new `renderEverySecond` function with the `name` prop being properly closed over, since the first one is being used, we only ever see the first name.

One fix would be to make `Clock` properly use its most current `renderEverySecond` prop, which is achieved by not destructuring it in `componentDidMount`:

```jsx
class Clock extends React.Component {
  // ...

  componentDidMount() {
    setInterval(() => {
      this.setState({
        element: this.props.renderEverySecond(new Date())
      });
    }, 1000);
  }
}
```

Another fix would be to make the `renderEverySecond` render callback use the most current value for `name`, again by avoiding destructuring and using directly the most current set of `props`:

```jsx
class Greeter extends React.Component {
  render() {
    return (
      <Clock
        renderEverySecond={time => {
          return (
            <h1>
              Hello {this.props.name} - The time is {time.toString()}
            </h1>
          );
        }}
      />
    );
  }
}
```

One final drawback that render callbacks have is that since they compose dynamically at _render time_, they don't allow optimizations that could be done if the parameters to be injected were static. You could treat some props received by the child component as _static_ and not update the render callback parameters when they change to have those optimizations, but that kind of breaks the component contract, since the user of that component would expect the prop change to be taken into account. Using things like [Higher order components](https://facebook.github.io/react/docs/higher-order-components.html) may be a better solution for static configuration of a component, which move that said configuration to _declaration time_.

## Conclusion

We saw what the _render callback_ pattern is, how to use it and when it helps us when developing with React. We also saw some examples in the wild where it's being used, and we also analized (some of) its advantages and disadvantages, mostly compared to its "nemesis" the [Higher order component](https://facebook.github.io/react/docs/higher-order-components.html), which is also a pattern to solve similar problems.

It seems that for most of the use cases, it ends up being a matter of taste wether to choose the render callback pattern, or the [Higher order component](https://facebook.github.io/react/docs/higher-order-components.html) pattern. Both let you achieve the same thing, but choose different tradeoffs. You can even choose one patter to solve some things in your app, and the other one to solve other things. They can live happily together.

Hope this post taught you something, made your ideas clearer, or at least didn't tell you anything incorrect (if so, add a comment and will fix!). Also feel free to comment to add more advantages or disadvantages that I may have missed.

Have a great day!
