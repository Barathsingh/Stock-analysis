import React, { useState, useEffect } from "react";

function GetData() {
  const [data, setData] = useState("Loading...");

  useEffect(() => {
    fetch("http://127.0.0.1:5000")
      .then((response) => response.text())
      .then((text) => {
        setData(text);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setData("Error fetching data");
      });
  }, []);

  return (
    <>
      <h1>{data}</h1>
    </>
  );
}

export default GetData;
