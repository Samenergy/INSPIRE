 /**
 * SME Setup Page Component
 * Additional setup for SME description and sector after signup
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { SMEUpdateData } from '../../services/authService';

const SECTORS = [
  'Technology',
  'Agriculture',
  'Manufacturing',
  'Healthcare',
  'Education',
  'Finance',
  'Retail',
  'Transportation',
  'Energy',
  'Construction',
  'Food & Beverage',
  'Tourism',
  'Other'
];

export default function SMESetupPage(): JSX.Element {
  const navigate = useNavigate();
  const { user, updateProfile, refreshUser } = useAuth();
  
  const [formData, setFormData] = useState<SMEUpdateData>({
    sector: '',
    objective: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error
    if (error) {
      setError(null);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.sector.trim()) {
      errors.sector = 'Please select your business sector';
    }

    if (!formData.objective.trim()) {
      errors.objective = 'Please describe your business';
    } else if (formData.objective.trim().length < 20) {
      errors.objective = 'Please provide a more detailed description (at least 20 characters)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update SME profile with sector and description
      const response = await updateProfile(formData);
      
      if (response.success) {
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        setError(response.message || 'Setup failed. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'Setup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative max-w-2xl w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="mx-auto h-12 w-12 flex items-center justify-center">
            <img src="/Group 47710.svg" alt="INSPIRE Logo" className="w-16 -mt-20" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Help us understand your business better to provide personalized recommendations
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Welcome Message */}
            <div className="text-center mb-6">
              <p className="text-gray-900 text-lg">
                Welcome, <span className="font-semibold text-blue-600">{user.name}</span>!
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Let's set up your business profile
              </p>
            </div>

            {/* Business Sector */}
            <div>
              <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-2">
                Business Sector
              </label>
              <select
                id="sector"
                name="sector"
                required
                value={formData.sector}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="" className="bg-white">Select your business sector</option>
                {SECTORS.map((sector) => (
                  <option key={sector} value={sector} className="bg-white">
                    {sector}
                  </option>
                ))}
              </select>
              {validationErrors.sector && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.sector}</p>
              )}
            </div>

            {/* Business Description */}
            <div>
              <label htmlFor="objective" className="block text-sm font-medium text-gray-700 mb-2">
                Business Description
              </label>
              <textarea
                id="objective"
                name="objective"
                rows={4}
                required
                value={formData.objective}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Describe your business, goals, and what you hope to achieve. This helps us provide better recommendations for partnerships and opportunities."
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>Minimum 20 characters</span>
                <span>{formData.objective.length}/500</span>
              </div>
              {validationErrors.objective && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.objective}</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Skip for Now
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Setting Up...
                  </div>
                ) : (
                  'Complete Setup'
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
          <p className="text-gray-500 text-xs mt-2">Step 2 of 3</p>
        </motion.div>
      </div>
    </div>
  );
}
