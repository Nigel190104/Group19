import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'ghost' | 'default'; // extend this if needed
};

export const Button = ({ variant = 'default', className = '', ...props }: ButtonProps) => {
  const base = 'px-4 py-2 rounded transition-colors duration-200 font-medium';
  const variantClasses =
    variant === 'ghost'
      ? 'bg-transparent text-gray-700 hover:bg-gray-100'
      : 'bg-blue-600 text-white hover:bg-blue-700';

  const combinedClasses = `${base} ${variantClasses} ${className}`;

  return (
    <button className={combinedClasses} {...props} />
  );
};
