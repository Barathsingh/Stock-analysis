import React from "react";

function Card({ label, link, score, sentiment }) {
    // Determine text and background color based on sentiment
    const isNegative = sentiment.toLowerCase() === 'negative';
    const displayText = isNegative ? 'SELL' : 'BUY';
    const backgroundColor = isNegative ? 'red' : 'green';
    const formattedScore = (score*100).toFixed(2);

    return (
        <>
            <div className="rounded p-3" style={{ backgroundColor: 'rgb(245,245,245)' }}>
                <div className="d-flex">
                    <div 
                        className="p-2 rounded" 
                        style={{ 
                            backgroundColor: backgroundColor,  
                            fontWeight: '700', 
                            color: 'white' 
                        }}
                    >
                        {displayText}: {formattedScore}
                    </div>
                </div>
                <hr style={{'color':'#fcc400', 'border':'solid 0.07rem #fcc400', 'opacity':'100%'}}/>
                <p className="mb-0 mt-2" style={{'font-weight':'700', 'font-size':'1.1rem', 'color':'rgb(160,160,160)'}}>Analysis</p>
                <p className="mt-0" style={{'font-weight':'700', 'font-size':'1.1rem', 'color':'rgb(40,40,40)'}}>{label}</p>
                <hr style={{'color':'#fcc400', 'border':'solid 0.07rem #fcc400', 'opacity':'100%'}}/>
                <p><a href={link} target="_blank" rel="noopener noreferrer" style={{'font-weight':'700', 'color':'#fcc400'}}>Link</a></p>
            </div>
            <hr />
        </>
    );
}

export default Card;
