// ===== 1. 依赖导入区域 =====
import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  Button,
  SelectItem,
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
import { FiCopy, FiRefreshCw, FiRotateCcw, FiTrash2, FiXCircle } from "react-icons/fi";
import { AdminSearchInput } from "@/components/Admin/AdminSearchInput";
import { AdminSelect } from "@/components/Admin/AdminSelect";
import { Loading } from "@/components/Loading";
import {
  type TokenItem,
  type TokenStatus,
  fetchTokenList,
  revokeToken,
  batchRevokeTokens,
  batchDeleteTokens
} from "@/api/admin/system";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
/** 状态筛选类型 */
type StatusFilter = "all" | "active" | "no_active";

// ===== 4. 通用工具函数区域 =====
/**
 * 获取令牌类型标签
 * @param type 令牌类型
 * @returns 对应的中文标签
 */
const getTokenTypeLabel = (type: TokenItem["type"]): string => {
  const typeMap: Record<TokenItem["type"], string> = {
    api: "公共 API 令牌",
    personal: "个人访问令牌",
    internal: "内部系统令牌"
  };
  return typeMap[type] || "未知类型";
};

/**
 * 获取状态标签属性
 * @param status 令牌状态
 * @returns 状态标签的颜色和文字
 */
const getStatusChipProps = (status: TokenStatus) => {
  const statusMap: Record<TokenStatus, { color: "success" | "warning" | "danger"; label: string }> = {
    active: { color: "success", label: "有效" },
    expired: { color: "warning", label: "已过期" },
    revoked: { color: "danger", label: "已吊销" }
  };
  return statusMap[status] || { color: "danger", label: "未知" };
};

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====
/**
 * 令牌管理页面组件
 * @returns 页面渲染内容
 */
function TokenPage() {
  // --- 状态定义 ---
  /** 搜索关键词 */
  const [keyword, setKeyword] = useState("");
  /** 状态筛选值 */
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  /** 当前页码 */
  const [page, setPage] = useState(1);
  /** 令牌原始数据列表 */
  const [items, setItems] = useState<TokenItem[]>([]);
  /** 是否正在加载 */
  const [isLoading, setIsLoading] = useState(false);
  /** 选中项的 ID 集合 */
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // --- 常量定义 ---
  /** 每页显示条数 */
  const pageSize = 6;

  // --- 数据计算逻辑 ---
  /**
   * 过滤后的列表数据
   */
  const filteredItems = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    return items.filter(item => {
      // 关键词搜索：名称、令牌片段、绑定账号
      if (trimmed) {
        const content = `${item.name} ${item.token} ${item.boundUser}`.toLowerCase();
        if (!content.includes(trimmed)) return false;
      }
      // 状态筛选
      if (statusFilter === "active" && item.status !== "active") return false;
      if (statusFilter === "no_active" && item.status === "active") return false;
      return true;
    });
  }, [items, keyword, statusFilter]);

  /** 数据总条数 */
  const total = filteredItems.length;
  /** 总页数 */
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  /** 当前页显示的数据 */
  const pageItems = useMemo(() => {
    return filteredItems.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredItems, page, pageSize]);

  // --- 业务操作逻辑 ---
  /**
   * 加载令牌列表数据
   */
  const loadTokenList = useCallback(async () => {
    const res = await fetchTokenList(setIsLoading);
    if (res && res.data) {
      setItems(res.data);
    }
  }, []);

  /**
   * 重置筛选条件
   */
  const handleResetFilter = () => {
    setKeyword("");
    setStatusFilter("all");
    setPage(1);
  };

  /**
   * 复制令牌内容到剪贴板
   * @param item 令牌项
   */
  const handleCopyToken = (item: TokenItem) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(item.token);
      addToast({
        title: "复制成功",
        description: `已复制令牌 ${item.name} 到剪贴板，请妥善保管。`,
        color: "success"
      });
    }
  };

  /**
   * 吊销单个令牌
   * @param item 令牌项
   */
  const handleRevokeToken = async (item: TokenItem) => {
    if (item.status === "revoked") return;

    const res = await revokeToken(item.id, setIsLoading);

    if (res && res.data) {
      addToast({ title: "操作成功", color: "success" });
      loadTokenList();
    }
  };

  /**
   * 批量吊销选中的令牌
   */
  const handleBatchRevoke = async () => {
    const ids = Array.from(selectedKeys);
    if (ids.length === 0) return;

    const res = await batchRevokeTokens(ids, setIsLoading);

    if (res && res.data) {
      addToast({
        title: `成功吊销 ${ids.length} 个令牌`,
        color: "success"
      });
      setSelectedKeys(new Set());
      loadTokenList();
    }
  };

  /**
   * 批量删除选中的令牌
   */
  const handleBatchDelete = async () => {
    const ids = Array.from(selectedKeys);
    if (ids.length === 0) return;

    const res = await batchDeleteTokens(ids, setIsLoading);

    if (res && res.data) {
      addToast({
        title: `成功删除 ${ids.length} 个令牌`,
        color: "success"
      });
      setSelectedKeys(new Set());
      loadTokenList();
    }
  };

  /**
   * 令牌续期逻辑（演示）
   * @param item 令牌项
   */
  const handleRefreshToken = (item: TokenItem) => {
    addToast({
      title: "申请成功",
      description: `已为令牌 ${item.name} 触发续期申请，实际逻辑待接入接口。`,
      color: "success"
    });
  };

  // --- 生命周期钩子 ---
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTokenList();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadTokenList]);

  // --- UI 渲染逻辑 ---
  return (
    <div className="space-y-4">
      {/* 顶部标题与面包屑 */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-[11px] text-[var(--primary-color)]">
          <span>系统管理 · 令牌管理</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          管理后台各类访问令牌与密钥
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl">
          集中管理 API 令牌、个人访问令牌与内部系统令牌，支持按状态与关键字快速筛选，并提供复制、续期与吊销操作入口。
        </p>
      </div>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        {/* 工具栏区域 */}
        <div className="p-3 space-y-3 text-xs border-b border-[var(--border-color)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <AdminSearchInput
                className="w-56"
                placeholder="按名称 / 令牌片段 / 绑定账号搜索"
                value={keyword}
                onValueChange={value => {
                  setKeyword(value);
                  setPage(1);
                }}
              />
              <AdminSelect
                aria-label="状态筛选"
                size="sm"
                className="w-40"
                selectedKeys={[statusFilter]}
                onSelectionChange={keys => {
                  const key = Array.from(keys)[0];
                  setStatusFilter(key ? (String(key) as StatusFilter) : "all");
                  setPage(1);
                }}
                items={[
                  { label: "全部状态", value: "all" },
                  { label: "仅有效", value: "active" },
                  { label: "已过期 / 吊销", value: "no_active" }
                ]}
                isClearable
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

              {/* 批量操作区域 */}
              {selectedKeys.size > 0 && (
                <div className="flex items-center gap-2 px-2 border-l border-[var(--border-color)] ml-2">
                  <span className="text-[var(--text-color-secondary)]">
                    已选 {selectedKeys.size} 项:
                  </span>
                  <Button
                    size="sm"
                    variant="flat"
                    color="warning"
                    className="h-8 text-xs"
                    startContent={<FiXCircle className="text-xs" />}
                    onPress={handleBatchRevoke}
                  >
                    批量吊销
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    className="h-8 text-xs"
                    startContent={<FiTrash2 className="text-xs" />}
                    onPress={handleBatchDelete}
                  >
                    批量删除
                  </Button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="light"
                className="h-8 text-[11px]"
              >
                新增令牌入口留待接入实际接口
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-color-secondary)]">
            <span>令牌仅展示部分片段，完整值仅在创建时展示一次，后续可通过复制按钮带出。</span>
          </div>
        </div>

        {/* 表格内容区域 */}
        <div className="p-3">
          <div className="overflow-auto border border-[var(--border-color)] rounded-lg">
            <Table
              aria-label="令牌列表"
              className="min-w-full text-xs"
              selectionMode="multiple"
              selectedKeys={selectedKeys}
              onSelectionChange={keys => {
                if (keys === "all") {
                  setSelectedKeys(new Set(items.map(item => item.id)));
                } else {
                  setSelectedKeys(keys as Set<string>);
                }
              }}
            >
              <TableHeader className="bg-[var(--bg-elevated)]/80">
                <TableColumn className="px-3 py-2 text-left font-medium">令牌名称</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">令牌片段</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">类型</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">绑定账号</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">创建时间</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">过期时间</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">最近使用时间</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">状态</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">操作</TableColumn>
              </TableHeader>
              <TableBody
                items={pageItems}
                emptyContent="未找到匹配的令牌记录，可调整筛选条件后重试。"
                isLoading={isLoading}
                loadingContent={<Loading height={200} text="获取令牌数据中..." />}
              >
                {item => {
                  const statusChip = getStatusChipProps(item.status);
                  const tokenFragment =
                    item.token.length > 8
                      ? `${item.token.slice(0, 4)}****${item.token.slice(-4)}`
                      : item.token;
                  return (
                    <TableRow
                      key={item.id}
                      className="border-t border-[var(--border-color)] hover:bg-[var(--bg-elevated)]/60"
                    >
                      <TableCell className="px-3 py-2">
                        <div className="flex flex-col gap-0.5">
                          <span>{item.name}</span>
                          <span className="text-[10px] text-[var(--text-color-secondary)]">
                            ID: {item.id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <span className="font-mono text-[11px] break-all">
                          {tokenFragment}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <span>{getTokenTypeLabel(item.type)}</span>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <span>{item.boundUser}</span>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <span>{item.createdAt}</span>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <span>{item.expiredAt}</span>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <span>{item.lastUsedAt ?? "-"}</span>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <Chip
                          size="sm"
                          variant="flat"
                          className="text-[10px]"
                          color={statusChip.color}
                        >
                          {statusChip.label}
                        </Chip>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <div className="flex flex-wrap gap-1.5">
                          <Button
                            size="sm"
                            variant="light"
                            className="h-7 text-[10px]"
                            startContent={<FiCopy className="text-[11px]" />}
                            onPress={() => handleCopyToken(item)}
                          >
                            复制
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            className="h-7 text-[10px]"
                            startContent={<FiRefreshCw className="text-[11px]" />}
                            onPress={() => handleRefreshToken(item)}
                          >
                            续期
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="light"
                            className="h-7 text-[10px]"
                            startContent={<FiTrash2 className="text-[11px]" />}
                            onPress={() => handleRevokeToken(item)}
                          >
                            吊销
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }}
              </TableBody>
            </Table>
          </div>

          {/* 分页控制区域 */}
          <div className="mt-3 flex flex-col gap-2 text-[11px] md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <span>
                共 {total} 条记录，当前第 {page} / {totalPages} 页
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Pagination
                size="sm"
                total={totalPages}
                page={page}
                onChange={setPage}
                showControls
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
export default TokenPage;
