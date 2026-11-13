import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  CreditCard,
  PackageCheck,
  Headphones,
  ShieldCheck,
  Truck,
  Wrench,
  Star,
  Clock,
  Sparkles,
  Award,
  LucideIcon
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  CreditCard,
  PackageCheck,
  Headphones,
  ShieldCheck,
  Truck,
  Wrench,
  Star,
  Clock,
  Sparkles,
  Award
};

const COLOR_MAP: Record<string, string> = {
  blue: 'text-blue-600 bg-blue-50 border-blue-100',
  amber: 'text-amber-600 bg-amber-50 border-amber-100',
  emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  rose: 'text-rose-600 bg-rose-50 border-rose-100',
  teal: 'text-teal-600 bg-teal-50 border-teal-100'
};

export const ValueProps: React.FC = () => {
  const { features } = useStore();

  if (features.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {features.map((item) => {
          const Icon = ICON_MAP[item.iconName] || ShieldCheck;
          const colorClasses = COLOR_MAP[item.colorTheme] || COLOR_MAP.blue;
          return (
            <div
              key={item.id}
              className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-center gap-2.5 sm:gap-3.5 group"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border ${colorClasses} group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs sm:text-sm font-black text-slate-800 line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-[10px] sm:text-xs text-slate-500 line-clamp-1 mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
