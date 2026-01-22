import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  Chip,
  Pagination,
  SelectItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  addToast
} from "@heroui/react";
import { FiEdit2, FiPlus, FiRotateCcw, FiTrash2, FiX } from "react-icons/fi";
import { AdminSearchInput } from "@/components/Admin/AdminSearchInput";
import { AdminSelect } from "@/components/Admin/AdminSelect";
import { AdminInput } from "@/components/Admin/AdminInput";
import { AdminTextarea } from "@/components/Admin/AdminTextarea";

type ParamScope = "global" | "frontend" | "backend" | "task";

type ParamItem = {
  id: string;
  key: string;
  name: string;
  value: string;
  scope: ParamScope;
  description: string;
  sensitive: boolean;
  updatedAt: string;
};

type ParamFormState = {
  id?: string;
  key: string;
  name: string;
  value: string;
  scope: ParamScope;
  description: string;
  sensitive: boolean;
};

const initialParams: ParamItem[] = [
  {
    id: "p_001",
    key: "site.title",
    name: "站点标题",
    value: "知识库小破站",
    scope: "frontend",
    description: "展示在前台站点标题与浏览器标签上的文案。",
    sensitive: false,
    updatedAt: "2026-01-15 09:20:11"
  },
  {
    id: "p_002",
    key: "auth.login.maxRetry",
    name: "登录最大重试次数",
    value: "5",
    scope: "backend",
    description: "同一账号在指定时间窗口内允许的最大登录失败次数。",
    sensitive: false,
    updatedAt: "2026-01-16 10:02:33"
  },
  {
    id: "p_003",
    key: "task.statistic.cron",
    name: "统计任务 CRON 表达式",
    value: "0 0 2 * * ?",
    scope: "task",
    description: "每日离线统计任务的调度时间。",
    sensitive: false,
    updatedAt: "2026-01-16 02:00:00"
  },
  {
    id: "p_004",
    key: "security.audit.webhook",
    name: "安全审计 Webhook 地址",
    value: "https://api.example.com/audit/webhook",
    scope: "backend",
    description: "高风险操作审计记录推送到外部系统的回调地址。",
    sensitive: true,
    updatedAt: "2026-01-17 14:21:09"
  }
];

function formatNow() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function getScopeLabel(scope: ParamScope) {
  if (scope === "frontend") {
    return "前台配置";
  }
  if (scope === "backend") {
    return "后台配置";
  }
  if (scope === "task") {
    return "任务调度";
  }
  return "全局配置";
}

function ParamPage() {
  const [keyword, setKeyword] = useState("");
  const [scopeFilter, setScopeFilter] = useState<ParamScope | "all">("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ParamItem[]>(() => initialParams);
  const [formVisible, setFormVisible] = useState(false);
  const [formState, setFormState] = useState<ParamFormState>({
    key: "",
    name: "",
    value: "",
    scope: "backend",
    description: "",
    sensitive: false
  });
  const [formError, setFormError] = useState("");

  const filteredItems = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    return items.filter(item => {
      if (trimmed) {
        const content = `${item.key} ${item.name}`.toLowerCase();
        if (!content.includes(trimmed)) {
          return false;
        }
      }
      if (scopeFilter !== "all" && item.scope !== scopeFilter) {
        return false;
      }
      return true;
    });
  }, [items, keyword, scopeFilter]);

  const pageSize = 8;
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
    setScopeFilter("all");
    setPage(1);
  };

  const handleOpenCreate = () => {
    setFormState({
      key: "",
      name: "",
      value: "",
      scope: "backend",
      description: "",
      sensitive: false
    });
    setFormError("");
    setFormVisible(true);
  };

  const handleOpenEdit = (item: ParamItem) => {
    setFormState({
      id: item.id,
      key: item.key,
      name: item.name,
      value: item.value,
      scope: item.scope,
      description: item.description,
      sensitive: item.sensitive
    });
    setFormError("");
    setFormVisible(true);
  };

  const handleCloseForm = () => {
    setFormVisible(false);
    setFormError("");
  };

  const handleFormChange = (patch: Partial<ParamFormState>) => {
    setFormState(previous => ({
      ...previous,
      ...patch
    }));
  };

  const handleDeleteParam = (item: ParamItem) => {
    setItems(previous => previous.filter(row => row.id !== item.id));
    addToast({
      title: "参数删除成功",
      description: `已成功删除参数「${item.name}」，实际逻辑待接入接口。`,
      color: "success"
    });
  };

  const handleSubmitForm = () => {
    const trimmedKey = formState.key.trim();
    const trimmedName = formState.name.trim();
    if (!trimmedKey || !trimmedName) {
      setFormError("请填写完整的参数键名与参数名称。");
      return;
    }
    const updatedAt = formatNow();
    if (formState.id) {
      const id = formState.id;
      setItems(previous =>
        previous.map(item =>
          item.id === id
            ? {
                ...item,
                key: trimmedKey,
                name: trimmedName,
                value: formState.value,
                scope: formState.scope,
                description: formState.description.trim(),
                sensitive: formState.sensitive,
                updatedAt
              }
            : item
        )
      );
      addToast({
        title: "参数更新成功",
        description: `已成功更新参数「${trimmedName}」，实际逻辑待接入接口。`,
        color: "success"
      });
    } else {
      const id = `param_${Date.now()}`;
      const newItem: ParamItem = {
        id,
        key: trimmedKey,
        name: trimmedName,
        value: formState.value,
        scope: formState.scope,
        description: formState.description.trim(),
        sensitive: formState.sensitive,
        updatedAt
      };
      setItems(previous => [newItem, ...previous]);
      setPage(1);
      addToast({
        title: "参数创建成功",
        description: `已成功创建参数「${trimmedName}」，实际逻辑待接入接口。`,
        color: "success"
      });
    }
    setFormVisible(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-xs text-[var(--primary-color)]">
          <span>系统管理 · 参数管理</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          统一管理系统运行参数与配置项
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl">
          通过统一的参数中心管理前台、后台与定时任务的配置，支持在线新增、编辑与删除，并标记敏感参数以避免误暴露。
        </p>
      </div>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 space-y-3 text-xs border-b border-[var(--border-color)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <AdminSearchInput
                className="w-56"
                placeholder="按键名 / 名称搜索参数"
                value={keyword}
                onValueChange={value => {
                  setKeyword(value);
                  setPage(1);
                }}
              />
              <AdminSelect
                aria-label="作用域筛选"
                size="sm"
                className="w-40"
                selectedKeys={[scopeFilter]}
                onSelectionChange={keys => {
                  const key = Array.from(keys)[0];
                  setScopeFilter(key ? (String(key) as ParamScope | "all") : "all");
                  setPage(1);
                }}
                items={[
                  { label: "全部作用域", value: "all" },
                  { label: "全局配置", value: "global" },
                  { label: "前台配置", value: "frontend" },
                  { label: "后台配置", value: "backend" },
                  { label: "任务调度", value: "task" }
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
                className="h-8 text-xs"
                startContent={<FiPlus className="text-xs" />}
                onPress={handleOpenCreate}
              >
                新增参数
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-color-secondary)]">
            <span>参数修改后建议在后台记录变更日志，并在生产环境中限制高风险参数的在线修改能力。</span>
          </div>
        </div>

        <div className="p-3">
          <div className="overflow-auto border border-[var(--border-color)] rounded-lg">
            <Table
              aria-label="参数列表"
              className="min-w-full text-xs"
            >
              <TableHeader className="bg-[var(--bg-elevated)]/80">
                <TableColumn className="px-3 py-2 text-left font-medium">
                  参数键名
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  参数名称
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  参数值
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  作用域
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  是否敏感
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  最近更新时间
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  操作
                </TableColumn>
              </TableHeader>
              <TableBody
                items={pageItems}
                emptyContent="未找到匹配的参数记录，可调整筛选条件后重试。"
              >
                {item => (
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
                      <span>{item.name}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span className="font-mono text-xs break-all">
                        {item.sensitive ? "******" : item.value}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span>{getScopeLabel(item.scope)}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <Chip
                        size="sm"
                        variant="flat"
                        className="text-[10px]"
                        color={item.sensitive ? "danger" : "default"}
                      >
                        {item.sensitive ? "敏感" : "普通"}
                      </Chip>
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
                          startContent={<FiEdit2 className="text-xs" />}
                          onPress={() => handleOpenEdit(item)}
                        >
                          编辑
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          className="h-7 text-xs"
                          startContent={<FiTrash2 className="text-xs" />}
                          onPress={() => handleDeleteParam(item)}
                        >
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
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

      {formVisible && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-[var(--radius-base)] bg-[var(--bg-elevated)] border border-[var(--border-color)] shadow-lg">
            <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="text-sm font-medium">
                {formState.id ? "编辑参数" : "新增参数"}
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="h-6 w-6 text-[var(--text-color-secondary)]"
                onPress={handleCloseForm}
              >
                <FiX className="text-sm" />
              </Button>
            </div>
            <div className="px-4 py-3 space-y-3 text-xs">
              {formError && (
                <div className="rounded-[var(--radius-base)] border border-red-500/60 bg-red-500/5 px-3 py-2 text-xs text-red-300">
                  {formError}
                </div>
              )}
              <div className="space-y-1">
                <div>参数键名（必填）</div>
                <AdminInput
                  value={formState.key}
                  onValueChange={value => handleFormChange({ key: value })}
                />
              </div>
              <div className="space-y-1">
                <div>参数名称（必填）</div>
                <AdminInput
                  value={formState.name}
                  onValueChange={value => handleFormChange({ name: value })}
                />
              </div>
              <div className="space-y-1">
                <div>参数值</div>
                <AdminTextarea
                  minRows={2}
                  value={formState.value}
                  onValueChange={value => handleFormChange({ value })}
                />
              </div>
              <div className="space-y-1">
                <div>作用域</div>
                <AdminSelect
                  aria-label="参数作用域"
                  size="sm"
                  selectedKeys={[formState.scope]}
                  onSelectionChange={keys => {
                    const key = Array.from(keys)[0];
                    if (key) {
                      handleFormChange({ scope: String(key) as ParamScope });
                    }
                  }}
                  items={[
                    { label: "全局配置", value: "global" },
                    { label: "前台配置", value: "frontend" },
                    { label: "后台配置", value: "backend" },
                    { label: "任务调度", value: "task" }
                  ]}
                  className="w-full"
                  disallowEmptySelection
                >
                  {(item: { label: string; value: string }) => (
                    <SelectItem key={item.value}>
                      {item.label}
                    </SelectItem>
                  )}
                </AdminSelect>
              </div>
              <div className="space-y-1">
                <div>参数说明</div>
                <AdminTextarea
                  minRows={2}
                  value={formState.description}
                  onValueChange={value => handleFormChange({ description: value })}
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="text-xs">是否敏感参数</div>
                <div className="flex items-center gap-2">
                  <Switch
                    size="sm"
                    isSelected={formState.sensitive}
                    onValueChange={selected => handleFormChange({ sensitive: selected })}
                  />
                  <span className="text-xs text-[var(--text-color-secondary)]">
                    标记为敏感后，在列表中将隐藏参数真实值。
                  </span>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-[var(--border-color)] flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="light"
                className="h-8 text-xs"
                onPress={handleCloseForm}
              >
                取消
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs"
                onPress={handleSubmitForm}
              >
                保存
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ParamPage;
