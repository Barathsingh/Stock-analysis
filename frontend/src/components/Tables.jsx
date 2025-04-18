import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal.jsx";
import './Tables.module.css'
import 'bootstrap/dist/css/bootstrap.min.css';

function Tables({ username }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState([]);
  const navigate = useNavigate(); 
  const [price, setPrice] = useState();

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
    const fetchWatchlist = async () => {
      try {
        const response = await fetch('http://localhost:5000/get_watchlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        });
        const result = await response.json();
        if (response.ok) {
          const watchlistWithPrices = await Promise.all(
            result.watchlist.map(async (item) => {
              const currPrice = await fetchPrice(item);
              return { symbol: item, currPrice };
            })
          );
          setData(watchlistWithPrices);
        } else {
          console.error('Error fetching watchlist', result.error);
        }
      } catch (error) {
        console.error('Error fetching watchlist', error);
      }
    };

    if (username) {
      fetchWatchlist();
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
      name: "CURR PRICE",
      selector: (row) => row.currPrice,
    },
    {
      name: "OPTIONS",
      selector: (row) => (
        <>
          <button className="remove-btn btn btn-danger me-3" onClick={() => removeSymbol(row)}>
            Remove
          </button>
          <button className="detail-btn btn btn-primary" onClick={() => moreDetails(row.symbol)}>
            More Details
          </button>
        </>
      ),
    },
  ];

  const removeSymbol = (rowToRemove) => {
    const filteredData = data.filter((row) => row !== rowToRemove); // Filter out the row to remove
    setData(filteredData); // Update data state with filtered data

    // Also remove the item from the user's watchlist in the database
    try {
      fetch('http://localhost:5000/remove_from_watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          item: rowToRemove.symbol,
        }),
      });
    } catch (error) {
      console.error('Error removing item from watchlist', error);
    }
  };

  const updateData = async (selectedOption) => {
    const newPrice = await fetchPrice(selectedOption);
    const newData = [...data, { symbol: selectedOption, currPrice: newPrice }];
    setData(newData);

    try {
      const response = await fetch('http://localhost:5000/add_to_watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          item: selectedOption,
        }),
      });
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error('Error adding item to watchlist', error);
    }
  };

  return (
    <>
      <div className="container">
        <button onClick={() => setIsModalOpen(true)} className="btn btn-warning">Add Symbol</button>
        <hr />
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onOptionSelect={(selectedOption) => {
            updateData(selectedOption);
            setIsModalOpen(false);
          }}
        >
          Select an item to add to your watchlist
        </Modal>
        <div className="tablecontainer">
          <DataTable 
            columns={columns} 
            data={data} 
            className="bold-table" 
          />
        </div>
      </div>
    </>
  );
}

export default Tables;
