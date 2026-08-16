import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { PRIORITIES, STATUSES } from '../utils/constants';
import { AlertCircle, Save, ArrowLeft, Loader2 } from 'lucide-react';

export const IssueForm = ({ initialData = {}, onSubmit, isSubmitting, isEdit = false }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    priority: initialData.priority || PRIORITIES.MEDIUM,
    status: initialData.status || STATUSES.OPEN,
    assignedTo: initialData.assignedTo?._id || initialData.assignedTo || '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userService.getUsers();
        if (res.success && res.data) {
          setUsers(res.data);
        }
      } catch (err) {
        console.error('Failed to load users for assignment dropdown:', err);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Issue title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Issue description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      assignedTo: formData.assignedTo === '' ? null : formData.assignedTo,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-slate-800 mb-1.5">
          Issue Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Broken authentication callback on Safari mobile"
          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
            errors.title
              ? 'border-rose-300 focus:ring-rose-400'
              : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
          }`}
        />
        {errors.title && (
          <p className="mt-1.5 text-xs text-rose-600 flex items-center">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            {errors.title}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-slate-800 mb-1.5">
          Description <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          value={formData.description}
          onChange={handleChange}
          placeholder="Provide detailed steps to reproduce, expected behavior, system context, or error logs..."
          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
            errors.description
              ? 'border-rose-300 focus:ring-rose-400'
              : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
          }`}
        />
        {errors.description && (
          <p className="mt-1.5 text-xs text-rose-600 flex items-center">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            {errors.description}
          </p>
        )}
      </div>

      {/* Priority, Status, Assignee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-semibold text-slate-800 mb-1.5">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value={PRIORITIES.LOW}>Low</option>
            <option value={PRIORITIES.MEDIUM}>Medium</option>
            <option value={PRIORITIES.HIGH}>High</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-semibold text-slate-800 mb-1.5">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value={STATUSES.OPEN}>Open</option>
            <option value={STATUSES.IN_PROGRESS}>In Progress</option>
            <option value={STATUSES.RESOLVED}>Resolved</option>
          </select>
        </div>

        {/* Assignee */}
        <div>
          <label htmlFor="assignedTo" className="block text-sm font-semibold text-slate-800 mb-1.5">
            Assign Developer
          </label>
          <select
            id="assignedTo"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            disabled={loadingUsers}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-slate-50"
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-1.5" />
              {isEdit ? 'Update Issue' : 'Create Issue'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};
