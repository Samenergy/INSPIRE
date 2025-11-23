/**
 * Signup Page Component
 * SME registration with existing design
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SMESignupBasicData } from '../../services/authService';

export default function SignupPage(): JSX.Element {
  const navigate = useNavigate();
  const { signupBasic, isLoading, error, clearError } = useAuth();
  const { mode } = useTheme();
  
  const [formData, setFormData] = useState<SMESignupBasicData>({
    name: '',
    contact_email: '',
    password: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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
      clearError();
    }
  };

  // Password requirements checker
  const getPasswordRequirements = () => {
    const password = formData.password;
    const passwordBytes = new TextEncoder().encode(password).length;
    
    return {
      hasMinLength: password.length >= 8,
      hasMaxLength: password.length <= 100,
      withinByteLimit: passwordBytes <= 72,
      allValid: password.length >= 8 && password.length <= 100 && passwordBytes <= 72
    };
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Company name is required';
    }

    if (!formData.contact_email.trim()) {
      errors.contact_email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
      errors.contact_email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else {
      const requirements = getPasswordRequirements();
      if (!requirements.hasMinLength) {
        errors.password = 'Password must be at least 8 characters long';
      } else if (!requirements.hasMaxLength) {
        errors.password = 'Password must be no more than 100 characters long';
      } else if (!requirements.withinByteLimit) {
        errors.password = 'Password is too long (maximum 72 bytes). Please use a shorter password.';
      }
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!acceptedTerms) {
      errors.terms = 'You must accept the Terms and Conditions to create an account';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const response = await signupBasic(formData);
      if (response.success) {
        // Navigate to SME setup page
        navigate('/sme-setup');
      }
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full">
            <img src="/Group 47710.svg" alt="INSPIRE Logo" className="h-36 -mt-20" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Join INSPIRE
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your SME account to get started
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-200/50"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Company Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                    required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter your company name"
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="contact_email"
                name="contact_email"
                type="email"
                required
                value={formData.contact_email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter your email address"
              />
              {validationErrors.contact_email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.contact_email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => setShowPasswordRequirements(true)}
                onBlur={() => {
                  // Keep requirements visible if there's an error or password is being entered
                  if (!formData.password || validationErrors.password) {
                    setShowPasswordRequirements(true);
                  } else {
                    setShowPasswordRequirements(false);
                  }
                }}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Create a password"
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
              
              {/* Password Requirements */}
              {(showPasswordRequirements || formData.password) && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</p>
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li className={`flex items-center ${getPasswordRequirements().hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className={`mr-2 ${getPasswordRequirements().hasMinLength ? 'text-green-500' : 'text-gray-400'}`}>
                        {getPasswordRequirements().hasMinLength ? '✓' : '○'}
                      </span>
                      At least 8 characters
                    </li>
                    <li className={`flex items-center ${getPasswordRequirements().hasMaxLength ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className={`mr-2 ${getPasswordRequirements().hasMaxLength ? 'text-green-500' : 'text-gray-400'}`}>
                        {getPasswordRequirements().hasMaxLength ? '✓' : '○'}
                      </span>
                      Maximum 100 characters
                    </li>
                    <li className={`flex items-center ${getPasswordRequirements().withinByteLimit ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className={`mr-2 ${getPasswordRequirements().withinByteLimit ? 'text-green-500' : 'text-gray-400'}`}>
                        {getPasswordRequirements().withinByteLimit ? '✓' : '○'}
                      </span>
                      Maximum 72 bytes (use standard characters for best compatibility)
                    </li>
                  </ul>
                  {formData.password && (
                    <p className="mt-2 text-xs text-gray-500">
                      Current length: {formData.password.length} characters, {new TextEncoder().encode(formData.password).length} bytes
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Confirm your password"
              />
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div>
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (validationErrors.terms) {
                      setValidationErrors(prev => ({
                        ...prev,
                        terms: ''
                      }));
                    }
                  }}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                  I agree to the{' '}
                  <Link
                    to="/terms"
                    className="text-blue-600 hover:text-blue-700 font-medium underline"
                    onClick={(e) => {
                      // Open in new tab
                      e.preventDefault();
                      window.open('/terms', '_blank');
                    }}
                  >
                    Terms and Conditions
                  </Link>
                </label>
              </div>
              {validationErrors.terms && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.terms}</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                  Already have an account?{' '}
                  <Link 
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                >
                  Sign in
                  </Link>
              </p>
            </div>
            </form>
        </motion.div>
      </div>
    </div>
  );
}