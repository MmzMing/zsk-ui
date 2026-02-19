/**
 * 文本处理工具函数
 * @module utils/textUtils
 * @description 提供常用的文本处理功能
 */

/**
 * 截断文本，超出长度显示省略号
 * @param text 原始文本
 * @param maxLength 最大长度，默认 100
 * @returns 截断后的文本
 */
export const truncate = (text: string, maxLength: number = 100): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * 格式化文章摘要
 * @param summary 文章摘要
 * @param maxLength 最大长度，默认 100
 * @returns 格式化后的摘要
 */
export const formatSummary = (summary: string, maxLength: number = 100): string => {
  return truncate(summary, maxLength);
};

/**
 * 移除 HTML 标签
 * @param html HTML 字符串
 * @returns 纯文本
 */
export const stripHtml = (html: string): string => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
};

/**
 * 获取文本的字数统计
 * @param text 文本内容
 * @returns 字数
 */
export const getWordCount = (text: string): number => {
  if (!text) return 0;
  /** 移除多余空白 */
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (!cleaned) return 0;
  /** 中文按字符计算，英文按单词计算 */
  const chineseChars = (cleaned.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = cleaned
    .replace(/[\u4e00-\u9fa5]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return chineseChars + englishWords;
};

/**
 * 估算阅读时间（分钟）
 * @param text 文本内容
 * @param wordsPerMinute 每分钟阅读字数，默认 300
 * @returns 阅读时间（分钟）
 */
export const estimateReadingTime = (
  text: string,
  wordsPerMinute: number = 300
): number => {
  const wordCount = getWordCount(text);
  return Math.ceil(wordCount / wordsPerMinute);
};

/**
 * 格式化阅读时间显示
 * @param minutes 分钟数
 * @returns 格式化后的时间字符串
 */
export const formatReadingTime = (minutes: number): string => {
  if (minutes < 1) return "1 分钟阅读";
  if (minutes < 60) return `${minutes} 分钟阅读`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} 小时阅读`;
  return `${hours} 小时 ${mins} 分钟阅读`;
};

/**
 * 高亮关键词
 * @param text 原始文本
 * @param keyword 关键词
 * @returns React 元素数组（需在组件中使用）
 */
export const highlightKeyword = (
  text: string,
  keyword: string
): Array<{ text: string; highlighted: boolean }> => {
  if (!keyword || !text) {
    return [{ text, highlighted: false }];
  }

  const regex = new RegExp(`(${escapeRegExp(keyword)})`, "gi");
  const parts = text.split(regex);

  return parts.map((part) => ({
    text: part,
    highlighted: part.toLowerCase() === keyword.toLowerCase()
  }));
};

/**
 * 转义正则表达式特殊字符
 * @param string 原始字符串
 * @returns 转义后的字符串
 */
export const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * 生成文本摘要（取前 N 句）
 * @param text 原始文本
 * @param sentences 句子数量，默认 2
 * @returns 摘要文本
 */
export const generateExcerpt = (text: string, sentences: number = 2): string => {
  if (!text) return "";
  const cleanText = stripHtml(text).trim();
  const sentenceList = cleanText.split(/[。！？.!?]+/).filter(Boolean);
  return sentenceList.slice(0, sentences).join("。") + (sentenceList.length > sentences ? "。" : "");
};

/**
 * 格式化数字显示（带单位）
 * @param num 数字
 * @returns 格式化后的字符串
 */
export const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + "w";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return String(num);
};

/**
 * 格式化浏览量显示
 * @param views 浏览量
 * @returns 格式化后的字符串
 */
export const formatViews = (views: number): string => {
  return `${formatNumber(views)} 阅读`;
};

export default {
  truncate,
  formatSummary,
  stripHtml,
  getWordCount,
  estimateReadingTime,
  formatReadingTime,
  highlightKeyword,
  escapeRegExp,
  generateExcerpt,
  formatNumber,
  formatViews
};
