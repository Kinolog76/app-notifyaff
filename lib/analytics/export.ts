import { format } from "date-fns";

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
  const dateStr = format(new Date(), "yyyy-MM-dd");
  const filename = `linkguardian-analytics-${dateStr}.csv`;

  let csvContent = "";

  // Overview section
  csvContent += "Overview Statistics\n";
  csvContent += `Date Range,${format(dateRange.from, "yyyy-MM-dd")} to ${format(dateRange.to, "yyyy-MM-dd")}\n`;
  csvContent += `Total Checks,${data.overview.totalChecks}\n`;
  csvContent += `Average Response Time (ms),${data.overview.avgResponseTime}\n`;
  csvContent += `Uptime Rate (%),${data.overview.uptimeRate}\n`;
  csvContent += "\n";

  // Top Broken Links
  csvContent += "Top Broken Links\n";
  csvContent += "URL,Category,Broken Count,Last Broken\n";
  data.brokenLinks.forEach((link) => {
    csvContent += `"${link.url}","${link.category || "Uncategorized"}",${link.broken_count},"${link.last_broken}"\n`;
  });
  csvContent += "\n";

  // Slowest Links
  csvContent += "Slowest Links\n";
  csvContent += "URL,Category,Average Response Time (ms)\n";
  data.slowestLinks.forEach((link) => {
    csvContent += `"${link.url}","${link.category || "Uncategorized"}",${link.avg_response}\n`;
  });
  csvContent += "\n";

  // Category Performance
  csvContent += "Category Performance\n";
  csvContent += "Category,Total Links,Active Links,Broken Links,Average Response Time (ms)\n";
  data.categoryPerformance.forEach((cat) => {
    csvContent += `"${cat.category}",${cat.total_links},${cat.active_links},${cat.broken_links},${cat.avg_response}\n`;
  });

  // Create download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
