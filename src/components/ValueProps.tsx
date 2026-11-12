import React from 'react';
import { CreditCard, PackageCheck, Headphones, ShieldCheck } from 'lucide-react';

export const ValueProps: React.FC = () => {
  const props = [
    {
      title: "ادفع بالطريقة اللي تناسبك",
      subtitle: "كاش عند الاستلام، إنستاباي، أو فودافون كاش",
      icon: CreditCard,
      color: "text-blue-600 bg-blue-50 border-blue-100"
    },
    {
      title: "توصيل لكل مصر",
      subtitle: "شحن سريع وآمن حتى باب موقعك أو ورشتك",
      icon: PackageCheck,
      color: "text-amber-600 bg-amber-50 border-amber-100"
    },
    {
      title: "استشارة فنية مجانية",
      subtitle: "خبراء لاختيار نوع البويات والعدد ولوازم المعمار",
      icon: Headphones,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100"
    },
    {
      title: "منتجات أصلية 100%",
      subtitle: "ضمان الوكلاء المعتمدين وفواتير رسمية",
      icon: ShieldCheck,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {props.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-center gap-2.5 sm:gap-3.5 group"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border ${item.color} group-hover:scale-105 transition-transform`}>
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
