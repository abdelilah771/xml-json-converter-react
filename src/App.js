import React, { useState } from 'react';
import { parse } from './parser'; // Import the generated parser
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  // Handle input change and reset output/error
  const handleInputChange = (e) => {
    setInput(e.target.value);
    setError('');
    setOutput('');
  };

  // Handle conversion
  const handleConvert = () => {
    try {
      // Ensure input is a string and trim whitespace
      const trimmedInput = String(input).trim();

      if (!trimmedInput) {
        throw new Error('Input is empty. Please provide valid JSON or XML.');
      }

      if (trimmedInput.startsWith('{')) {
        // Assume it's JSON input, convert to XML
        const json = JSON.parse(trimmedInput); // Parse JSON
        const xml = jsonToXml(json); // Convert JSON to XML
        setOutput(xml);
      } else if (trimmedInput.startsWith('<')) {
        // Assume it's XML input, convert to JSON
        const result = parse(trimmedInput); // Parse XML input
        setOutput(JSON.stringify(result, null, 2));
      } else {
        throw new Error('Invalid input format. Input must start with "{" for JSON or "<" for XML.');
      }

      setError('');
    } catch (err) {
      // Display parsing errors
      setError(`Parsing error: ${err.message}`);
      setOutput('');
    }
  };

  // Helper function to convert JSON to XML
  const jsonToXml = (json) => {
    const convert = (obj) => {
      if (typeof obj !== 'object' || obj === null) {
        return obj; // Return value if not an object
      }

      if (Array.isArray(obj)) {
        return obj.map((item) => convert(item)).join(''); // Handle arrays
      }

      return Object.entries(obj)
        .map(([key, value]) => `<${key}>${convert(value)}</${key}>`)
        .join('');
    };

    return convert(json);
  };

  return (
    <div className="App">
      <h1>JSON ↔ XML Converter</h1>
      <textarea
        placeholder="Enter JSON or XML here..."
        value={input}
        onChange={handleInputChange}
        rows="10"
        cols="50"
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
