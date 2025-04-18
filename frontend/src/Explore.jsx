import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import NewsCard from "./components/NewsCard";
import './Explore.css'

function Explore() {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    const fetchNews = async () => {
      const date = new Date();
      const currentDate = {
        day: date.getDate(),
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
      };

      try {
        const response = await fetch('http://localhost:5000/explore_news', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(currentDate),
        });

        if (response.ok) {
          const data = await response.json();
          setNews(data);
          sessionStorage.setItem('newsData', JSON.stringify(data));
        } else {
          throw new Error('Failed to fetch news');
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      }
    };

    const newsData = sessionStorage.getItem('newsData');
    if (newsData) {
      setNews(JSON.parse(newsData));
    } else {
      fetchNews();
    }
  }, []);

  return (
    <>
      <div className="explorecontainer"><h1 className="subheading"><b>Top Headlines Today</b></h1></div>
      {error ? (
        <p>Error: {error}</p>
      ) : (
        news.map((newsItem, index) => (
          <NewsCard
            key={index}
            date={newsItem.date}
            header={newsItem.header}
            content={newsItem.content}
            link={newsItem.link}
          />
        ))
      )}
    </>
  );
}

export default Explore;
