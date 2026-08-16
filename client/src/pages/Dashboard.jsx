import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../hooks/useAuth';
import { DashboardCard } from '../components/DashboardCard';
import { IssueTable } from '../components/IssueTable';
import { LoadingSpinner, CardSkeleton } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import {
  Layers,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  PlusCircle,
  Users,
  Activity,
  CheckSquare,
} from 'lucide-react';

export const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await dashboardService.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load dashboard analytics. Ensure the backend server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-slate-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200 rounded-xl animate-pulse lg:col-span-2"></div>
          <div className="h-64 bg-slate-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  const summary = stats?.summary || {
    totalIssues: 0,
    openIssues: 0,
    inProgressIssues: 0,
    resolvedIssues: 0,
    highPriorityIssues: 0,
  };

  const priorityDist = stats?.priorityDistribution || { Low: 0, Medium: 0, High: 0 };
  const statusDist = stats?.statusDistribution || { Open: 0, 'In Progress': 0, Resolved: 0 };
  const userStats = stats?.userStats || {};

  // Calculate resolution rate
  const resolutionRate =
    summary.totalIssues > 0
      ? Math.round((summary.resolvedIssues / summary.totalIssues) * 100)
      : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span>. Here's what's happening across DevTrack.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/issues/new"
            className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Issue</span>
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchStats} />}

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardCard
          title="Total Issues"
          value={summary.totalIssues}
          subtitle="All recorded tickets"
          icon={Layers}
          color="brand"
          link="/issues"
        />

        <DashboardCard
          title="Open Issues"
          value={summary.openIssues}
          subtitle="Awaiting triage or work"
          icon={Clock}
          color="slate"
          link="/issues?status=Open"
        />

        <DashboardCard
          title="In Progress"
          value={summary.inProgressIssues}
          subtitle="Actively being resolved"
          icon={Activity}
          color="brand"
          link="/issues?status=In Progress"
        />

        <DashboardCard
          title="Resolved"
          value={summary.resolvedIssues}
          subtitle={`${resolutionRate}% resolution rate`}
          icon={CheckCircle2}
          color="emerald"
          link="/issues?status=Resolved"
        />

        <DashboardCard
          title="High Priority"
          value={summary.highPriorityIssues}
          subtitle="Needs urgent attention"
          icon={AlertOctagon}
          color="rose"
          link="/issues?priority=High"
        />
      </div>

      {/* Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status & Priority Progress Bars */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Issue Distribution Breakdown
            </h3>
            <span className="text-xs text-slate-400 font-medium">Real-time DB counts</span>
          </div>

          {/* Status Breakdown Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
              <span>Status Distribution</span>
              <span className="text-slate-400">{summary.totalIssues} Total</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                style={{
                  width: `${summary.totalIssues ? (statusDist.Open / summary.totalIssues) * 100 : 0}%`,
                }}
                className="bg-slate-400 transition-all duration-500"
                title={`Open: ${statusDist.Open}`}
              ></div>
              <div
                style={{
                  width: `${summary.totalIssues ? (statusDist['In Progress'] / summary.totalIssues) * 100 : 0}%`,
                }}
                className="bg-indigo-500 transition-all duration-500"
                title={`In Progress: ${statusDist['In Progress']}`}
              ></div>
              <div
                style={{
                  width: `${summary.totalIssues ? (statusDist.Resolved / summary.totalIssues) * 100 : 0}%`,
                }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Resolved: ${statusDist.Resolved}`}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-slate-400 mr-1.5"></span>
                Open ({statusDist.Open})
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5"></span>
                In Progress ({statusDist['In Progress']})
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
                Resolved ({statusDist.Resolved})
              </span>
            </div>
          </div>

          {/* Priority Breakdown Bar */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
              <span>Priority Severity Breakdown</span>
              <span className="text-slate-400">{summary.totalIssues} Total</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                style={{
                  width: `${summary.totalIssues ? (priorityDist.Low / summary.totalIssues) * 100 : 0}%`,
                }}
                className="bg-blue-400 transition-all duration-500"
                title={`Low: ${priorityDist.Low}`}
              ></div>
              <div
                style={{
                  width: `${summary.totalIssues ? (priorityDist.Medium / summary.totalIssues) * 100 : 0}%`,
                }}
                className="bg-amber-400 transition-all duration-500"
                title={`Medium: ${priorityDist.Medium}`}
              ></div>
              <div
                style={{
                  width: `${summary.totalIssues ? (priorityDist.High / summary.totalIssues) * 100 : 0}%`,
                }}
                className="bg-rose-500 transition-all duration-500"
                title={`High: ${priorityDist.High}`}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-blue-400 mr-1.5"></span>
                Low ({priorityDist.Low})
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-amber-400 mr-1.5"></span>
                Medium ({priorityDist.Medium})
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5"></span>
                High Severity ({priorityDist.High})
              </span>
            </div>
          </div>
        </div>

        {/* User Workload / Quick Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                My Workload
              </h3>
              <span className="text-[10px] font-semibold uppercase bg-brand-50 text-brand-700 px-2 py-0.5 rounded">
                Personal
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                  <CheckSquare className="w-4 h-4 text-brand-600" />
                  <span>Assigned to Me</span>
                </div>
                <span className="text-base font-bold text-slate-900">
                  {userStats.myAssignedTotal || 0}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Open</div>
                  <div className="text-sm font-bold text-slate-700">{userStats.myAssignedOpen || 0}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100">
                  <div className="text-[10px] uppercase font-semibold text-indigo-500">In Prog</div>
                  <div className="text-sm font-bold text-indigo-700">{userStats.myAssignedInProgress || 0}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                  <div className="text-[10px] uppercase font-semibold text-emerald-500">Resolved</div>
                  <div className="text-sm font-bold text-emerald-700">{userStats.myAssignedResolved || 0}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <Link
              to={`/issues?assignedTo=${user?._id}`}
              className="w-full flex items-center justify-center space-x-1 text-xs font-semibold text-brand-600 hover:text-brand-700 py-2 rounded-lg hover:bg-brand-50 transition-colors"
            >
              <span>View My Assigned Issues</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Issues Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Recently Created Issues
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest items submitted across the project
            </p>
          </div>
          <Link
            to="/issues"
            className="inline-flex items-center text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            <span>View All Issues</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {stats?.recentIssues?.length > 0 ? (
          <IssueTable issues={stats.recentIssues} />
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">
            No recent issues recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};
