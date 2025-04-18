import React from "react";

function Footer() {
    return (
        <div className="footer " style={{'padding-left':'.75rem', 'padding-right':'.75rem'}}>
            <div className="row p-2" style={{ backgroundColor: 'rgb(49,49,49)', color: 'white'}}>
                <div className="col-6 d-flex justify-content-start">
                    <h4 className="mb-0 pt-2" style={{ fontSize: '1.2rem' }}>Made By: Barathsingh</h4>
                </div>
                <div className="col-6 d-flex justify-content-end">
                    <h4><span style={{ fontSize: '1.2rem' }}>Powered by:</span> <a href="https://www.youdata.ai/home" className="btn btn-warning">youdata.ai</a></h4>
                </div>
            </div>
        </div>
    );
}

export default Footer;
