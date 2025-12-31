import React, { useState } from 'react';

interface Column<T> {
    header: string;
    accessor: keyof T;
    // optional render function for custom cell
    render?: (value: any, row: T) => React.ReactNode;
}

interface DynamicTableProps<T> {
    columns: Column<T>[];
    data: T[];
    // optional initial sort key
    defaultSortKey?: keyof T;
}

/**
 * DynamicTable – a glass‑morphism table with neon header and smooth sorting animations.
 *
 * Usage example:
 *   const columns = [{ header: 'Name', accessor: 'name' }, { header: 'Price', accessor: 'price' }];
 *   <DynamicTable columns={columns} data={items} />
 */
export function DynamicTable<T extends Record<string, any>>({ columns, data, defaultSortKey }: DynamicTableProps<T>) {
    const [sortKey, setSortKey] = useState<keyof T | null>(defaultSortKey ?? null);
    const [ascending, setAscending] = useState(true);

    const sortedData = React.useMemo(() => {
        if (!sortKey) return data;
        const sorted = [...data].sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (aVal < bVal) return ascending ? -1 : 1;
            if (aVal > bVal) return ascending ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [data, sortKey, ascending]);

    const handleHeaderClick = (key: keyof T) => {
        if (sortKey === key) {
            setAscending(!ascending);
        } else {
            setSortKey(key);
            setAscending(true);
        }
    };

    return (
        <div className="glass p-4 rounded-xl overflow-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-app-accent text-app-bg">
                        {columns.map(col => (
                            <th
                                key={String(col.accessor)}
                                className="px-4 py-2 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => handleHeaderClick(col.accessor)}
                                style={{ animation: 'neon-underline 1.5s infinite' }}
                            >
                                {col.header}
                                {sortKey === col.accessor && (
                                    <span className="ml-1">{ascending ? '▲' : '▼'}</span>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((row, idx) => (
                        <tr
                            key={idx}
                            className="border-b border-app-border hover:bg-app-card/30 transition-colors"
                        >
                            {columns.map(col => (
                                <td key={String(col.accessor)} className="px-4 py-2 text-app-text">
                                    {col.render ? col.render(row[col.accessor], row) : String(row[col.accessor])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
