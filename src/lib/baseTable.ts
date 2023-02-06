import { createBaseTable } from 'orchid-orm';

export const BaseTable = createBaseTable({
  columnTypes: (t) => ({
    ...t,
    // set default min and max for all text columns
    text: (min = 3, max = 100) => t.text(min, max),
    // parse timestamps to numbers
    timestamp: () => t.timestamp().asNumber(),
  }),
});
