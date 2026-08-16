import React from 'react';
import { Link } from 'react-router-dom';

export const DashboardCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'brand', // brand, emerald, amber, rose, slate
  link,
}) => {
  const colorMap = {
    brand: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'hover:border-indigo-300',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'hover:border-emerald-300',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'hover:border-amber-300',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'hover:border-rose-300',
    },
    slate: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'hover:border-slate-300',
    },
  };

  const theme = colorMap[color] || colorMap.brand;

  const content = (
    <div className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-card transition-all duration-200 hover:shadow-card-hover ${theme.border} relative overflow-hidden flex flex-col justify-between h-full`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${theme.bg} ${theme.text}`}>
            <Icon className="w-5 h-5 stroke-[2]" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {value !== undefined ? value : '—'}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  if (link) {
    return <Link to={link} className="block h-full group">{content}</Link>;
  }

  return content;
};
