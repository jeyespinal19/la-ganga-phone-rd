import React, { useState } from 'react';
import { X, DollarSign, Clock, Filter } from 'lucide-react';

interface FilterPanelProps {
    onApply: (filters: FilterState) => void;
    onReset: () => void;
    isOpen: boolean;
    onClose: () => void;
}

export interface FilterState {
    priceMin: number;
    priceMax: number;
    timeMax: number; // in hours
    status: 'all' | 'ending-soon' | 'new';
}

const DEFAULT_FILTERS: FilterState = {
    priceMin: 0,
    priceMax: 100000,
    timeMax: 999,
    status: 'all'
};

export const FilterPanel: React.FC<FilterPanelProps> = ({ onApply, onReset, isOpen, onClose }) => {
    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const handleReset = () => {
        setFilters(DEFAULT_FILTERS);
        onReset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
                onClick={onClose}
            ></div>

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-app-card border-l border-app-border z-50 shadow-2xl animate-in slide-in-from-right duration-300">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-app-border">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-app-accent" />
                            <h2 className="text-xl font-bold text-app-text">Filtros</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-app-bg rounded-lg transition-colors text-app-muted hover:text-app-text"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Price Range */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-app-text mb-3">
                                <DollarSign className="w-4 h-4" />
                                Rango de Precio
                            </label>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-app-muted mb-1 block">Mínimo (DOP)</label>
                                    <input
                                        type="number"
                                        value={filters.priceMin}
                                        onChange={(e) => setFilters({ ...filters, priceMin: Number(e.target.value) })}
                                        className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-app-text focus:outline-none focus:border-app-accent"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-app-muted mb-1 block">Máximo (DOP)</label>
                                    <input
                                        type="number"
                                        value={filters.priceMax}
                                        onChange={(e) => setFilters({ ...filters, priceMax: Number(e.target.value) })}
                                        className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-app-text focus:outline-none focus:border-app-accent"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Time Remaining */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-app-text mb-3">
                                <Clock className="w-4 h-4" />
                                Tiempo Restante
                            </label>
                            <div>
                                <label className="text-xs text-app-muted mb-1 block">Máximo (horas)</label>
                                <input
                                    type="number"
                                    value={filters.timeMax}
                                    onChange={(e) => setFilters({ ...filters, timeMax: Number(e.target.value) })}
                                    className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-app-text focus:outline-none focus:border-app-accent"
                                    min="1"
                                    placeholder="999"
                                />
                                <p className="text-xs text-app-muted mt-1">Mostrar subastas que terminan en menos de X horas</p>
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="text-sm font-semibold text-app-text mb-3 block">Estado</label>
                            <div className="space-y-2">
                                {[
                                    { value: 'all', label: 'Todas las Subastas' },
                                    { value: 'ending-soon', label: 'Terminan Pronto (< 1h)' },
                                    { value: 'new', label: 'Nuevas (> 24h)' }
                                ].map((option) => (
                                    <label
                                        key={option.value}
                                        className="flex items-center gap-3 p-3 bg-app-bg rounded-lg cursor-pointer hover:bg-app-border transition-colors"
                                    >
                                        <input
                                            type="radio"
                                            name="status"
                                            value={option.value}
                                            checked={filters.status === option.value}
                                            onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                                            className="w-4 h-4 text-app-accent"
                                        />
                                        <span className="text-sm text-app-text">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-app-border space-y-2">
                        <button
                            onClick={handleApply}
                            className="w-full bg-app-accent hover:bg-app-accentHover text-white py-3 rounded-xl font-semibold transition-all"
                        >
                            Aplicar Filtros
                        </button>
                        <button
                            onClick={handleReset}
                            className="w-full bg-app-bg hover:bg-app-border text-app-text py-3 rounded-xl font-semibold transition-all"
                        >
                            Resetear
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
