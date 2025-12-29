import { format } from 'date-fns';

export interface ExportData {
  overview: {
    totalChecks: number;
    avgResponseTime: number;
    uptimeRate: number;
  };
  brokenLinks: Array<{
    url: string;
    category: string | null;
    broken_count: number;
    last_broken: string;
  }>;
  slowestLinks: Array<{
    url: string;
    category: string | null;
    avg_response: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    total_links: number;
    active_links: number;
    broken_links: number;
    avg_response: number;
  }>;
}

export const exportToCSV = (data: ExportData, dateRange: { from: Date; to: Date }): void => {
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const filename = `linkguardian-analytics-${dateStr}.csv`;

  const formatSeconds = (ms?: number | null): string => {
    if (ms === null || ms === undefined) {
      return '\t0.00';
    }

    const seconds = ms / 1000;
    return `\t${seconds.toFixed(2)}`;
  };

  const safeNumber = (value?: number | null): string => `\t${value ?? 0}`;

  let csvContent = '';

  csvContent += 'Overview Statistics\n';
  csvContent += `Date Range;${format(dateRange.from, 'yyyy-MM-dd')} to ${format(
    dateRange.to,
    'yyyy-MM-dd',
  )}\n`;
  csvContent += `Total Checks;${safeNumber(data.overview.totalChecks)}\n`;
  csvContent += `Average Response Time (s);${formatSeconds(data.overview.avgResponseTime)}\n`;
  csvContent += `Uptime Rate (%);${safeNumber(data.overview.uptimeRate)}\n`;
  csvContent += '\n';

  csvContent += 'Top Broken Links\n';
  csvContent += 'URL;Category;Broken Count;Last Broken\n';

  data.brokenLinks.forEach((link) => {
    csvContent += `"${link.url}";"${link.category || 'Uncategorized'}";${safeNumber(
      link.broken_count,
    )};"${link.last_broken}"\n`;
  });

  csvContent += '\n';

  csvContent += 'Slowest Links\n';
  csvContent += 'URL;Category;Average Response Time (s)\n';

  data.slowestLinks.forEach((link) => {
    csvContent += `"${link.url}";"${link.category || 'Uncategorized'}";${formatSeconds(
      link.avg_response,
    )}\n`;
  });

  csvContent += '\n';

  csvContent += 'Category Performance\n';
  csvContent += 'Category;Total Links;Active Links;Broken Links;Average Response Time (s)\n';

  data.categoryPerformance.forEach((cat) => {
    csvContent += `"${cat.category}";${safeNumber(cat.total_links)};${safeNumber(
      cat.active_links,
    )};${safeNumber(cat.broken_links)};${formatSeconds(cat.avg_response)}\n`;
  });

  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = filename;
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
