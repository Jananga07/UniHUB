import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";
import AnimatedCounter from "../Animation/AnimatedCounter";
import CountUp from "react-countup";


function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userCategory, setUserCategory] = useState("student");
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState({});
  const [editUserId, setEditUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/Users/admin/users");
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const submitData = async (endpoint, role) => {
    try {
      const data = role ? { ...formData, role } : formData;
      await axios.post(`http://localhost:5000/${endpoint}`, data);
      alert("Added Successfully!");
      setFormData({});
      fetchUsers();
    } catch (err) {
      alert("Error!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:5000/admin/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert("Delete failed!");
      }
    }
  };

  const handleEdit = (user) => {
    setEditUserId(user._id);
    setFormData({
      name: user.name,
      gmail: user.gmail,
      age: user.age,
      address: user.address,
      contact: user.contact,
      role: user.role,
    });
  };

  const saveEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/admin/users/${editUserId}`, formData);
      setEditUserId(null);
      setFormData({});
      fetchUsers();
      alert("Updated successfully!");
    } catch (err) {
      alert("Update failed!");
    }
  };

  const filteredUsers = users
    .filter((u) => u.role?.trim().toLowerCase() === userCategory)
    .filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery[userCategory]?.toLowerCase() || "") ||
        u.gmail.toLowerCase().includes(searchQuery[userCategory]?.toLowerCase() || "")
    );

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Uni Hub</h2>
        <a onClick={() => setActiveTab("dashboard")}>Dashboard</a>
        <a onClick={() => setActiveTab("users")}>All Users</a>
        <a onClick={() => setActiveTab("teacher")}>Add Teacher</a>
        <a onClick={() => setActiveTab("societyAdmin")}>Add Society Admin</a>
        <a onClick={() => setActiveTab("module")}>Add Module</a>
        <a onClick={() => setActiveTab("society")}>Add Society</a>
        <button onClick={() => navigate("/adquiz")}>Add Quiz</button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="topbar">
          <h1>Admin Dashboard</h1>
          <div className="admin-profile">Admin</div>
        </div>

        {/* Dashboard Cards */}
        {activeTab === "dashboard" && (
  <div className="dashboard-grid">
    <div className="dashboard-card">
      <h3>Total Users</h3>
      <CountUp end={users.length} duration={2} />
    </div>
    <div className="dashboard-card">
      <h3>Students</h3>
      <CountUp end={users.filter(u => u.role === "Student").length} duration={2} />
    </div>
    <div className="dashboard-card">
      <h3>Teachers</h3>
      <CountUp end={users.filter(u => u.role === "teacher").length} duration={2} />
    </div>
    <div className="dashboard-card">
      <h3>Society Admins</h3>
      <CountUp end={users.filter(u => u.role === "societyAdmin").length} duration={2} />
    </div>
  </div>
)}

        {/* Users Section */}
        {activeTab === "users" && (
          <div className="users-section">
            <div className="category-tabs">
              {["student","teacher","societyadmin"].map(cat => (
                <button
                  key={cat}
                  className={userCategory === cat ? "active" : ""}
                  onClick={() => setUserCategory(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder={`Search ${userCategory} by name/email`}
              value={searchQuery[userCategory] || ""}
              onChange={(e) => setSearchQuery({ ...searchQuery, [userCategory]: e.target.value })}
              className="search-input"
            />

            <div className="table-container">
              <h2>{userCategory.toUpperCase()} DETAILS</h2>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Age</th>
                    <th>Address</th>
                    <th>Role</th>
                    <th>Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u._id}>
                      <td>{editUserId === u._id ? <input name="name" value={formData.name} onChange={handleChange} /> : u.name?.trim()}</td>
                      <td>{editUserId === u._id ? <input name="gmail" value={formData.gmail} onChange={handleChange} /> : u.gmail?.trim()}</td>
                      <td>{editUserId === u._id ? <input name="age" value={formData.age} onChange={handleChange} /> : u.age}</td>
                      <td>{editUserId === u._id ? <input name="address" value={formData.address} onChange={handleChange} /> : u.address?.trim()}</td>
                      <td>{editUserId === u._id ? <input name="role" value={formData.role} onChange={handleChange} /> : u.role?.trim()}</td>
                      <td>{editUserId === u._id ? <input name="contact" value={formData.contact} onChange={handleChange} /> : u.contact?.trim()}</td>
                      <td>
                        {editUserId === u._id ? (
                          <button className="dashboard-btn" onClick={saveEdit}>Save</button>
                        ) : (
                          <>
                            <button className="dashboard-btn" onClick={() => handleEdit(u)}>Edit</button>
                            <button className="dashboard-btn" onClick={() => handleDelete(u._id)}>Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Forms */}
        {["teacher","societyAdmin","module","society"].map(tab => (
          activeTab === tab && (
            <div className="form-card" key={tab}>
              <h2>{tab === "teacher" ? "Add Teacher" :
                  tab === "societyAdmin" ? "Add Society Admin" :
                  tab === "module" ? "Add Module" : "Add Society"}</h2>
              {tab.includes("teacher") || tab.includes("societyAdmin") ? (
                <>
                  <input name="name" placeholder="Name" onChange={handleChange} />
                  <input name="gmail" placeholder="Email" onChange={handleChange} />
                  <input name="age" placeholder="Age" onChange={handleChange} />
                  <input name="address" placeholder="Address" onChange={handleChange} />
                  <input name="role" placeholder="Role" onChange={handleChange} />
                  <input name="contact" placeholder="Contact" onChange={handleChange} />
                </>
              ) : tab === "module" ? (
                <>
                  <input name="moduleName" placeholder="Module Name" onChange={handleChange} />
                  <input name="moduleCode" placeholder="Module Code" onChange={handleChange} />
                </>
              ) : (
                <>
                  <input name="societyName" placeholder="Society Name" value={formData.societyName || ""} onChange={handleChange} />
                  <input name="description" placeholder="Description" value={formData.description || ""} onChange={handleChange} />
                </>
              )}
              <button className="dashboard-btn" onClick={() => submitData(
                tab === "teacher" || tab === "societyAdmin" ? "register" :
                tab === "module" ? "modules" :
                tab === "society" ? "societies" : null,
                tab === "teacher" ? "teacher" :
                tab === "societyAdmin" ? "societyAdmin" : null
              )}>
                Add
              </button>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;