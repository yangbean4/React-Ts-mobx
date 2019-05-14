import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // 类似componentDidMount 和 componentDidUpdate:
  useEffect(() => {
    debugger
    console.log('13345')
    // Update the document title using the browser API
    document.title = `You clicked ${count} times`;
    return () => {
      console.log('go ')
      debugger
      document.title = `one title`
    }
  });

  const handelCK = () => {
    debugger
    setCount(count + 1)
    debugger
  }

  return (
    <div>
      <p>You clicked {count} times < /p>
      <button onClick={() => handelCK()}>
          Click me
    </button>
    </div>
      );
}
 
export default Example