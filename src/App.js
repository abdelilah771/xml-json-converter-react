import React, { useState } from 'react';
import { parse } from './parser'; // Import the generated parser
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setError('');
    setOutput('');
  };

  const handleConvert = () => {
    try {
      const result = parse(input); // Use the parser to convert input
      setOutput(JSON.stringify(result, null, 2)); // Display the result
      setError('');
    } catch (err) {
      setError(err.message); // Display any parsing errors
      setOutput('');
    }
  };

  return (
    <div className="App">
      <h1>JSON ↔ XML Converter</h1>
      <textarea
        placeholder="Enter JSON or XML here..."
        value={input}
        onChange={handleInputChange}
      />
      <button onClick={handleConvert}>Convert</button>
      {error && <p className="error">Error: {error}</p>}
      {output && (
        <div className="output">
          <h2>Output:</h2>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
}

export default App;