import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'lg', // Default to large for elderly users
  children,
  className = '',
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'secondary':
        return 'bg-gray-500 hover:bg-gray-600 text-white';
      case 'success':
        return 'bg-basarili hover:bg-green-600 text-white';
      case 'warning':
        return 'bg-uyari hover:bg-orange-600 text-white';
      case 'danger':
        return 'bg-hata hover:bg-red-600 text-white';
      default:
        return 'bg-blue-500 hover:bg-blue-600 text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 h-12 text-lg rounded-lg';
      case 'md':
        return 'px-6 py-3 h-16 text-xl rounded-xl';
      case 'lg':
        return 'px-8 py-4 h-18 text-2xl font-bold rounded-2xl shadow-lg';
      case 'xl':
        return 'px-10 py-5 h-20 text-xxx font-bold rounded-2xl shadow-lg';
      default:
        return 'px-8 py-4 h-18 text-2xl font-bold rounded-2xl shadow-lg';
    }
  };

  return (
    <button
      className={`
        w-full
        transition-all
        duration-200
        active:scale-95
        focus:outline-none
        focus:ring-4
        focus:ring-opacity-30
        font-semibold
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
