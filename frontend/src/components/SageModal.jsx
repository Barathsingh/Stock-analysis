import React, { useState, useEffect } from "react";

function SageModal({ isOpen, onClose, passsymbol }) {
  const [symbol, setSymbol] = useState(passsymbol);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [indexLoaded, setIndexLoaded] = useState(false); 
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    if (isOpen) {
      loadIndex();
    }
  }, [isOpen]);

  const loadIndex = async () => {
    try {
      const response = await fetch('http://localhost:5000/load_index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(symbol),
      });
      if (response.ok) {
        setIndexLoaded(true);
        alert('Index loaded successfully');
      } else {
        console.error('There was an error loading the index!');
        setIndexLoaded(false); 
      }
    } catch (error) {
      console.error('There was an error loading the index!', error);
      setIndexLoaded(false); 
    }
  };

  const askQuestion = async () => {
    setLoading(true); // Set loading to true before starting the request
    try {
      const response = await fetch('http://localhost:5000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: question }),
      });
      if (response.ok) {
        const data = await response.json();
        setResponse(data);
      } else {
        console.error('There was an error asking the question!');
      }
    } catch (error) {
      console.error('There was an error asking the question!', error);
    } finally {
      setLoading(false); // Set loading to false after the request completes
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    askQuestion();
  };

  return isOpen ? (
    <div className="modal-container row rounded">
      <div className="d-flex justify-content-center">
        <h3 className="border border-warning border-3 border-top-0 border-start-0 border-end-0 pb-2" style={{'color':'rgb(60,60,60)'}}>Chat with Sage</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <p style={{'color':'rgb(60,60,60)'}}>Ask your question:</p>
        <input 
          type="text" 
          value={question} 
          onChange={(e) => setQuestion(e.target.value)} 
          className="form-control"
        />
        <div className="mt-4 d-flex justify-content-between">
          <button type="submit" disabled={!indexLoaded} className="btn btn-warning">Ask</button>
          <button onClick={onClose} className="btn btn-danger">Close</button>
        </div>
      </form>
      <div className="mt-3">
        {loading ? (
          <p style={{'color':'rgb(60,60,60)'}}>Generating Response...</p>
        ) : response ? (
          <div>
            <h2>Response</h2>
            <p style={{'color':'rgb(60,60,60)'}}><b style={{'color':'rgb(180, 180,180)'}}>Sage:</b> {response}</p>
          </div>
        ) : null}
      </div>
    </div>
  ) : null;
}

export default SageModal;
