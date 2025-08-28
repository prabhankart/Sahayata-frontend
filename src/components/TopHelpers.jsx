import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TopHelpers = () => {
  const [helpers, setHelpers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/users/top-helpers`);
        setHelpers(Array.isArray(data) ? data : []);
      } catch {
        setHelpers([]); // graceful
      }
    })();
  }, []);

  return (
    <div className="card p-6">
      <h3 className="text-xl font-bold mb-4">Top Helpers</h3>
      {helpers.length > 0 ? (
        <ul className="space-y-4">
          {helpers.map((h, i) => (
            <li key={h._id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full text-primary flex items-center justify-center font-bold">{i+1}</div>
                <span className="ml-3">{h.name}</span>
              </div>
              <span className="font-bold text-primary">{h.pledgeCount}</span>
            </li>
          ))}
        </ul>
      ) : <p className="text-muted">No helpers yet.</p>}
    </div>
  );
};
export default TopHelpers;
