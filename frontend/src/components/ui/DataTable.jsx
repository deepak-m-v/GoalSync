import { Search } from 'lucide-react';

export default function DataTable({
  columns,
  data,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  emptyMessage = 'No records found',
}) {
  return (
    <div className="card overflow-hidden">
      {(onSearchChange || filters) && (
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          {onSearchChange && (
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="input-field pl-10"
              />
            </div>
          )}
          {filters && <div className="flex flex-wrap gap-2">{filters}</div>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={row.id ?? i} className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
