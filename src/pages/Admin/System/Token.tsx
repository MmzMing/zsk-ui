import React, { useMemo, useState } from "react";
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
  TableCell
} from "@heroui/react";
import { FiCopy, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { AdminSearchInput } from "@/components/Admin/AdminSearchInput";
import { AdminSelect } from "@/components/Admin/AdminSelect";

type TokenStatus = "active" | "expired" | "revoked";

type TokenItem = {
  id: string;
  name: string;
  token: string;
  type: "api" | "personal" | "internal";
  boundUser: string;
  createdAt: string;
  expiredAt: string;
  lastUsedAt: string | null;
  status: TokenStatus;
  remark: string;
};

type StatusFilter = "all" | "active" | "no_active";

const initialTokens: TokenItem[] = [
  {
    id: "t_001",
    name: "前台 Web 访问令牌",
    token: "pk_live_web_0a9f2c8e14b942f3",
    type: "api",
    boundUser: "system",
    createdAt: "2026-01-10 09:01:22",
    expiredAt: "2026-07-10 09:01:22",
    lastUsedAt: "2026-01-18 10:40:01",
    status: "active",
    remark: "供前台 Web 站点调用后台开放接口使用。"
  },
  {
    id: "t_002",
    name: "内容运营 API 密钥",
    token: "pk_ops_content_8b21d030a6fb4d51",
    type: "personal",
    boundUser: "operator",
    createdAt: "2026-01-11 11:15:03",
    expiredAt: "2026-04-11 11:15:03",
    lastUsedAt: "2026-01-18 10:20:18",
    status: "active",
    remark: "用于内容运营工具与后台进行数据同步。"
  },
  {
    id: "t_003",
    name: "内部监控任务令牌",
    token: "pk_internal_monitor_52fa0c9e7b984c3d",
    type: "internal",
    boundUser: "cron_monitor",
    createdAt: "2026-01-09 08:30:00",
    expiredAt: "2026-01-16 08:30:00",
    lastUsedAt: "2026-01-16 08:29:59",
    status: "expired",
    remark: "已过期，将在监控任务迁移后删除。"
  },
  {
    id: "t_004",
    name: "第三方集成测试令牌",
    token: "pk_thirdparty_test_a9b8c7d6e5f4",
    type: "api",
    boundUser: "tester",
    createdAt: "2026-01-08 15:12:47",
    expiredAt: "2026-03-08 15:12:47",
    lastUsedAt: null,
    status: "revoked",
    remark: "测试完成后已主动吊销。"
  }
];

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
  const [items, setItems] = useState<TokenItem[]>(() => initialTokens);
  const [message, setMessage] = useState("");

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
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageItems = filteredItems.slice(startIndex, endIndex);

  const handlePageChange = (next: number) => {
    if (next < 1 || next > totalPages) {
      return;
    }
    setPage(next);
  };

  const handleResetFilter = () => {
    setKeyword("");
    setStatusFilter("all");
    setPage(1);
    setMessage("");
  };

  const handleCopyToken = (item: TokenItem) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(item.token);
        setMessage(`已复制令牌 ${item.name} 到剪贴板，请妥善保管。`);
      } else {
        setMessage("当前环境不支持直接复制令牌，请手动选择复制。");
      }
    } catch {
      setMessage("复制令牌失败，请稍后重试。");
    }
  };

  const handleRevokeToken = (item: TokenItem) => {
    if (item.status === "revoked") {
      return;
    }
    setItems(previous =>
      previous.map(row =>
        row.id === item.id
          ? {
              ...row,
              status: "revoked"
            }
          : row
      )
    );
    setMessage(`已标记令牌 ${item.name} 为已吊销，实际逻辑待接入接口。`);
  };

  const handleRefreshToken = (item: TokenItem) => {
    setMessage(`已为令牌 ${item.name} 触发续期申请，实际逻辑待接入接口。`);
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
              <Button
                size="sm"
                variant="light"
                className="h-8 text-[11px]"
                onPress={handleResetFilter}
              >
                重置筛选
              </Button>
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

        {message && (
          <div className="px-4 py-2 flex items-center justify-between text-[11px] border-b border-[var(--border-color)] bg-[var(--bg-elevated)]/80">
            <span className="text-[var(--text-color-secondary)]">{message}</span>
            <Button
              size="sm"
              variant="light"
              className="h-7 text-[10px]"
              onPress={() => setMessage("")}
            >
              知道了
            </Button>
          </div>
        )}

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

export default TokenPage;

