import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { issueService } from '../services/issueService';
import { userService } from '../services/userService';
import { useDebounce } from '../hooks/useDebounce';
import { IssueTable } from '../components/IssueTable';
import { IssueCard } from '../components/IssueCard';
import { ConfirmModal } from '../components/ConfirmModal';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { TableSkeleton } from '../components/LoadingSpinner';
import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const Issues = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State initialized from URL query params
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 300);

  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || '');
  const [assignedFilter, setAssignedFilter] = useState(searchParams.get('assignedTo') || '');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  const [issues, setIssues] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [developers, setDevelopers] = useState([]);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch developers for the filter dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userService.getUsers();
        if (res.success && res.data) {
          setDevelopers(res.data);
        }
      } catch (err) {
        console.error('Failed to load user list for filters:', err);
      }
    };
    fetchUsers();
  }, []);

  // Sync state changes with URL query parameters
  useEffect(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter) params.status = statusFilter;
    if (priorityFilter) params.priority = priorityFilter;
    if (assignedFilter) params.assignedTo = assignedFilter;
    if (page > 1) params.page = page;

    setSearchParams(params, { replace: true });
  }, [debouncedSearch, statusFilter, priorityFilter, assignedFilter, page, setSearchParams]);

  // Fetch Issues from API
  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 20,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (assignedFilter) params.assignedTo = assignedFilter;

      const res = await issueService.getIssues(params);
      if (res.success) {
        setIssues(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load issues. Please check your network connection.'
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, priorityFilter, assignedFilter, page]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleResetFilters = () => {
    setSearchInput('');
    setStatusFilter('');
    setPriorityFilter('');
    setAssignedFilter('');
    setPage(1);
  };

  const hasActiveFilters =
    searchInput !== '' ||
    statusFilter !== '' ||
    priorityFilter !== '' ||
    assignedFilter !== '';

  const handleDeletePrompt = (issue) => {
    setIssueToDelete(issue);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!issueToDelete) return;
    setIsDeleting(true);
    try {
      await issueService.deleteIssue(issueToDelete._id);
      setDeleteModalOpen(false);
      setIssueToDelete(null);
      fetchIssues(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete issue');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Issues & Tasks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, prioritize, and track bug fixes and development tickets
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-brand-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-brand-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Link
            to="/issues/new"
            className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Issue</span>
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchIssues} />}

      {/* Filter and Search Controls Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              placeholder="Search title or description..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Assigned Developer Filter */}
          <div>
            <select
              value={assignedFilter}
              onChange={(e) => {
                setAssignedFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {developers.map((dev) => (
                <option key={dev._id} value={dev._id}>
                  {dev.name} ({dev.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Counter and Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{issues.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalCount}</span> total issues
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center text-brand-600 hover:text-brand-800 font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Issue Content Listing */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <TableSkeleton rows={6} />
        </div>
      ) : issues.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'No matching issues found' : 'No issues created yet'}
          description={
            hasActiveFilters
              ? 'Try modifying your search keywords or clearing active filters.'
              : 'DevTrack has no open issues. Create the first issue to get your team rolling!'
          }
          actionLabel={hasActiveFilters ? 'Clear Filters' : 'Create Issue'}
          actionLink={hasActiveFilters ? undefined : '/issues/new'}
          onAction={hasActiveFilters ? handleResetFilters : undefined}
        />
      ) : viewMode === 'table' ? (
        <IssueTable issues={issues} onDeleteClick={handleDeletePrompt} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {issues.map((issue) => (
            <IssueCard
              key={issue._id}
              issue={issue}
              onDeleteClick={handleDeletePrompt}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-slate-500 font-medium">
            Page <span className="text-slate-900 font-semibold">{page}</span> of{' '}
            <span className="text-slate-900 font-semibold">{totalPages}</span>
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Issue"
        message={`Are you sure you want to permanently delete "${issueToDelete?.title}" and its comments?`}
        confirmText="Delete Issue"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
