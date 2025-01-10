// src/pages/AdminDashboard.js

import React from 'react';
import UsersList from '../components/UsersList.js';
import DomainsList from '../components/DomainsList.js';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h2>Panel de Administración</h2>
      <div className="dashboard-sections">
        <UsersList />
        <DomainsList />
      </div>
    </div>
  );
};

export default AdminDashboard;
