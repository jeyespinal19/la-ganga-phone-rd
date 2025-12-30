import { AuctionItem, User } from '../types';

/**
 * Export auction items to CSV format
 */
export const exportItemsToCSV = (items: AuctionItem[]): void => {
    const headers = ['ID', 'Nombre', 'Marca', 'Especificaciones', 'Puja Actual (DOP)', 'Precio Reserva (DOP)', 'Tiempo Restante'];

    const csvContent = [
        headers.join(','),
        ...items.map(item => [
            item.id,
            `"${item.name}"`,
            item.brand,
            `"${item.specs}"`,
            item.currentBid,
            item.reservePrice || '',
            `"${item.timeLeft}"`
        ].join(','))
    ].join('\n');

    downloadFile(csvContent, `subastas_${getDateString()}.csv`, 'text/csv');
};

/**
 * Export users (winners) to CSV format
 */
export const exportUsersToCSV = (users: User[], winnerStats?: Record<string, { count: number; total: number }>): void => {
    const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Rol', 'Estado', 'Productos Ganados', 'Total Comprometido (DOP)'];

    const csvContent = [
        headers.join(','),
        ...users.map(user => [
            user.id,
            `"${user.name}"`,
            user.email,
            user.phone || '',
            user.role,
            user.status,
            winnerStats?.[user.id]?.count || 0,
            winnerStats?.[user.id]?.total || 0
        ].join(','))
    ].join('\n');

    downloadFile(csvContent, `clientes_${getDateString()}.csv`, 'text/csv');
};

/**
 * Export activity log/analytics data to CSV
 */
export const exportActivityToCSV = (activityLog: any[]): void => {
    const headers = ['Fecha/Hora', 'Tipo', 'Mensaje', 'Usuario', 'Monto (DOP)'];

    const csvContent = [
        headers.join(','),
        ...activityLog.map(log => [
            new Date(log.timestamp).toLocaleString('es-DO'),
            log.type,
            `"${log.message}"`,
            log.user || '',
            log.amount || ''
        ].join(','))
    ].join('\n');

    downloadFile(csvContent, `actividad_${getDateString()}.csv`, 'text/csv');
};

/**
 * Format auction data for report (text format)
 */
export const generateTextReport = (items: AuctionItem[]): string => {
    const totalValue = items.reduce((sum, item) => sum + item.currentBid, 0);
    const avgBid = totalValue / items.length;

    let report = '═════════════════════════════════════════\n';
    report += '     LA GANGA PHONE RD - REPORTE\n';
    report += `     ${new Date().toLocaleDateString('es-DO')}\n`;
    report += '═════════════════════════════════════════\n\n';

    report += `Total de Subastas Activas: ${items.length}\n`;
    report += `Valor Total en Subastas: DOP ${totalValue.toLocaleString()}\n`;
    report += `Puja Promedio: DOP ${avgBid.toLocaleString()}\n\n`;

    report += 'DETALLE DE SUBASTAS:\n';
    report += '─────────────────────────────────────────\n\n';

    items.forEach((item, index) => {
        report += `${index + 1}. ${item.name}\n`;
        report += `   Marca: ${item.brand}\n`;
        report += `   Puja Actual: DOP ${item.currentBid.toLocaleString()}\n`;
        if (item.reservePrice) {
            report += `   Precio Reserva: DOP ${item.reservePrice.toLocaleString()}\n`;
        }
        report += `   Tiempo Restante: ${item.timeLeft}\n\n`;
    });

    report += '═════════════════════════════════════════\n';
    report += 'Generado automáticamente por La Ganga Phone RD\n';

    return report;
};

/**
 * Download text report
 */
export const downloadTextReport = (items: AuctionItem[]): void => {
    const report = generateTextReport(items);
    downloadFile(report, `reporte_${getDateString()}.txt`, 'text/plain');
};

/**
 * Helper function to trigger file download
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Get formatted date string for filenames
 */
function getDateString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Copy data to clipboard as JSON
 */
export const copyToClipboard = async (data: any): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        return false;
    }
};
