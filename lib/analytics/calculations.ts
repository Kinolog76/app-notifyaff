export const formatResponseTime = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

export const formatUptime = (percentage: number): string => {
  return `${percentage.toFixed(2)}%`;
};

export const truncateUrl = (url: string, maxLength: number = 40): string => {
  if (url.length <= maxLength) return url;
  return `${url.substring(0, maxLength - 3)}...`;
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "active":
      return "#22c55e"; // green
    case "broken":
      return "#ef4444"; // red
    case "warning":
      return "#f59e0b"; // amber
    case "checking":
      return "#6b7280"; // gray
    default:
      return "#8b5cf6"; // purple
  }
};

export const getResponseTimeColor = (ms: number): string => {
  if (ms < 1000) return "text-green-600";
  if (ms < 2000) return "text-yellow-600";
  return "text-red-600";
};
