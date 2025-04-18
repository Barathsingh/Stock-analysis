import React from "react";
import './NewsCard.css'

function NewsCard({ date, header, content, link }) {
  return (
    <div className="newscontainer">
      <p className="date"><b>{date}</b></p>
      <h4 className="header">{header}</h4>
      <p className="content">{content}</p>
      <hr className="line"/>
      <p className="link"><a href={link} target="_blank" rel="noopener noreferrer">Read more</a></p>
    </div>
  );
}

export default NewsCard;
