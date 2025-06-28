import { useState, useCallback } from 'react';

export default function useRecordHint(timeoutMS = 1500) {
  const [showHint, setShowHint] = useState(false);

  const show = useCallback(() => {
    setShowHint(true);
    setTimeout(() => setShowHint(false), timeoutMS);
  }, [timeoutMS]);

  return { showHint, show };
}
