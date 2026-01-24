import React, { useCallback, useMemo, useState } from "react";
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
import { FiCopy, FiRefreshCw, FiRotateCcw, FiTrash2 } from "react-icons/fi";
import { AdminSearchInput } from "@/components/Admin/AdminSearchInput";
import { AdminSelect } from "@/components/Admin/AdminSelect";
import { Loading } from "@/components/Loading";
import {
  type TokenItem,
  type TokenStatus,
  fetchTokenList,
  revokeToken
} from "@/api/admin/system";

type StatusFilter = "all" | "active" | "no_active";

function getTokenTypeLabel(type: TokenItem["type"]) {
  if (type === "api") {
    return "公共 API 令牌";
  }
  if (type === "personal") {
    return "个人访问令牌";
  }
  return "内部系统令牌";
}

function getStatusChipProps(status: TokenStatus) {
  if (status === "active") {
    return {
      color: "success" as const,
      label: "有效"
    };
  }
  if (status === "expired") {
    return {
      color: "warning" as const,
      label: "已过期"
    };
  }
  return {
    color: "danger" as const,
    label: "已吊销"
  };
}

function TokenPage() {
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<TokenItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const filteredItems = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    return items.filter(item => {
      if (trimmed) {
        const content = `${item.name} ${item.token} ${item.boundUser}`.toLowerCase();
        if (!content.includes(trimmed)) {
          return false;
        }
      }
      if (statusFilter === "active" && item.status !== "active") {
        return false;
      }
      if (statusFilter === "no_active" && item.status === "active") {
        return false;
      }
      return true;
    });
  }, [items, keyword, statusFilter]);

  const pageSize = 6;
  const total = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  const loadTokenList = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchTokenList();
      if (res) {
        setItems(res);
      }
    } catch {
      // 错误已在 API 层级处理并显示
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadTokenList();
  }, [loadTokenList]);

  const handleResetFilter = () => {
    setKeyword("");
    setStatusFilter("all");
    setPage(1);
  };

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

  const handleRevokeToken = async (item: TokenItem) => {
    if (item.status === "revoked") {
      return;
    }
      await revokeToken(item.id);
      addToast({
        title: "操作成功",
        color: "success"
      });
      loadTokenList();
  };

  const handleRefreshToken = (item: TokenItem) => {
    addToast({
      title: "申请成功",
      description: `已为令牌 ${item.name} 触发续期申请，实际逻辑待接入接口。`,
      color: "success"
    });
  };

  return (
    <div className="space-y-4">
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

        <div className="p-3">
          <div className="overflow-auto border border-[var(--border-color)] rounded-lg">
            <Table
              aria-label="令牌列表"
              className="min-w-full text-xs"
            >
              <TableHeader className="bg-[var(--bg-elevated)]/80">
                <TableColumn className="px-3 py-2 text-left font-medium">
                  令牌名称
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  令牌片段
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  类型
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  绑定账号
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  创建时间
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  过期时间
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  最近使用时间
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  状态
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  操作
                </TableColumn>
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

export default TokenPage;

