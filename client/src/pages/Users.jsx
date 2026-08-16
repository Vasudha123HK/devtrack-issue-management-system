import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { TableSkeleton } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { formatDate, getInitials } from '../utils/formatters';
import { Users as UsersIcon, Shield, Code, ShieldCheck, Check } from 'lucide-react';

export const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userService.getUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load team directory.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    setSuccessMessage('');
    try {
      const res = await userService.updateRole(userId, newRole);
      if (res.success) {
        setSuccessMessage(`Updated role to ${newRole} successfully`);
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-brand-600 mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Administration
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Team & User Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            View engineering staff, monitor issue workloads, and manage role permissions
          </p>
        </div>

        <div className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
          Total Members: <span className="font-bold text-slate-800">{users.length}</span>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchUsers} />}

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <TableSkeleton rows={5} />
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 tracking-wider">
              <tr>
                <th scope="col" className="py-3.5 pl-6 pr-3">
                  Team Member
                </th>
                <th scope="col" className="px-3 py-3.5">
                  Role
                </th>
                <th scope="col" className="px-3 py-3.5 text-center">
                  Assigned Issues
                </th>
                <th scope="col" className="px-3 py-3.5 text-center">
                  Created Issues
                </th>
                <th scope="col" className="px-3 py-3.5">
                  Joined Date
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-6 text-right">
                  Manage Role
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {users.map((member) => {
                const isSelf = member._id === currentUser?._id;

                return (
                  <tr key={member._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* User info */}
                    <td className="py-4 pl-6 pr-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center border border-brand-200">
                          {getInitials(member.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                            <span>{member.name}</span>
                            {isSelf && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-normal">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">{member.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="whitespace-nowrap px-3 py-4">
                      <span
                        className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md border ${
                          member.role === 'Admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {member.role === 'Admin' ? (
                          <Shield className="w-3 h-3 mr-1 text-purple-600" />
                        ) : (
                          <Code className="w-3 h-3 mr-1 text-slate-500" />
                        )}
                        {member.role}
                      </span>
                    </td>

                    {/* Assigned Issues */}
                    <td className="whitespace-nowrap px-3 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                        {member.assignedIssuesCount || 0}
                      </span>
                    </td>

                    {/* Created Issues */}
                    <td className="whitespace-nowrap px-3 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {member.createdIssuesCount || 0}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="whitespace-nowrap px-3 py-4 text-xs text-slate-500">
                      {formatDate(member.createdAt)}
                    </td>

                    {/* Role selector action */}
                    <td className="whitespace-nowrap py-4 pl-3 pr-6 text-right">
                      {isSelf ? (
                        <span className="text-xs text-slate-400 italic">Self</span>
                      ) : (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member._id, e.target.value)}
                          disabled={updatingId === member._id}
                          className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
                        >
                          <option value="Developer">Developer</option>
                          <option value="Admin">Admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
