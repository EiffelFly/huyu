// import React from 'react'
// import ReactDOM from 'react-dom'
// import './index.css'
// import App from './App'

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// )

import { render } from "../../packages/huyu-core/src/reconcile";
import { createElement } from "../../packages/huyu-core/src/create-element";

const vNode = createElement("div", {}, []);
render(vNode, document.getElementById("root"))
