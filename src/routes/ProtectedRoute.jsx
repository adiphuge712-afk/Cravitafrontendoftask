import React from 'react'
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({children}) => {
    // sessionStorage, not localStorage - see api/client.js for why.
    const token = sessionStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute