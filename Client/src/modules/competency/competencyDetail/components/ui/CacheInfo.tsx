import React from "react";

const CacheInfo: React.FC<{ lastFetched: Date }> = ({ lastFetched }) => (
  <div className="mt-12 text-left text-sm text-gray-500 backdrop-blur-sm rounded-xl p-4">
    <p>Data cached at {lastFetched.toLocaleString()}</p>
    <p>Cache expires in {Math.max(0, Math.ceil((300000 - (Date.now() - lastFetched.getTime())) / 60000))} minutes</p>
  </div>
);

export default CacheInfo;
