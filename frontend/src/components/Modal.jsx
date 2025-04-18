import React, { useState, useEffect } from "react";
import './Modal.module.css';
import symbols from './symbols.json';
import 'bootstrap/dist/css/bootstrap.min.css';

function Modal({ children, isOpen, onClose, onOptionSelect }) {
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    setOptions(symbols);
  }, []);

  const handleSymbolChange = (event) => {
    setSelectedSymbol(event.target.value);
  };

  const handleChange = () => {
    if (onOptionSelect) {
      onOptionSelect(selectedSymbol);
    }
    onClose();
  };

  return isOpen ? (
    <>
      <div className="modal-container rounded">
        <div>
        <h3 className="border border-3 border-top-0 border-start-0 border-end-0 border-botton border-warning pb-3">{children}</h3>
        <div className="inputcontainer mt-2">
        <select name="modal-select" id="modal-select" onChange={handleSymbolChange} className="form-select form-select-md mt-4">
          <option value="" disabled selected>Select a symbol</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="btncontainer d-flex justify-content-between">
        <button onClick={handleChange} className="btn btn-warning mt-4">Add</button>
        <button className="close-button btn btn-danger mt-4" onClick={onClose}>Close</button>
        </div>
        </div>
        </div>
      </div>
    </>
  ) : null;
}

export default Modal;
