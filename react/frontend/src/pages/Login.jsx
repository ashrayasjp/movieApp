import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../components/UserContext';

function Login() {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
      alert("Fill all fields");
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/api/users/login',
        { email, password },
        { withCredentials: true }
      );

      const loggedInUser = response.data.user;
      if (!loggedInUser) throw new Error("Invalid login response");

      setUser(loggedInUser); // update context
      window.dispatchEvent(new Event("userAuthChange")); // update header/diary/watchlist

      alert("Login successful!");
      navigate('/home');
    } catch (error) {
      alert(error.response?.data?.error || "Login failed");
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Login Page</h1>
      <form onSubmit={handleLogin}>
        Email: <input type="email" name="email" required />
        <br /><br />
        Password: <input type="password" name="password" required />
        <br /><br />
        <button type="submit">Submit</button>
      </form>
      <br />
      Don’t have an account? <Link to="/signup">Signup</Link>
    </div>
  );
}

export default Login;
