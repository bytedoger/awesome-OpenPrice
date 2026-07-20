export function getRelativeTime(timeStr: string | null): string {
  if (!timeStr) return '暂无更新';
  const time = timeStr.includes('T') 
    ? new Date(timeStr).getTime() 
    : new Date(timeStr.replace(/-/g, '/')).getTime();
  
  if (isNaN(time)) return timeStr;
  
  const now = Date.now();
  const diff = Math.max(0, now - time);
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (mins > 0) return `${mins}分钟前`;
  return '刚刚';
}
