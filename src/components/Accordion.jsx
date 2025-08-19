import { useState } from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

const Accordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-lg font-semibold text-secondary"
      >
        <span>{title}</span>
        {isOpen ? <MinusIcon className="h-6 w-6 text-primary" /> : <PlusIcon className="h-6 w-6 text-muted" />}
      </button>
      {isOpen && (
        <div className="mt-4 text-muted pr-6">
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;