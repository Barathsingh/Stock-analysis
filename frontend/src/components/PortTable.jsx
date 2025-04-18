import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import PortModal from "./PortModal.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import './PortTable.css';

function PortTable({ username }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const fetchPrice = async (symbol) => {
    try {
      const response = await fetch(`http://localhost:5000/get_current_price/${symbol}`);
      const result = await response.json();
      return result.price;
    } catch (error) {
      console.error('Error fetching price', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch('http://localhost:5000/get_portfolio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        });
        const result = await response.json();
        if (response.ok) {
          const portfolioWithPrices = await Promise.all(
            result.portfolio.map(async (item) => {
              const currPrice = await fetchPrice(item.symbol);
              return { ...item, currPrice };
            })
          );
          setData(portfolioWithPrices);
        } else {
          console.error('Error fetching portfolio', result.error);
        }
      } catch (error) {
        console.error('Error fetching portfolio', error);
      }
    };

    if (username) {
      fetchPortfolio();
    }
  }, [username]);

  const moreDetails = (symbol) => {
    navigate(`/Symboldetails/${symbol}`);
  };

  const columns = [
    {
      name: "SYMBOL",
      selector: (row) => row.symbol,
    },
    {
      name: "BUY PRICE",
      selector: (row) => row.buyPrice,
    },
    {
      name: "CURR PRICE",
      selector: (row) => row.currPrice,
    },
    {
      name: "RETURN",
      selector: (row) => (row.currPrice - row.buyPrice).toFixed(2), // Calculate return and format to 2 decimal places
    },
    {
      name: "OPTIONS",
      selector: (row) => (
        <>
          <div className="optionContainer">
          <button className="remove-btn btn btn-danger me-3" onClick={() => removeSymbol(row)}>
            <b>X</b>
          </button>
          <button className="detail-btn btn btn-primary" onClick={() => moreDetails(row.symbol)}>
            <b>Sage AI</b>
          </button>
          </div>
        </>
      ),
    },
  ];

  const removeSymbol = (rowToRemove) => {
    const filteredData = data.filter((row) => row !== rowToRemove);
    setData(filteredData);

    try {
      fetch('http://localhost:5000/remove_from_portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          symbol: rowToRemove.symbol,
        }),
      });
    } catch (error) {
      console.error('Error removing item from portfolio', error);
    }
  };

  const updateData = async (selectedOption) => {
    const newPrice = await fetchPrice(selectedOption.symbol);
    const newData = [...data, { symbol: selectedOption.symbol, buyPrice: selectedOption.buyPrice, currPrice: newPrice }];
    setData(newData);

    try {
      const response = await fetch('http://localhost:5000/add_to_portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          symbol: selectedOption.symbol,
          buyPrice: selectedOption.buyPrice,
        }),
      });
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error('Error adding item to portfolio', error);
    }
  };

  return (
    <>
      <div className="container mt-5">
        <button onClick={() => setIsModalOpen(true)} className="btn btn-warning">Add Symbol</button>
        <hr />
        <PortModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onOptionSelect={(selectedOption) => {
            updateData(selectedOption);
            setIsModalOpen(false);
          }}
        >
          Select Symbol to Add
        </PortModal>
        <div className="tablecontainer">
        <DataTable columns={columns} data={data} className="bold-table" />
        </div>
      </div>
    </>
  );
}

export default PortTable;
