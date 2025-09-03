import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Signup() {
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value.trim();
    const confirmpassword = form.confirmpassword.value.trim();
    const email = form.email.value.trim(); 

    if (!username || !password || !confirmpassword || !email) {
      alert("Fill all required fields");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmpassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/api/users/signup',
        { username, password, email },  
        { withCredentials: true }
      );

      // Store both username and email in localStorage
      const { username: uname, email: uemail } = response.data;
      localStorage.setItem('username', uname);
      localStorage.setItem('email', uemail);

      alert("Signup successful!");
      navigate('/home');

    
      window.dispatchEvent(new Event('userAuthChange'));

    } catch (error) {
      alert(error.response?.data?.error || "Error occurred during signup");
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Signup Page</h1>
      <form onSubmit={handleSignup}>
        Username <input type="text" name="username" required />
        <br /><br />
        Email <input type="email" name="email" required />
        <br /><br />
        Password <input type="password" name="password" required />
        <br /><br />
        Confirm Password <input type="password" name="confirmpassword" required />
        <br /><br />
        <button type="submit">Submit</button>
      </form>
      <br />
      Already have an account? <Link to="/login">Login</Link>
    </div>
  );
}

export default Signup;
