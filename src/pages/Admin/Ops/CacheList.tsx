import React, { useMemo, useState } from "react";
import {
  Select,
  SelectItem,
  Button,
  Card,
  Chip,
  Input,
  Pagination,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from "@heroui/react";
import { FiRefreshCw, FiSearch, FiTrash2 } from "react-icons/fi";

type CacheKeyItem = {
  id: string;
  key: string;
  type: "string" | "hash" | "list" | "set" | "zset";
  size: number;
  ttl: number | null;
  instanceId: string;
  instanceName: string;
  updatedAt: string;
};

type TtlFilter = "all" | "expiring" | "no-expire";

const cacheInstances: { id: string; name: string }[] = [
  { id: "redis-main", name: "Redis 主实例" },
  { id: "redis-session", name: "会话缓存" },
  { id: "redis-feed", name: "Feed 流缓存" }
];

const initialKeys: CacheKeyItem[] = [
  {
    id: "k1",
    key: "session:user:10001",
    type: "hash",
    size: 8.2,
    ttl: 420,
    instanceId: "redis-session",
    instanceName: "会话缓存",
    updatedAt: "10:41:03"
  },
  {
    id: "k2",
    key: "session:user:10002",
    type: "hash",
    size: 7.6,
    ttl: 300,
    instanceId: "redis-session",
    instanceName: "会话缓存",
    updatedAt: "10:40:12"
  },
  {
    id: "k3",
    key: "feed:home:hot",
    type: "zset",
    size: 24.3,
    ttl: null,
    instanceId: "redis-feed",
    instanceName: "Feed 流缓存",
    updatedAt: "10:39:27"
  },
  {
    id: "k4",
    key: "feed:user:10001",
    type: "zset",
    size: 16.7,
    ttl: 900,
    instanceId: "redis-feed",
    instanceName: "Feed 流缓存",
    updatedAt: "10:37:52"
  },
  {
    id: "k5",
    key: "config:site:settings",
    type: "hash",
    size: 3.1,
    ttl: null,
    instanceId: "redis-main",
    instanceName: "Redis 主实例",
    updatedAt: "10:36:18"
  },
  {
    id: "k6",
    key: "config:feature:beta",
    type: "string",
    size: 1.2,
    ttl: 1200,
    instanceId: "redis-main",
    instanceName: "Redis 主实例",
    updatedAt: "10:34:09"
  },
  {
    id: "k7",
    key: "doc:view:counter:123",
    type: "string",
    size: 0.8,
    ttl: 1800,
    instanceId: "redis-main",
    instanceName: "Redis 主实例",
    updatedAt: "10:30:42"
  },
  {
    id: "k8",
    key: "login:fail:ip:127.0.0.1",
    type: "string",
    size: 0.5,
    ttl: 240,
    instanceId: "redis-session",
    instanceName: "会话缓存",
    updatedAt: "10:29:15"
  },
  {
    id: "k9",
    key: "doc:recommend:homepage",
    type: "list",
    size: 12.4,
    ttl: 600,
    instanceId: "redis-feed",
    instanceName: "Feed 流缓存",
    updatedAt: "10:26:51"
  },
  {
    id: "k10",
    key: "user:profile:10001",
    type: "hash",
    size: 5.4,
    ttl: null,
    instanceId: "redis-main",
    instanceName: "Redis 主实例",
    updatedAt: "10:22:37"
  }
];

function formatSize(value: number) {
  if (value >= 1024) {
    const mb = value / 1024;
    return `${mb.toFixed(1)} MB`;
  }
  return `${value.toFixed(1)} KB`;
}

function formatTtl(ttl: number | null) {
  if (ttl === null) {
    return "永不过期";
  }
  if (ttl <= 0) {
    return "已过期";
  }
  if (ttl < 60) {
    return `${ttl} 秒`;
  }
  const minutes = Math.floor(ttl / 60);
  const seconds = ttl % 60;
  if (minutes < 60) {
    if (!seconds) {
      return `${minutes} 分钟`;
    }
    return `${minutes} 分 ${seconds} 秒`;
  }
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  if (!restMinutes) {
    return `${hours} 小时`;
  }
  return `${hours} 小时 ${restMinutes} 分`;
}

function CacheListPage() {
  const [keyword, setKeyword] = useState("");
  const [instanceFilter, setInstanceFilter] = useState<string>("all");
  const [ttlFilter, setTtlFilter] = useState<TtlFilter>("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<CacheKeyItem[]>(() => initialKeys);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const filteredItems = useMemo(() => {
    const trimmedKeyword = keyword.trim().toLowerCase();
    return items.filter(item => {
      if (trimmedKeyword && !item.key.toLowerCase().includes(trimmedKeyword)) {
        return false;
      }
      if (instanceFilter !== "all" && item.instanceId !== instanceFilter) {
        return false;
      }
      if (ttlFilter === "expiring") {
        if (item.ttl === null || item.ttl > 300) {
          return false;
        }
      } else if (ttlFilter === "no-expire") {
        if (item.ttl !== null) {
          return false;
        }
      }
      return true;
    });
  }, [items, keyword, instanceFilter, ttlFilter]);

  const pageSize = 8;
  const total = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageItems = filteredItems.slice(startIndex, endIndex);
  const hasSelection = selectedIds.length > 0;

  const handleTableSelectionChange = (keys: "all" | Set<React.Key>) => {
    if (keys === "all") {
      setSelectedIds(pageItems.map(item => item.id));
      return;
    }
    setSelectedIds(Array.from(keys).map(String));
  };

  const handleResetFilter = () => {
    setKeyword("");
    setInstanceFilter("all");
    setTtlFilter("all");
    setPage(1);
    setSelectedIds([]);
    setMessage("");
  };

  const handleBatchRefresh = () => {
    if (!hasSelection) {
      return;
    }
    const count = selectedIds.length;
    setMessage(`已提交批量刷新任务，共 ${count} 个键，实际逻辑待接入缓存接口。`);
  };

  const handleBatchDelete = () => {
    if (!hasSelection) {
      return;
    }
    const count = selectedIds.length;
    setItems(previous => previous.filter(item => !selectedIds.includes(item.id)));
    setSelectedIds([]);
    setMessage(`已从当前列表中删除 ${count} 个键，实际删除逻辑待接入缓存接口。`);
    setPage(1);
  };

  const handleItemRefresh = (item: CacheKeyItem) => {
    setMessage(`已对键 ${item.key} 触发单次刷新操作，实际逻辑待接入缓存接口。`);
  };

  const handleItemDelete = (item: CacheKeyItem) => {
    setItems(previous => previous.filter(row => row.id !== item.id));
    setSelectedIds(previous => previous.filter(id => id !== item.id));
    setMessage(`已从当前列表中删除键 ${item.key}，实际删除逻辑待接入缓存接口。`);
    setPage(1);
  };

  const handlePageChange = (next: number) => {
    if (next < 1 || next > totalPages) {
      return;
    }
    setPage(next);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-xs text-[var(--primary-color)]">
          <span>系统运维 · 缓存列表</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          管理与排查缓存键值数据
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl">
          通过键名搜索、实例筛选与过期时间过滤，快速锁定异常缓存键，并支持批量刷新与删除操作。
        </p>
      </div>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 space-y-3 text-xs border-b border-[var(--border-color)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <Input
                size="sm"
                variant="bordered"
                className="w-52"
                placeholder="按键名模糊搜索，如 session:user:"
                startContent={<FiSearch className="text-xs text-[var(--text-color-secondary)]" />}
                value={keyword}
                onValueChange={value => {
                  setKeyword(value);
                  setPage(1);
                }}
                classNames={{
                  inputWrapper: "h-8 text-xs",
                  input: "text-xs"
                }}
              />
              <Select
                aria-label="实例筛选"
                size="sm"
                className="w-40"
                selectedKeys={[instanceFilter]}
                onSelectionChange={keys => {
                  const key = Array.from(keys)[0];
                  setInstanceFilter(key ? String(key) : "all");
                  setPage(1);
                }}
                items={[
                  { label: "全部实例", value: "all" },
                  ...cacheInstances.map(item => ({
                    label: item.name,
                    value: item.id
                  }))
                ]}
                isClearable
              >
                {item => (
                  <SelectItem key={item.value}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
              <Select
                aria-label="过期时间筛选"
                size="sm"
                className="w-44"
                selectedKeys={[ttlFilter]}
                onSelectionChange={keys => {
                  const key = Array.from(keys)[0];
                  setTtlFilter(key ? String(key) as TtlFilter : "all");
                  setPage(1);
                }}
                items={[
                  { label: "全部过期时间", value: "all" },
                  { label: "即将过期（≤5 分钟）", value: "expiring" },
                  { label: "永不过期", value: "no-expire" }
                ]}
                isClearable
              >
                {item => (
                  <SelectItem key={item.value}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
              <Button
                size="sm"
                variant="light"
                className="h-8 text-xs"
                onPress={handleResetFilter}
              >
                重置筛选
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="flat"
                className="h-8 text-xs"
                startContent={<FiRefreshCw className="text-xs" />}
                disabled={!hasSelection}
                onPress={handleBatchRefresh}
              >
                批量刷新
              </Button>
              <Button
                size="sm"
                color="danger"
                variant="flat"
                className="h-8 text-xs"
                startContent={<FiTrash2 className="text-xs" />}
                disabled={!hasSelection}
                onPress={handleBatchDelete}
              >
                批量删除
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-color-secondary)]">
            <span>当前列表仅为示例数据，实际字段与操作行为请以接口实现为准。</span>
          </div>
        </div>

        {message && (
          <div className="px-4 py-2 flex items-center justify-between text-xs border-b border-[var(--border-color)] bg-[var(--bg-elevated)]/80">
            <span className="text-[var(--text-color-secondary)]">{message}</span>
            <Button
              size="sm"
              variant="light"
              className="h-7 text-xs"
              onPress={() => setMessage("")}
            >
              知道了
            </Button>
          </div>
        )}

        <div className="p-3">
          <div className="overflow-auto border border-[var(--border-color)] rounded-lg">
            <Table
              aria-label="缓存键列表"
              className="min-w-full text-xs"
              selectionMode="multiple"
              selectedKeys={selectedIds.length ? new Set(selectedIds) : new Set()}
              onSelectionChange={handleTableSelectionChange}
            >
              <TableHeader className="bg-[var(--bg-elevated)]/80">
                <TableColumn className="px-3 py-2 text-left font-medium">
                  键名
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  所属实例
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  类型
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  大小
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  过期时间
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  最后更新时间
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  操作
                </TableColumn>
              </TableHeader>
              <TableBody
                items={pageItems}
                emptyContent="未找到匹配的缓存键，可调整筛选条件后重试。"
              >
                {item => {
                  const expiring = item.ttl !== null && item.ttl <= 300 && item.ttl > 0;
                  return (
                    <TableRow
                      key={item.id}
                      className="border-t border-[var(--border-color)] hover:bg-[var(--bg-elevated)]/60"
                    >
                      <TableCell className="px-3 py-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-xs break-all">
                            {item.key}
                          </span>
                          <span className="text-xs text-[var(--text-color-secondary)]">
                            ID: {item.id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <span>{item.instanceName}</span>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <Chip
                          size="sm"
                          variant="flat"
                          className="text-xs"
                        >
                          {item.type.toUpperCase()}
                        </Chip>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <span>{formatSize(item.size)}</span>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <div className="flex flex-col gap-0.5">
                          <span>{formatTtl(item.ttl)}</span>
                          {expiring && (
                            <span className="text-xs text-orange-500">
                              即将过期，建议尽快确认是否需要续期或删除
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <span>{item.updatedAt}</span>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <div className="flex flex-wrap gap-1.5">
                          <Button
                            size="sm"
                            variant="light"
                            className="h-7 text-xs"
                            onPress={() => handleItemRefresh(item)}
                          >
                            刷新
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="light"
                            className="h-7 text-xs"
                            onPress={() => handleItemDelete(item)}
                          >
                            删除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }}
              </TableBody>
            </Table>
          </div>

          <div className="mt-3 flex flex-col gap-2 text-xs md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <span>
                共 {total} 条记录，当前第 {currentPage} / {totalPages} 页
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Pagination
                size="sm"
                total={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                showControls
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default CacheListPage;
