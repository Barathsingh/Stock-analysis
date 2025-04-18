import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Card from "./components/Card.jsx";
import SageModal from "./components/SageModal.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';

function Symboldetail() {
    const { id } = useParams();
    const [analysedResult, setAnalysedResult] = useState({});
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        // Try to get data from sessionStorage first
        const storedData = sessionStorage.getItem(`analysis_${id}`);
        if (storedData) {
            setAnalysedResult(JSON.parse(storedData));
            setLoading(false);
        } else {
            getAnalysis(id);
        }
    }, [id]);

    const getAnalysis = async (symbol) => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/get_ai_analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ symbol }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // Save fetched data to sessionStorage
            sessionStorage.setItem(`analysis_${symbol}`, JSON.stringify(data));

            // Debugging
            console.log('Fetched data:', data);

            setAnalysedResult(data);
        } catch (error) {
            console.error('Error fetching AI analysis:', error);
        } finally {
            setLoading(false);
        }
    };

    const analysedResult2 = analysedResult[id] || [];

    return (
        <>
            <div className="d-flex justify-content-center">
            <h1 className="mt-3 border border-3 border-top-0 border-start-0 border-end-0 border-warning pb-3" style={{'color':'rgb(60,60,60)'}}><b>Sage AI Analysis: {id}</b></h1>
            </div>
            <SageModal isOpen={isModalOpen} onClose={handleCloseModal} passsymbol={id}>
                Select an item to add to your watchlist
            </SageModal>
            <button onClick={handleAddClick} className="btn btn-warning mt-4">Ask Sage</button>
            <hr />
            <div>
                {loading ? (
                    <p>Please wait, this may take a few minutes, Loading...</p>
                ) : analysedResult2.length > 0 ? (
                    analysedResult2.map((result, index) => (
                        <Card
                            key={index}
                            label={result.summary}
                            link={result.link}
                            score={result.score}
                            sentiment={result.label}
                        />
                    ))
                ) : (
                    <p>No analysis available.</p>
                )}
            </div>
        </>
    );
}

export default Symboldetail;
