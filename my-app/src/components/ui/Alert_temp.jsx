// Alert.jsx
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Alert = ({ variant = 'info', className, children }) => {
  const baseStyle = 'p-4 rounded-md flex items-center';
  const variants = {
    info: 'text-blue-700 bg-blue-50 border border-blue-200',
    success: 'text-green-700 bg-green-50 border border-green-200',
    warning: 'text-yellow-700 bg-yellow-50 border border-yellow-200',
    danger: 'text-red-700 bg-red-50 border border-red-200',
  };

  return (
    <div className={classNames(baseStyle, variants[variant], className)}>
      {children}
    </div>
  );
};

Alert.propTypes = {
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'danger']),
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Alert;
