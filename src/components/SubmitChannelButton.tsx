"use client";

import React from 'react';

interface SubmitChannelButtonProps {
  className?: string;
  children: React.ReactNode;
}

export function SubmitChannelButton({ className, children }: SubmitChannelButtonProps) {
  return (
    <button 
      onClick={() => window.dispatchEvent(new CustomEvent('open-submit-modal'))}
      className={className}
    >
      {children}
    </button>
  );
}
