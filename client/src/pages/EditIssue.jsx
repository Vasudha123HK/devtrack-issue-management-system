import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issueService } from '../services/issueService';
import { IssueForm } from '../components/IssueForm';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Edit3 } from 'lucide-react';

export const EditIssue = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIssue = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await issueService.getIssueById(id);
        if (res.success && res.data) {
          setIssue(res.data);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load issue information'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await issueService.updateIssue(id, formData);
      if (res.success && res.data) {
        navigate(`/issues/${id}`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to update issue. Ensure you have the right permissions.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading issue details for editing..." />;
  }

  if (error && !issue) {
    return <ErrorMessage message={error} onRetry={() => navigate('/issues')} />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-2 text-amber-600 mb-1">
          <Edit3 className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Modify Record</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Edit Issue
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Updating ticket <span className="font-semibold text-slate-700">#{id.slice(-6)}</span>: {issue?.title}
        </p>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <IssueForm
          initialData={issue}
          onSubmit={handleSubmit}
          isSubmitting={submitting}
          isEdit={true}
        />
      </div>
    </div>
  );
};
