import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewPresentationModal, PresentationCard } from '../features/presentations';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [showNewModal, setShowNewModal] = useState(false);
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPresentations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5005/store', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setPresentations(data.store.presentations || []);
    } catch (error) {
      console.error('Failed to fetch presentations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePresentation = async (name) => {
    try {
      const token = localStorage.getItem('token');
      const store = await fetch('http://localhost:5005/store', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }).then(res => res.json());

      const newPresentation = {
        id: Date.now().toString(),
        name,
        slides: [{ 
          id: '1', 
          elements: [], 
        }], // Empty first slide
      };

      const updatedStore = {
        ...store.store,
        presentations: [...(store.store.presentations || []), newPresentation],
      };

      await fetch('http://localhost:5005/store', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ store: updatedStore }),
      });

      fetchPresentations();
    } catch (error) {
      console.error('Failed to create presentation:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5005/admin/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      localStorage.removeItem('token');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    fetchPresentations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Presentations</h1>
          <div className="space-x-4">
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              New Presentation
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading presentations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {presentations.map((presentation) => (
              <PresentationCard
                key={presentation.id}
                presentation={presentation}
                onClick={() => navigate(`/presentation/${presentation.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <NewPresentationModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSubmit={handleCreatePresentation}
      />
    </div>
  );
};