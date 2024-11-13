// src/components/ui/Dialog.jsx

import React from 'react';

export function Dialog({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children }) {
  return <div className="dialog-header">{children}</div>;
}

export function DialogTitle({ title }) {
  return <h2 className="dialog-title">{title}</h2>;
}

export function DialogContent({ children }) {
  return <div className="dialog-body">{children}</div>;
}

export function DialogFooter({ children }) {
  return <div className="dialog-footer">{children}</div>;
}
