import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, Building2, User } from 'lucide-react';

const STAGES = ['Pending', 'Open', 'Under Review', 'In Progress', 'Resolved'];

const StatusTimeline = ({ currentStatus, statusHistory = [] }) => {
  const currentIndex = STAGES.indexOf(currentStatus);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-brand-600" />
        Status Lifecycle Timeline
      </h3>

      {/* Visual Step Indicator */}
      <div className="relative mb-8">
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[500px] flex items-center justify-between relative">
            
            {/* Background connecting bar */}
            <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 -z-0" />
            
            {/* Active connecting bar */}
            <div
              className="absolute top-4 left-6 h-1 bg-gradient-to-r from-brand-600 to-indigo-600 transition-all duration-500 -z-0"
              style={{
                width: `${currentIndex >= 0 ? (currentIndex / (STAGES.length - 1)) * 100 : 0}%`,
              }}
            />

            {STAGES.map((stage, idx) => {
              const isCompleted = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const isPendingStep = idx > currentIndex;

              return (
                <div key={stage} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                      isCompleted
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                        : isCurrent
                        ? 'bg-brand-600 text-white ring-4 ring-brand-100 scale-110'
                        : 'bg-white text-slate-400 border-2 border-slate-300'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span
                    className={`mt-2 text-xs font-semibold whitespace-nowrap ${
                      isCurrent
                        ? 'text-brand-700 font-bold'
                        : isCompleted
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage}
                  </span>
                </div>
              );
            })}

          </div>
        </div>
      </div>

      {/* History Log Details */}
      {statusHistory && statusHistory.length > 0 && (
        <div className="border-t border-slate-100 pt-4 mt-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Audit Trail & History Logs
          </h4>
          <div className="space-y-3">
            {statusHistory.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="mt-0.5">
                  {item.changedBy?.role === 'admin' ? (
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                  ) : item.changedBy?.role === 'institution' ? (
                    <Building2 className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <User className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap justify-between items-center gap-1 mb-1">
                    <span className="font-bold text-slate-800">
                      Status: <span className="text-brand-700">{item.status}</span>
                    </span>
                    <span className="text-slate-400">
                      {new Date(item.changedAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-600">{item.note || 'No notes attached.'}</p>
                  {item.changedBy && (
                    <div className="text-[11px] text-slate-500 mt-1 font-medium">
                      By: {item.changedBy.name} ({item.changedBy.role}{item.changedBy.organization ? ` - ${item.changedBy.organization}` : ''})
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusTimeline;
