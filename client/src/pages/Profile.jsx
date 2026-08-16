import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import { IssueCard } from '../components/IssueCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { formatDate, formatDateTime, getInitials } from '../utils/formatters';
import {
  UserCircle,
  Mail,
  Shield,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' | 'created'

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?._id) return;
      setLoading(true);
      setError('');
      try {
        const res = await userService.getUserById(user._id);
        if (res.success && res.data) {
          setProfileData(res.data);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load user profile details'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return <LoadingSpinner text="Loading profile details & assigned tasks..." />;
  }

  const assignedIssues = profileData?.assignedIssues || [];
  const createdIssues = profileData?.createdIssues || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-20 h-20 rounded-2xl bg-brand-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 flex-shrink-0">
            {getInitials(user?.name)}
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex items-center space-x-3 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {user?.name}
              </h1>
              <span
                className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  user?.role === 'Admin'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}
              >
                <Shield className="w-3 h-3 mr-1" />
                {user?.role} Account
              </span>
            </div>

            <p className="text-xs text-slate-500 flex items-center pt-1">
              <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              {user?.email}
            </p>

            <p className="text-xs text-slate-500 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              Member since {formatDate(user?.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Tabs */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 flex space-x-6">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center space-x-2 relative ${
              activeTab === 'assigned'
                ? 'text-brand-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Assigned Tasks</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-bold">
              {assignedIssues.length}
            </span>
            {activeTab === 'assigned' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('created')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center space-x-2 relative ${
              activeTab === 'created'
                ? 'text-brand-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Reported by Me</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-bold">
              {createdIssues.length}
            </span>
            {activeTab === 'created' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full"></span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'assigned' ? (
          assignedIssues.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-sm italic">
              You currently have no assigned issues.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedIssues.map((issue) => (
                <IssueCard key={issue._id} issue={issue} />
              ))}
            </div>
          )
        ) : createdIssues.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-sm italic">
            You haven't reported any issues yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {createdIssues.map((issue) => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
