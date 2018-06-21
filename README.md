# React Over

A library for positioning elements that appear _over_ the rest of your application. Great for modals,
dropdowns, tooltips, flyovers, and more.

Features include:

✓ **Animation hooks**: Build sophisticated transitions with ease  
✓ **Scroll locking**: Optionally disable scrolling when an over element is displayed  
✓ **Always-visible**: Ensure that an over element never leaves the viewport  
✓ **Close on scroll**: Automatically close an over element when the application scrolls some amount

## Installation

Install using [npm](https://www.npmjs.com):

```
npm install react-over
```

or [yarn](https://yarnpkg.com/):

```
yarn add react-over
```

## Concepts

There are three concepts in React Over. Each concept represents a specific DOM element.

**Over Element**

A DOM element that appears over top of the rest of your application. You get to declare where to render
the element, and how it behaves.

Technically, an over element is an empty div with no dimensions. You are able to render whatever you would like
inside of the over element.

**Target Element**

A target element is a DOM node on the page that the Over Element is positioned relative to.

For example, dropdowns typically appear beneath an input of some kind. In that situation, the Target Element
would be the input. Modals, on the other hand, are typically centered in the viewport. In that case, the Target
Element would be the window.

**Trigger Element**

This is the element that causes the Over Element to appear or disappear. Usually, the Trigger Element and
the Target Element are the same element, but in some situations, they can be different.

For instance, if you click a button to open a modal, then the Trigger Element would be the button, and the
Target Element would be the window.

## Getting Started

Once you have an understanding of the three concepts in React Over, you are ready to start coding.

React Over is implemented using the [React Context API](https://reactjs.org/docs/context.html). This is a relatively new API,
but don't worry if this is your first time using it. If I was able to learn it, then you can, too.

There are two Components in the React Over API: a
[_Provider_](https://reactjs.org/docs/context.html#provider), and a
[_Consumer_](https://reactjs.org/docs/context.html#consumer). Within your application, you render a
single Provider, and then a Consumer anytime you wish to open an Over Element.

### The Over Provider

Every application that uses React Over needs to render exactly _one_ Over Provider.

Place the Over Provider somewhere high up in your application. Because Over Elements can only
appear anywhere within the Provider, it makes sense to place the Over Provider near to the root.

```js
import React from 'react';
import ReactDOM from 'react-dom';
import Over from './react-over';

ReactDOM.render(
  <Over.Provider>
    <App />
  </Over.Provider>,
  document.getElementById('root')
);
```

### The Over Consumer

To open an Over Element, begin by rendering Over Consumer. Like other Context Consumers, you will pass a function as the children
to the Consumer, and your function will receive a single argument, an object with these properties:

| Property name | Type     | Purpose                |
| ------------- | -------- | ---------------------- |
| `openOver`    | Function | Opens an Over Element  |
| `closeOver`   | Function | Closes an Over Element |

We will cover these arguments in depth shortly, but first, here is some code showing how to use the Over Consumer.

```js
import React from 'react';
import Over from 'react-over';

export default class MyComponent extends Component {
  render() {
    return (
      <Over.Consumer>
        {({ openOver, closeOver }) => {
          console.log('Got the values', openOver, closeOver);
        }}
      </Over.Consumer>
    );
  }
}
```

#### `openOver( triggerEl, targetEl, overChildren, config )`

Opens an over element. The arguments are as follows:

| Property name         | Type                                                                              | Default  | Required | Description                                                                                                                                                                                          |
| --------------------- | --------------------------------------------------------------------------------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `triggerEl`           | Node                                                                              |          | Yes      | The Trigger Element                                                                                                                                                                                  |
| `targetEl`            | Node                                                                              |          | Yes      | The Target Element                                                                                                                                                                                   |
| `overChildren`        | [React Element](https://reactjs.org/docs/glossary.html#elements)                  |          | Yes      | The children to render within the Over Element                                                                                                                                                       |
| `id`                  | String                                                                            |          | Yes      | A unique ID for this Over Element                                                                                                                                                                    |
| `disableScroll`       | Boolean                                                                           | true     | Yes      | Whether or not to disable scrolling when this Over Element is visible                                                                                                                                |
| `delay`               | Number                                                                            | 0        | No       | A time, in milliseconds, to wait before opening or closing the Over Element                                                                                                                          |
| `overlay`             | Boolean, String, [React Element](https://reactjs.org/docs/glossary.html#elements) | false    | No       | Pass `true` to render a transparent overlay behind the Over. Pass a String to render an overlay with that value as the background color. Pass a React Element to render that element as the overlay. |
| `closeOnClickOutside` | Boolean                                                                           | false    | No       | Whether or not to automatically close the Over Element when you click outside of it                                                                                                                  |
| `closeOnScroll`       | Boolean, Number                                                                   | false    | No       | Pass `true` to close the element when the page scrolls. Pass a number to close the Over Element when the page scrolls that amount (in pixels).                                                       |
| `position`            | String, Array                                                                     | "top"    | No       | Where to position the over element relative to the target element. For more, refer to the guide on positioning                                                                                       |
| `origin`              | String, Array                                                                     | "bottom" | No       | The origin to use for the position. For more, refer to the guide on positioning                                                                                                                      |
| `animation`           | Object                                                                            |          | No       | An object where you can specify callbacks to help with animating your Over Element in and out. For more, refer to the guide on animations                                                            |

The supported `animation` options are:

| Option name        | Type     | Default | Required | Description                                                            |
| ------------------ | -------- | ------- | -------- | ---------------------------------------------------------------------- |
| componentWillEnter | Function |         | No       | A function that is called just before the Over Element begins to open  |
| componentDidEnter  | Function |         | No       | A function that is called immediately after the Over Element opens     |
| componentWillLeave | Function |         | No       | A function that is called just before the Over Element begins to close |
| componentDidLeave  | Function |         | No       | A function that is called immediately after the Over Element closes    |

To learn how to use these options, refer to the animation guides.
