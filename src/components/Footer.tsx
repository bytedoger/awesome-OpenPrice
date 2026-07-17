import React from 'react';

export const Footer = () => {
  return (
    <footer className="w-full py-8 mt-auto border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} OpenPrice. All rights reserved.
      </div>
    </footer>
  );
};
