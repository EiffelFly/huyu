import { render, Fragment } from "@huyu/core";

// const Button = () => {
//   return (
//     <button
//       key="button"
//       className="hi"
//       disabled={true}
//       style={{
//         width: "100px",
//         display: "flex",
//         padding: "12px",
//         backgroundColor: "grey",
//         color: "white",
//       }}
//     >
//       <p
//         onClick={() => {
//           console.log("hello");
//         }}
//         aria-hidden={true}
//         style={{ margin: "0 auto", color: "honeydew" }}
//       >
//         Click mes
//       </p>
//     </button>
//   );
// };

// const InputField = () => {
//   return (
//     <input
//       key="input-field-a"
//       type="text"
//       style={{ border: "1px solid black", marginBottom: "20px" }}
//     />
//   );
// };

// const TextArea = () => {
//   return <textarea rows={5} style={{ border: "1px solid grey" }} />;
// };

// const Text = () => {
//   return (
//     <div>
//       <InputField />
//       <Button />
//     </div>
//   );
// };

// const WeirdArray = () => {
//   return (
//     <>
//       {[
//         <>
//           <h1>hi</h1>
//           <>
//             <p>yes!</p>
//           </>
//         </>,
//       ]}
//     </>
//   );
// };

// const NestedArray = () => {
//   return (
//     <div>
//       {[
//         <p>foo</p>,
//         <p>bar</p>,
//         [
//           <p>baaa</p>,
//           [
//             <p>shit</p>,
//             <>
//               <p>hi nested</p>
//             </>,
//           ],
//         ],
//       ]}
//     </div>
//   );
// };

// console.log(<Text />);

// const Container = () => {
//   return (
//     <>
//       <div style={{ marginBottom: "20px" }}>
//         <h1>hi, this is huyu</h1>
//         <h2>hi, I am header 2</h2>
//         <h3>hi, I am header 3</h3>
//         <h4>hi, I am header 4</h4>
//         <h5>hi, I am header 5</h5>s
//       </div>
//       <div>
//         <InputField />
//         <TextArea />
//         <Button />
//       </div>
//       <div>
//         <a href="https://github.com/EiffelFly/huyu">huyu</a>
//       </div>
//       <>
//         {[0, 1, 2, 3].map((e) => (
//           <div>
//             {[0, 1].map((e) => (
//               <p>{`hi-${e}`}</p>
//             ))}
//           </div>
//         ))}
//       </>
//       <>
//         <>
//           <NestedArray />
//         </>
//         <>
//           <WeirdArray />
//         </>
//       </>
//     </>
//   );
// };

// const Foo = () => {
//   return (
//     <div>
//       <p>hi</p>
//       <p>yo</p>
//       <WeirdArray />
//     </div>
//   );
// };

// render(<Foo />, document.getElementById("root"));

// const Bar = () => {
//   return (
//     <div>
//       <Text />
//       <WeirdArray />
//     </div>
//   );
// };

const handle = () => {
  console.log("Hi");
};

const Test = <div>hi</div>;

const Button = () => {
  return (
    <button id="test" class="hi-button" onClick={handle}>
      Click me
    </button>
  );
};

render(<Test />, document.body);
