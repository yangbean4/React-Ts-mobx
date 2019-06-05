import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // 类似componentDidMount 和 componentDidUpdate:
  useEffect(() => {
    console.log('13345')
    // Update the document title using the browser API
    document.title = `You clicked ${count} times`;
    return () => {
      console.log('go ')
      document.title = `one title`
    }
  });

  const handelCK = () => {
    setCount(count + 1)
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