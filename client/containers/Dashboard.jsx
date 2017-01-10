// Dependencies.
import React from 'react';

// React components.
import DashboardRecipes from 'components/DashboardRecipes';

// Component definition.
const Dashboard = () => (
  <div className="container-page">
    <div>
      <DashboardRecipes username={'username1'} />
    </div>
  </div>
);

// Component export.
export default Dashboard;
