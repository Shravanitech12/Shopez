import React from 'react';

const PriceDisplay = ({ price, discount = 0, finalPrice, size = 'md' }) => {
  const basePrice = Number(price) || 0;
  const disc = Number(discount) || 0;
  const calculatedFinal =
    finalPrice !== undefined
      ? Number(finalPrice)
      : Math.round(basePrice - (basePrice * disc) / 100);

  const sizeStyles = {
    sm: {
      final: 'text-base font-bold text-slate-900',
      original: 'text-xs text-slate-400 line-through',
      badge: 'text-[10px] px-1.5 py-0.5',
    },
    md: {
      final: 'text-xl font-bold text-slate-900',
      original: 'text-sm text-slate-400 line-through',
      badge: 'text-xs px-2 py-0.5',
    },
    lg: {
      final: 'text-3xl font-extrabold text-slate-900',
      original: 'text-lg text-slate-400 line-through',
      badge: 'text-xs px-2.5 py-1',
    },
  };

  const style = sizeStyles[size] || sizeStyles.md;

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className={style.final}>${calculatedFinal.toFixed(2)}</span>
      {disc > 0 && (
        <>
          <span className={style.original}>${basePrice.toFixed(2)}</span>
          <span
            className={`${style.badge} font-bold rounded-lg bg-emerald-100 text-emerald-800`}
          >
            {disc}% OFF
          </span>
        </>
      )}
    </div>
  );
};

export default PriceDisplay;
