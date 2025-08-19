import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(name, email, password);
    navigate('/');
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-cream p-4">
      <div className="w-full max-w-md bg-surface p-8 sm:p-12 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-secondary">Create your Account</h1>
          <p className="text-muted mt-2">Join the community and start helping today.</p>
        </div>

        <a href="http://localhost:5000/api/auth/google" className="w-full flex items-center justify-center py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-300 font-semibold text-secondary">
          <FcGoogle className="mr-3 text-2xl" /> Sign Up with Google
        </a>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-200"/>
          <span className="mx-4 text-muted text-sm">OR</span>
          <hr className="flex-grow border-gray-200"/>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-secondary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-secondary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-secondary" required />
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-300 transform hover:scale-105 shadow-lg">
            Create Account
          </button>
        </form>
        <p className="text-center mt-8 text-sm text-muted">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-semibold">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;