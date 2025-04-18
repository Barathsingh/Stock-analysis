import React, { useState } from "react";
import Navbar from "./components/Navbar";
import PortTable from "./components/PortTable";
import GetData from "./components/GetData";
import PortModal from "./components/PortModal";
import './Portfolio.css'

function Portfolio({ username }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleOptionSelect = async (selectedOption) => {
        console.log(`Selected option: ${selectedOption.symbol} at price ${selectedOption.buyPrice}`);
        await addToPortfolio(username, selectedOption.symbol, selectedOption.buyPrice);
        setIsModalOpen(false);
    };

    const addToPortfolio = async (username, symbol, buyPrice) => {
        console.log(username);
        try {
            const response = await fetch('http://localhost:5000/add_to_portfolio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    symbol: symbol,
                    buyPrice: buyPrice,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'An unknown error occurred');
            }
            const data = await response.json();
            console.log(data.message);
        } catch (error) {
            console.error('Error adding item to portfolio', error.message);
        }
    };

    return (
        <>
            <div className="headingcontainer">
            <h1 className="heading"><b>My Positions</b></h1>
            </div>
            <PortTable username={username} />
            <PortModal isOpen={isModalOpen} onClose={handleCloseModal} onOptionSelect={handleOptionSelect} click={handleAddClick}>
                Select an item to add to your portfolio
            </PortModal>
        </>
    );
}

export default Portfolio;
