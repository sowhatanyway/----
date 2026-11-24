import React, { useState } from 'react';
import { ProductVisualKey } from '../types.ts';
import { PRODUCT_IMAGES } from '../data/productImages.ts';
import { BottleSvg } from './BottleSvg.tsx';

interface ProductImageProps {
  visualKey: ProductVisualKey;
  src?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  visualKey,
  src,
  alt,
  className = '',
  imgClassName = ''
}) => {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = src || PRODUCT_IMAGES[visualKey];

  if (hasError || !resolvedSrc) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-[#EFECE6] to-[#E2DDD3] p-6 ${className}`}
      >
        <BottleSvg scentKey={visualKey} className="w-2/3 h-2/3 max-w-[160px] max-h-[160px]" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#EAE7DF] ${className}`}>
      <img
        src={resolvedSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover ${imgClassName}`}
      />
    </div>
  );
};
