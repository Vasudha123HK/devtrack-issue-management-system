import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueService } from '../services/issueService';
import { IssueForm } from '../components/IssueForm';
import { ErrorMessage } from '../components/ErrorMessage';
import { PlusCircle } from 'lucide-react';

export const CreateIssue = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await issueService.createIssue(formData);
      if (res.success && res.data) {
        navigate(`/issues/${res.data._id}`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to create issue. Please check all required fields.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-2 text-brand-600 mb-1">
          <PlusCircle className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">New Ticket</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Create New Issue
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Fill out the details below to log a bug, task, or feature request
        </p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <IssueForm onSubmit={handleSubmit} isSubmitting={submitting} />
      </div>
    </div>
  );
};
