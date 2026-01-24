import React, { useState, useEffect } from "react";
import {
  SelectItem,
  Button,
  Card,
  Chip,
  Pagination,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  addToast
} from "@heroui/react";
import { FiRefreshCw, FiRotateCcw, FiTrash2 } from "react-icons/fi";
import { AdminSelect } from "@/components/Admin/AdminSelect";
import { Loading } from "@/components/Loading";
import { 
  CacheKeyItem, 
  fetchCacheKeys, 
  fetchCacheInstances, 
  refreshCacheKey, 
  deleteCacheKey, 
  batchRefreshCacheKeys, 
  batchDeleteCacheKeys 
} from "../../../api/admin/ops";

type TtlFilter = "all" | "expiring" | "no-expire";

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

import { AdminSearchInput } from "@/components/Admin/AdminSearchInput";

function CacheListPage() {
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [instanceFilter, setInstanceFilter] = useState<string>("all");
  const [ttlFilter, setTtlFilter] = useState<TtlFilter>("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<CacheKeyItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [cacheInstances, setCacheInstances] = useState<{ id: string; name: string }[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function loadInstances() {
      try {
        const res = await fetchCacheInstances();
        if (res) {
          setCacheInstances(res);
        }
      } catch (error) {
        console.error("Failed to load cache instances:", error);
      }
    }
    loadInstances();
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetchCacheKeys({
          keyword,
          instanceId: instanceFilter,
          ttlFilter,
          page,
          pageSize: 8
        });
        if (res) {
          setItems(res.list);
          setTotal(res.total);
        }
      } catch (error) {
        console.error("Failed to load cache keys:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [keyword, instanceFilter, ttlFilter, page]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  
  // Client-side filtering is no longer needed as we fetch filtered data
  // But for the mock implementation in API, it handles filtering. 
  // However, `fetchCacheKeys` mock implementation returns filtered list.
  // So we just use `items`.
  const pageItems = items; 

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
  };

  const handleBatchRefresh = async () => {
    if (!hasSelection) {
      return;
    }
    setLoading(true);
    try {
      await batchRefreshCacheKeys({ ids: selectedIds });
      // 校验响应，如果后端返回了错误信息或非200状态（假设 request 已经处理了非200，但我们这里可以额外校验业务逻辑）
      // 如果 request.post 返回的是数据，通常认为成功。如果有特定的 message 且 res 为空或不符合预期，可以抛出错误。
      addToast({
        title: "批量刷新成功",
        description: `已提交 ${selectedIds.length} 个键的刷新任务。`,
        color: "success"
      });
      setSelectedIds([]);
    } catch (error) {
      console.error("handleBatchRefresh error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDelete = async () => {
    if (!hasSelection) {
      return;
    }
    setLoading(true);
    try {
      await batchDeleteCacheKeys({ ids: selectedIds });
      addToast({
        title: "批量删除成功",
        description: `已成功删除 ${selectedIds.length} 个缓存键。`,
        color: "success"
      });
      setSelectedIds([]);
      // 重新加载当前页数据
      const res = await fetchCacheKeys({
        keyword,
        instanceId: instanceFilter,
        ttlFilter,
        page,
        pageSize: 8
      });
      if (res) {
        setItems(res.list);
        setTotal(res.total);
      }
    } catch (error) {
      console.error("handleBatchDelete error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemRefresh = async (item: CacheKeyItem) => {
    setLoading(true);
    try {
      await refreshCacheKey({ id: item.id });
      addToast({
        title: "刷新成功",
        description: `已对键 ${item.key} 触发单次刷新操作。`,
        color: "success"
      });
    } catch (error) {
      console.error("handleItemRefresh error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemDelete = async (item: CacheKeyItem) => {
    setLoading(true);
    try {
      await deleteCacheKey({ id: item.id });
      addToast({
        title: "删除成功",
        description: `已删除缓存键 ${item.key}。`,
        color: "success"
      });
      // 重新加载当前页数据
      const res = await fetchCacheKeys({
        keyword,
        instanceId: instanceFilter,
        ttlFilter,
        page,
        pageSize: 8
      });
      if (res) {
        setItems(res.list);
        setTotal(res.total);
      }
    } catch (error) {
      console.error("handleItemDelete error:", error);
    } finally {
      setLoading(false);
    }
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
              <AdminSearchInput
                className="w-52"
                placeholder="按键名模糊搜索，如 session:user:"
                value={keyword}
                onValueChange={value => {
                  setKeyword(value);
                  setPage(1);
                }}
              />
              <AdminSelect
                aria-label="缓存实例筛选"
                size="sm"
                className="w-40"
                selectedKeys={[instanceFilter]}
                onSelectionChange={keys => {
                  const key = Array.from(keys)[0];
                  setInstanceFilter(key ? String(key) : "all");
                  setPage(1);
                }}
                items={[
                  { label: "全部实例", id: "all" },
                  ...cacheInstances
                ]}
              >
                {(item: { id: string; name?: string; label?: string }) => (
                  <SelectItem key={item.id}>
                    {item.name || item.label}
                  </SelectItem>
                )}
              </AdminSelect>
              <AdminSelect
                aria-label="过期时间筛选"
                size="sm"
                className="w-32"
                selectedKeys={[ttlFilter]}
                onSelectionChange={keys => {
                  const key = Array.from(keys)[0];
                  setTtlFilter(key ? (String(key) as TtlFilter) : "all");
                  setPage(1);
                }}
                items={[
                  { label: "全部过期", value: "all" },
                  { label: "即将过期", value: "expiring" },
                  { label: "永不过期", value: "no-expire" }
                ]}
              >
                {(item: { label: string; value: string }) => (
                  <SelectItem key={item.value}>
                    {item.label}
                  </SelectItem>
                )}
              </AdminSelect>
              <Tooltip content="重置筛选">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  onPress={handleResetFilter}
                >
                  <FiRotateCcw className="text-sm" />
                </Button>
              </Tooltip>
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
              items={loading ? [] : pageItems}
              emptyContent="未找到匹配的缓存键，可调整筛选条件后重试。"
              isLoading={loading}
              loadingContent={<Loading height={200} text="获取缓存键数据中..." />}
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
