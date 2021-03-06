---
title: Reparenting a Component
date: "2017-06-26T22:12:03.284Z"
path: "/reparenting-a-component"
---

When working with React, we almost never have to think about the underlying [reconciliation algorithm](https://facebook.github.io/react/docs/reconciliation.html) that calculates the update to the DOM. It just works: we write our components with the UI logic inside the render function, handle events and perform state changes, and bam!, we’re done. If we’re working with arrays, the reconciliation algorithm may ask us to provide the `key` attribute, but that’s okay when you [understand how keys work](https://facebook.github.io/react/docs/lists-and-keys.html).

In most cases, especially if the data is flowing exclusively via props, it doesn’t matter if we’re updating a component or mounting a new one. Since the data to render is all provided to the component, the final result will be the same if the component got updated, or if React had to mount it because it wasn’t there.

But there are cases where the reconciliation becomes a leaky abstraction. If we’re relying on the component’s local state for something, or if we’re dealing with state that lives in the DOM (like selection state inside form inputs), then it _does_ matter if we’re updating a component or creating a new one, because that would mean we will _retain_ that internal state, or wipe it and start with a fresh one.

So why a leaky abstraction? That’s because you need to know _when_ React will decide to mount or update a component. To know a bit more about it, I suggest you to [read the documentation about the heuristics inside the reconciliation algorithm](TODO). Two important ones relevant to this post are:

1. React will unmount the old tree of components and remount a new one if the new root of the tree is of a different type than the previous one.
2. Keys to assign identity to a component while diffing is only supported locally (i.e. inside a component's render function) for siblings, but it’s not able to identify and “reparent” between completely different nodes in the component tree.

In my particular use case, I had a panel that collapsed or expanded showing some items depending on the page where it was rendered. But that panel was nested in a component that would become unmounted whenever the page changed, because the component type was already different a couple of levels above in the tree, making the reconciliation algorithm wipe the subtree and create a new one with the component with the new type as a root.

That collapse and expansion was done with an animation whenever we detected the component's children _changed_, so I needed to have a way to detect that change. But since the component was being unmounted and remounted, the animation never triggered, as the state never technically changed.

Ideally, that could have been solved by designing the component tree so that the reconciliation worked _with_ us (instead of against us). For example, if this panel lived in a sidebar that is shown in both pages, a valid solution would have been to move that sidebar component to a layout component, and only re-render the main content whenever the url changes. That way, the sidebar would be updated and not remounted because the parents’ types would be the same.

That may have been an option in my particular case, even though we didn’t go with it for other reasons. But anyway, I believe there are plenty of valid use cases where doing that is not possible, at least not easily. In those cases, you need to resort to other solutions.

So I tried to make reparenting work. This is what I came up with to solve it, I will explain what’s going on below, but here is the code:

```jsx
import React, { Component } from 'react';
import PropTypes from 'proptypes';
import ReactDOM from 'react-dom';

const store = {};

function getMountNode(uid) {
  if (!store[uid]) {
    store[uid] = {
      mountNode: document.createElement('div'),
      inUse: true
    };
  } else {
    store[uid].inUse = true;
  }

  return store[uid].mountNode;
}

function removeMountNode(uid) {
  const record = store[uid];

  record.inUse = false;

  setTimeout(() => {
    if (!store[uid].inUse) {
      ReactDOM.unmountComponentAtNode(store[uid].mountNode);
      delete store[uid];
    }
  }, 0);
}

export default class Reparentable extends Component {
  static propTypes = {
    uid: PropTypes.string.isRequired,
    children: PropTypes.element.isRequired
  }

  componentDidMount() {
    const mountNode = getMountNode(this.props.uid);
    this.el.appendChild(mountNode);

    this.renderChildrenIntoNode(mountNode);
  }

  componentDidUpdate() {
    const mountNode = getMountNode(this.props.uid);
    this.renderChildrenIntoNode(mountNode);
  }

  componentWillUnmount() {
    removeMountNode(this.props.uid);
  }

  renderChildrenIntoNode(node) {
    // We use this instead of `render` because this also handles
    // passing the context
    ReactDOM.unstable_renderSubtreeIntoContainer(this, this.props.children, node);
  }

  render() {
    return <div ref={(el) => { this.el = el; }}></div>;
  }
}
```

And to use it, you need to wrap the component that can be reparented in this `Reparentable` component, in all the places where it should be rendered, like this:

```jsx
<div>
  {this.state.showingPage === 'page1' &&
    <Page1>
      <Reparentable uid="1">
        <FooComponent {…someProps} />
      </Reparentable>
    </Page1>}
  {this.state.showingPage === 'page2' &&
    <Page2>
      <Reparentable uid="1">
        <FooComponent {…someOtherProps} />
      </Reparentable>
    </Page2>}
</div>
```

Thanks to React’s nice API, the way to use this component is still pretty straightforward. There’s nothing more than rendering components and passing props.

So let’s talk about what’s going on in the implementation of that component. The trick of all this is to _keep the references of the DOM nodes_ that React uses to render a component and then call `ReactDOM.render` on them, so that React updates whatever instance was previously rendered in those nodes.

The `Reparentable` component renders a single div, to which we attach a ref to hold on to the DOM element instance. Then in the `componentDidMount` and `componentDidUpdate` lifecycle hooks, we get (or create if it doesn't exist yet) a DOM node based on the `uid` prop we received, append it to our div if we didn’t already, and tell React to render the children into that DOM node. If the `uid` is the same, the DOM node we get will be the same, so rendering into the same DOM node will make React perform the reconciliation there. Since we are rendering the same type of element, the component will be _updated_ by React instead of mounted.

When the `Reparentable` component unmounts, it will remove the DOM node we were using to render the children, but we’ll still keep the reference around in a global object. Notice that we don’t unmount the React instance in that node yet. We wait a bit for that, in case another `Reparentable` component attempts to use it (by rendering with the same `ui` prop). If that happens, we will keep the DOM node reference around since it was claimed. If that doesn’t happen, then we effectively unmount the React instance in that node and we remove the reference so that it can be garbage collected by the JS runtime.

Because we don’t unmount the instance if it gets used by another `Reparentable` instance, we effectively reparented the DOM node and the instance, and the next time it receives a render, it will update the instance, instead of mounting it.

One more thing to notice is that the example is using `ReactDOM.unstable_renderSubtreeIntoContainer` instead of `ReactDOM.render`. This is because the former allows to propagate the `context` into that subtree, which is not possible if we called `ReactDOM.render`, since it assumes we want to render a completely isolated tree. The fact that the name contains `unstable` in it should be enough warning not to use it, but there is no other way to achieve this context propagation as far as I know. Maybe this method will become stable in a future version of React, or a better solution will be available.

Here is an example of how you see it in action:

![Reparenting a component](./reparenting-a-component.gif)

Notice how the state is preserved (the click count and the text inside the input) when switching pages, which is destroying the entire tree for the old page and creating the tree for the new page.

## Problems

As you may imagine, no solution is perfect, and actually this solution has a couple of important problems. One problem is that it relies on the user assigning unique global `uid`s. If you ever render two `Reparentable` components at the same time with the same `uid`, the last one to mount will steal the DOM node from the other one, which is surely not what you want.

Another problem is the hacky way we have to know if the DOM node is going to be reparented: we keep the node alive for some time (in our case, we wait until the next event loop tick), and after that we unmount and remove the reference. But the truth is that we can never be sure if the node is going to be used again at any point in the future. So waiting "for a bit" is not reliable.

If you are interested in this problem, and similar related problems, I suggest you to go to this thread and read it:

[https://gist.github.com/chenglou/34b155691a6f58091953](https://gist.github.com/chenglou/34b155691a6f58091953)

There are some great ideas on how to solve this problem properly in that thread, and I hope that at some point those ideas become useful to bake a reparenting solution right inside React in the future.

This solution worked well for us, it’s far from perfect, but at least shows the idea behind reusing nodes with React instances mounted on them to support reparenting.

Hope you find this useful! If you had a similar problem and you solved it differently, be sure to leave a comment or tweet to me and share your approach.
