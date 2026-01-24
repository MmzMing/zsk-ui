import { FiFileText, FiVideo, FiUsers, FiTrendingUp } from "react-icons/fi";
import type { ColumnConfig, LineConfig } from "@ant-design/plots";

export const mockOverviewCards = [
  {
    key: "content",
    label: "文档总数",
    value: "128",
    delta: "+12",
    description: "近 7 天新增文档",
    icon: FiFileText
  },
  {
    key: "video",
    label: "视频总数",
    value: "36",
    delta: "+3",
    description: "近 7 天新增视频",
    icon: FiVideo
  },
  {
    key: "user",
    label: "活跃用户",
    value: "842",
    delta: "+18%",
    description: "近 30 天活跃占比",
    icon: FiUsers
  },
  {
    key: "trend",
    label: "内容访问量",
    value: "12.4k",
    delta: "+9%",
    description: "近 7 天整体访问趋势",
    icon: FiTrendingUp
  }
];

export const mockTrafficData: ColumnConfig["data"] = [
  { type: "文档", date: "周一", value: 320 },
  { type: "视频", date: "周一", value: 210 },
  { type: "文档", date: "周二", value: 380 },
  { type: "视频", date: "周二", value: 240 },
  { type: "文档", date: "周三", value: 420 },
  { type: "视频", date: "周三", value: 260 },
  { type: "文档", date: "周四", value: 460 },
  { type: "视频", date: "周四", value: 310 },
  { type: "文档", date: "周五", value: 510 },
  { type: "视频", date: "周五", value: 340 },
  { type: "文档", date: "周六", value: 610 },
  { type: "视频", date: "周六", value: 380 },
  { type: "文档", date: "周日", value: 580 },
  { type: "视频", date: "周日", value: 360 }
];

export const mockTrendData: LineConfig["data"] = [
  { date: "01-01", value: 420 },
  { date: "01-02", value: 460 },
  { date: "01-03", value: 510 },
  { date: "01-04", value: 530 },
  { date: "01-05", value: 560 },
  { date: "01-06", value: 590 },
  { date: "01-07", value: 640 }
];

export const mockMetricCards = [
  {
    key: "pv-today",
    label: "今日访问量",
    value: "3.2k",
    delta: "+12%",
    description: "相较昨日整体访问量变化",
    tone: "up"
  },
  {
    key: "pv-week",
    label: "近 7 天访问量",
    value: "21.4k",
    delta: "+18%",
    description: "一周内整体流量表现",
    tone: "up"
  },
  {
    key: "content-total",
    label: "内容总量",
    value: "164",
    delta: "+15",
    description: "文档 + 视频累积数量",
    tone: "up"
  },
  {
    key: "health-score",
    label: "系统健康度",
    value: "96",
    delta: "稳定",
    description: "综合请求成功率与告警情况评分",
    tone: "stable"
  }
];

export const mockBigScreenData: ColumnConfig["data"] = [
  { type: "文档", time: "10:00", value: 520 },
  { type: "视频", time: "10:00", value: 320 },
  { type: "文档", time: "12:00", value: 680 },
  { type: "视频", time: "12:00", value: 410 },
  { type: "文档", time: "14:00", value: 740 },
  { type: "视频", time: "14:00", value: 460 },
  { type: "文档", time: "16:00", value: 810 },
  { type: "视频", time: "16:00", value: 520 },
  { type: "文档", time: "18:00", value: 900 },
  { type: "视频", time: "18:00", value: 640 }
];
