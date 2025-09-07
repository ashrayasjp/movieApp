import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../components/UserContext';
import { useState } from 'react';

function Signup() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!username || !email || !password || !confirmPassword) {
      alert("Fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      // 1. Signup
      await axios.post(
        'http://localhost:8080/api/users/signup',
        { username, email, password },
        { withCredentials: true }
      );

      // 2. Auto-login
      const loginResponse = await axios.post(
        'http://localhost:8080/api/users/login',
        { email, password },
        { withCredentials: true }
      );

      const loggedInUser = loginResponse.data.user;
      if (!loggedInUser) throw new Error("Login failed after signup");

      // 3. Set user in context and localStorage
      setUser(loggedInUser);
      localStorage.setItem("username", loggedInUser.username);

      // 4. Notify other components (like header, diary, watchlist)
      window.dispatchEvent(new Event("userAuthChange"));

      alert("Signup & Login successful!");
      navigate('/home'); // redirect to home
    } catch (error) {
      alert(error.response?.data?.error || "Error occurred during signup/login");
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Signup Page</h1>
      <form onSubmit={handleSignup}>
        Username: <input type="text" name="username" required /><br /><br />
        Email: <input type="email" name="email" required /><br /><br />
        Password: <input type="password" name="password" required /><br /><br />
        Confirm Password: 
        <input
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        /><br /><br />
        <button type="submit">Submit</button>
      </form>
      <br />
      Already have an account? <Link to="/login">Login</Link>
    </div>
  );
}

export default Signup;
