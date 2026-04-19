import React from 'react';
import { AlertTriangle } from 'lucide-react';

const StatCard = ({ title, amount, subtitle, icon, alert }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-600 font-medium text-sm">{title}</h3>
        <div className="text-gray-700">
          {icon}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-2">
        <div>
          {title.includes('Stok') ? (
            <div className="flex flex-col">
              <span className="text-4xl font-bold text-gray-900 leading-none">{amount.split(' ')[0]}</span>
              <span className="font-bold text-gray-900">{amount.split(' ').slice(1).join(' ')}</span>
            </div>
          ) : (
            <div className="text-3xl font-bold text-gray-900 leading-tight">
              {amount.split(' ').map((word, index) => (
                <div key={index} className={index === 0 ? "text-xl" : ""}>
                  {word}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {alert && (
          <div className="text-red-500">
            <AlertTriangle className="w-12 h-12 fill-red-500 stroke-white" />
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        {subtitle}
      </div>
    </div>
  );
};

export default StatCard;
