import { PendingTasks, inject } from '@angular/core';

export function injectRunForRender(): (work: () => Promise<unknown>) => void {
  const pending = inject(PendingTasks);
  return (work) => pending.run(work);
}
