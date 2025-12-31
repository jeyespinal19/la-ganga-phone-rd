export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(value);
};
