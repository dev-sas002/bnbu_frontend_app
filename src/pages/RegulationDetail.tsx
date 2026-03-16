import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRegulationMutation } from '../services/api';
import Layout from '../components/Layout';
import { useDispatch } from 'react-redux';
import { toggleRefreshRegulations } from '@/store/slices/authSlice';
import { toast } from 'react-toastify';
import RegulationBreadcrumb from '@/components/RegulationBreadcrumb';

const RegulationDetail: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [createRegulation] = useCreateRegulationMutation();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    const search = inputValue.trim();

    // Ensure the search query is provided
    if (!search) {
      setError('Search query is required.');
      return;
    }

    setError('');

    // Navigate immediately to the regulations page
    navigate('/regulations');
    
    try {
      setTimeout(() => {
        dispatch(toggleRefreshRegulations());
      }, 1000);
      await createRegulation({search});
      dispatch(toggleRefreshRegulations());
      toast.success('Regulation created successfully!');
    } catch (error) {
      console.error('Failed to create regulation:', error);
      // Show error toast in case of failure
      toast.error('Failed to create regulation. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="p-4 flex-1 bg-white w-full mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between items-center mb-4 space-y-2 md:space-y-0 mt-7">
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-xl font-bold">Regulation Detail</h2>
            <div>
              <RegulationBreadcrumb />
            </div>
          </div>
        </div>
  
        {/* Label on a separate line */}
        <div className="my-10 text-left">
          <label className="block text-sm md:text-base text-gray-700 font-medium mb-2">
            Enter a City, Address, and Area
          </label>
          
          {/* Wrapper for input and button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Message RegAdvisor AI"
              className="p-2 border border-gray-300 rounded w-full sm:w-3/4 md:w-1/2"
            />
            
            <button
              onClick={handleSubmit}
              className="bg-red-500 text-white mt-2 sm:mt-0 sm:ml-0 px-4 py-2 rounded hover:bg-red-600"
            >
              Submit
            </button>
          </div>
        </div>

  
        {/* Error message */}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </Layout>
  );    
};
  
export default RegulationDetail;
