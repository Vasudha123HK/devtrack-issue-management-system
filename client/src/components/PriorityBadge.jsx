import React from 'react';
import { PRIORITY_CONFIG } from '../utils/constants';
import { AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

export const PriorityBadge = ({ priority = 'Medium', showIcon = true, size = 'sm' }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  const getPriorityIcon = () => {
    switch (priority) {
      case 'High':
        return <ArrowUp className="w-3 h-3 mr-1 stroke-[2.5]" />;
      case 'Low':
        return <ArrowDown className="w-3 h-3 mr-1 stroke-[2.5]" />;
      case 'Medium':
      default:
        return <AlertTriangle className="w-3 h-3 mr-1 stroke-[2]" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size] || sizeClasses.sm}`}
    >
      {showIcon && getPriorityIcon()}
      {config.label}
    </span>
  );
};
