// Button.jsx
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Button = ({ variant = 'primary', size = 'md', className, children, ...props }) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-500',
    outline: 'text-blue-500 bg-transparent border border-blue-500 hover:bg-blue-50 focus:ring-blue-500',
    destructive: 'text-white bg-red-500 hover:bg-red-600 focus:ring-red-500',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
  };

  return (
    <button
      className={classNames(baseStyle, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'outline', 'destructive']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Button;
