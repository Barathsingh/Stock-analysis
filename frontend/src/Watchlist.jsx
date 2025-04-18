
import React, { useState } from "react";
// import Navbar from "./components/Navbar";
import Tables from "./components/Tables";
// import GetData from "./components/GetData";
import Modal from "./components/Modal";
import './Watchlist.css'

function Watchlist({ username }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleOptionSelect = async (selectedOption) => {
        console.log(`Selected option: ${selectedOption}`);
        await addToWatchlist(username, selectedOption);
        setIsModalOpen(false);
    };

    const addToWatchlist = async (username, item) => {
        try {
            const response = await fetch('http://localhost:5000/add_to_watchlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    item: item,
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
            <div className="watchlistcontainer">
            <h1 className="subheading"><b>Track the Stock</b></h1>
            </div>
            <Tables username={username} />
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} onOptionSelect={handleOptionSelect} click={handleAddClick}>
                Select an item to add to your watchlist
            </Modal>
        </>
    );
}

export default Watchlist;
