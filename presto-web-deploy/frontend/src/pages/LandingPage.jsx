import { useNavigate } from 'react-router-dom';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-6xl font-bold text-gray-900">Welcome to Presto</h1>
        <p className="text-xl text-gray-600">A lightweight presentation slides creator</p>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};