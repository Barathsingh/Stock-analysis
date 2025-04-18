import React, { useState, useEffect } from "react";
// import './../App.css';
import symbols from './symbols.json';
import 'bootstrap/dist/css/bootstrap.min.css';
import './PortModal.module.css';

function PortModal({ children, isOpen, onClose, onOptionSelect }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [buyPrice, setBuyPrice] = useState("");
  const [options, setOptions] = useState([]);

  useEffect(() => {
    setOptions(symbols);
  }, []);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleBuyPriceChange = (event) => {
    setBuyPrice(event.target.value);
  };

  const handleChange = () => {
    if (onOptionSelect) {
      onOptionSelect({ symbol: selectedOption, buyPrice });
    }
    onClose();
  };

  return isOpen ? (
    <>
      <div className="modal-container row">
        <h3 className="border border-3 border-top-0 border-start-0 border-end-0 border-warning pb-3">{children}</h3>
        <div className="inputContainer row">
        <select name="modal-select" id="modal-select" onChange={handleOptionChange} className="form-select form-select-md mt-4">
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Enter buy price"
          value={buyPrice}
          onChange={handleBuyPriceChange}
          className="form-control mt-3"
        />
        <div className="btncontainer d-flex justify-content-between">
        <button onClick={handleChange} className="btn btn-warning mt-4">Add</button>
        <button className="close-button btn btn-danger mt-4" onClick={onClose}>Close</button>
        </div>
        </div>
      </div>
    </>
  ) : null;
}

export default PortModal;
