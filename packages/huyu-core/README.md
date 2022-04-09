## 1. Define type

Define the necessary types: VNode, Ref, Component children type, Key.

## Fundamental function: CreateElement, render

- We want our element to have same shapte

```js

// We don't want this
{
  type: "div",
  props: {
    children: [
      {
        type: "h1",
        props: {
          children: ["This is a Text node"]
        }
      }
    ]
  }
}

// We want this
{
  type: "div",
  props: {
    children: [
      {
        type: "TEXT",
        props: {
          nodeValue: "This is a Text node",
          children: []
        }
      }
    ]
  }
}
```
