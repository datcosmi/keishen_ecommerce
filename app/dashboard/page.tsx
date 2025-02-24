"use client";
import Sidebar from "../components/admins/sidebar";

const Dashboard = () => {
  return (
    <div className="flex flex-col md:flex-row gap-2 min-h-screen bg-[#eaeef6]">
      <Sidebar />
      <div className="p-6 pr-2 flex-1">
        <h2 className="text-3xl font-bold mb-8">Dashboard</h2>
      </div>
    </div>
  );
};

export default Dashboard;
