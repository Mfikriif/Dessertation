import React from 'react';
import { AlertTriangle } from 'lucide-react';

const StatCard = ({ title, amount, subtitle, icon, alert }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center p-3 w-44 aspect-square text-center shrink-0">
      {/* Icon */}
      <div className={`mb-2 ${alert ? "text-red-500" : "text-gray-700"}`}>
        {alert ? <AlertTriangle className="w-8 h-8 fill-red-500 stroke-white" /> : React.cloneElement(icon, { className: 'w-7 h-7' })}
      </div>

      {/* Title */}
      <h3 className="text-gray-600 font-medium text-xs mb-1">{title}</h3>

      {/* Amount */}
      <div className="flex flex-col items-center justify-center mb-1">
        {title.includes('Stok') ? (
          <>
            <span className="text-3xl font-bold text-gray-900 leading-none">{amount.split(' ')[0]}</span>
            <span className="font-bold text-gray-900 text-xs mt-1">{amount.split(' ').slice(1).join(' ')}</span>
          </>
        ) : (
          <div className="text-xl font-bold text-gray-900 leading-tight flex flex-col items-center">
            {amount.split(' ').map((word, index) => (
              <span key={index} className={index === 0 ? "text-xs text-gray-500 font-normal mb-0.5" : ""}>
                {word}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Subtitle */}
      <div className="text-[10px] text-gray-400 mt-1">
        {subtitle}
      </div>
    </div>
  );
};

export default StatCard;
