import React from 'react';
import { Link } from 'react-router-dom';

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center text-center text-white overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 animate-gradient">
      
      {/* Smooth animated background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -right-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center px-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent animate-text-gradient">
            Sahayata
          </span>{' '}
          Community
        </h1>
        <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl">
          A place to connect with your neighbors, ask for help, and lend a hand. Grow together and make your
          community stronger.
        </p>
        <Link
          to="/signup"
          className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-full text-lg shadow-2xl shadow-indigo-600/40 transition-all duration-500 transform hover:scale-105"
        >
          Join the Community <ArrowRightIcon />
        </Link>
        <p className="text-sm text-slate-400 mt-6">Join 1,000+ neighbors making a difference.</p>
      </div>
    </div>
  );
};

export default Hero;
