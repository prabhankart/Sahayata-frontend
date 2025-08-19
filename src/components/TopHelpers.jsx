import { useState, useEffect } from 'react';
import axios from 'axios';

const TopHelpers = () => {
  const [helpers, setHelpers] = useState([]);

  useEffect(() => {
    // ... fetchTopHelpers function remains the same
  }, []);

  return (
    <div className="bg-surface p-6 rounded-xl shadow-md">
      <h3 className="text-xl font-bold mb-4 text-text-primary">Top Helpers</h3>
      {helpers.length > 0 ? (
        <ul className="space-y-4">
          {helpers.map((helper, index) => (
            <li key={helper._id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full text-primary flex items-center justify-center font-bold">{index + 1}</div>
                <span className="ml-3 text-text-secondary">{helper.name}</span>
              </div>
              <span className="font-bold text-primary">{helper.pledgeCount}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-text-secondary">No helpers yet.</p>
      )}
    </div>
  );
};

export default TopHelpers;