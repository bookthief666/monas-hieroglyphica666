import { useEffect, useMemo, useState } from 'react';
import { readMirrorMemory } from './mirrorMemory.js';

export default function useMirrorRitual(theoremId) {
  const id = Number(theoremId) || 1;
  const [memory, setMemory] = useState(() => readMirrorMemory());
  const [lastOperation, setLastOperation] = useState(() => {
    const initial = readMirrorMemory();
    return Number(initial?.last?.theoremId) === id ? initial.last : null;
  });

  useEffect(() => {
    const refresh = () => {
      const next = readMirrorMemory();
      setMemory(next);
      if (Number(next?.last?.theoremId) === id) setLastOperation(next.last);
    };

    const onOperation = (event) => {
      const detail = event?.detail;
      if (!detail) return;
      const next = readMirrorMemory();
      setMemory(next);
      if (Number(detail.theoremId) === id) setLastOperation(detail);
    };

    refresh();
    window.addEventListener('monas:mirror-operation', onOperation);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('monas:mirror-operation', onOperation);
      window.removeEventListener('storage', refresh);
    };
  }, [id]);

  const theoremMemory = useMemo(
    () => memory?.theorems?.[String(id)] || null,
    [id, memory],
  );

  return {
    lastOperation,
    theoremMemory,
    memoryCount: Number(theoremMemory?.count) || 0,
    strongestCharge: Number(theoremMemory?.strongestCharge) || 0,
    totalOperations: Number(memory?.totalOperations) || 0,
  };
}
