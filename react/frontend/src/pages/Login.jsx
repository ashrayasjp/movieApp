import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Home from './Home.jsx'
import Signup from './Signup.jsx'

function Login() {
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    const form = e.target
    const email = form.email.value.trim()
    const password = form.password.value.trim()

    if (!email || !password) {
      alert("Fill all fields")
      return
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/api/users/login',
        { email, password },
        { withCredentials: true }
      )

      const { username, email: uemail } = response.data

      localStorage.setItem('username', username)  
      localStorage.setItem('email', uemail)       

      alert("Login successful!")
      navigate('/home')
      window.dispatchEvent(new Event('userAuthChange'))

    } catch (error) {
      alert(error.response?.data?.error || "Error occurred during login")
      console.error(error)
    }
  }

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
      Don’t have an account? <Link to="/Signup">Signup</Link>
    </div>
  )
}


export default Login
