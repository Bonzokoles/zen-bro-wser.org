// src/components/SkeletonLoader.tsx
import React from 'react';

export function TabSkeleton() {
  return (
    <div className="animate-pulse flex gap-2 p-2">
      <div className="h-8 w-32 bg-slate-700 rounded" />
      <div className="h-8 w-32 bg-slate-700 rounded" />
      <div className="h-8 w-32 bg-slate-700 rounded" />
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4 animate-pulse p-4">
      <div className="flex gap-3 items-center">
        <div className="w-8 h-8 bg-slate-700 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-700 rounded w-3/4" />
          <div className="h-4 bg-slate-700 rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-3 items-center justify-end">
        <div className="flex-1 space-y-2 text-right">
          <div className="h-4 bg-slate-600 rounded w-3/4 ml-auto" />
        </div>
        <div className="w-8 h-8 bg-slate-600 rounded-full" />
      </div>
      <div className="flex gap-3 items-center">
        <div className="w-8 h-8 bg-slate-700 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-700 rounded w-5/6" />
        </div>
      </div>
    </div>
  );
}
