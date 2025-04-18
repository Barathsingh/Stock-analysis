import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home({ setUsername }) {
  const [loginInput, setLoginInput] = useState({ username: "", password: "" });
  const [response, setResponse] = useState("");
  const [signupInput, setSignupInput] = useState({ username: "", password: "", repeatPassword: "" });
  const [signupResponse, setSignupResponse] = useState("");
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();
    fetch("http://127.0.0.1:5000/login", { 
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginInput), 
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data.message === "Login successful") {
          setUsername(loginInput.username);
          navigate("/Explore");
        } else {
          setResponse(data.error || "Login failed");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setResponse("Error fetching data");
      });
  };

  const handleSignup = (event) => {
    event.preventDefault();
    fetch("http://127.0.0.1:5000/signup", { 
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signupInput), 
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setSignupResponse(data.message || data.error);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setSignupResponse("Error fetching data");
      });
  };

  return (
    <div className='row' style={{'color':'rgb(60,60,60)'}}>
      <form onSubmit={handleLogin} className='col-6 p-5 pt-5'>
        <div className='row border border-warning border-3 rounded p-4'>
          <div className='d-flex justify-content-center'>
          <h3 className='border border-3 border-warning border-top-0 border-start-0 border-end-0 pb-2'>Login</h3>
          </div>
        <input
          type='text'
          placeholder="Username"
          value={loginInput.username}
          onChange={(e) => setLoginInput({ ...loginInput, username: e.target.value })}
          className='form-control mt-2'
        />
        <input
          type='password'
          placeholder="Password"
          value={loginInput.password}
          onChange={(e) => setLoginInput({ ...loginInput, password: e.target.value })}
          className='form-control mt-3'
        />
        <div className='d-flex justify-content-center'>
        <button type='submit' className='btn btn-warning mt-3'>Login</button>
        </div>
        </div>
      </form>

      <form onSubmit={handleSignup} className='col-6 p-5'>
        <div className='row border border-warning border-3 rounded p-4'>
          <div className='d-flex justify-content-center'>
          <div className='d-flex justify-content-center'>
          <h3 className='border border-3 border-warning border-top-0 border-start-0 border-end-0 pb-2'>Sign Up</h3>
          </div>
          </div>
        <input
          type='text'
          placeholder="Username"
          value={signupInput.username}
          onChange={(e) => setSignupInput({ ...signupInput, username: e.target.value })}
          className='form-control mt-2'
        />
        <input
          type='password'
          placeholder="Password"
          value={signupInput.password}
          onChange={(e) => setSignupInput({ ...signupInput, password: e.target.value })}
          className='form-control mt-3'
        />
        <input
          type='password'
          placeholder="Repeat Password"
          value={signupInput.repeatPassword}
          onChange={(e) => setSignupInput({ ...signupInput, repeatPassword: e.target.value })}
          className='form-control mt-3'
        />
        <div className='d-flex justify-content-center'>
        <button type='submit' className='btn btn-warning mt-3'>Signup</button>
        </div>
        </div>
      </form>

      <p>{response}</p>
      <p>{signupResponse}</p>

      <div className='mb-5 ms-2 me-2'>
        <div className='d-flex justify-content-center row'>
        <div className='d-flex justify-content-center'>
        <h3 className='border border-3 border-warning border-top-0 border-start-0 border-end-0 pb-2'>About Us</h3>
        </div>
        <p>Welcome to Stock Sage AI, where we transform stock market navigation with cutting-edge technology and expert insights. Our platform offers a dynamic Explore Page to keep you updated with today’s trending stock news and a Watchlist feature for tracking and monitoring your favorite stocks. Leveraging the power of our advanced Sage AI, we provide actionable recommendations to help you make informed decisions on whether to buy or sell based on real-time news analysis.</p>
        <p>In addition, our Portfolio Management tool enables you to track your returns and receive personalized advice from Sage AI on whether to adjust your positions. For an interactive experience, engage directly with Sage AI through our chat feature to discuss analyzed news and get tailored insights. At Stock Sage AI, we're dedicated to enhancing your investment strategy with the latest in AI-driven analysis and real-time market data.</p>
        </div>
      </div>

    </div>
  );
}

export default Home;
