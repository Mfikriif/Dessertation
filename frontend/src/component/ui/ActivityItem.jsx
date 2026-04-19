import React from 'react';
import { Package } from 'lucide-react';

const ActivityItem = ({ title, time }) => {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors px-2 -mx-2 rounded-lg">
      <div className="bg-gray-900 p-2 rounded-lg text-white shrink-0">
        <Package className="w-5 h-5" />
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm leading-tight">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
};

export default ActivityItem;
