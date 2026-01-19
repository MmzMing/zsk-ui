import React, { useMemo, useState } from "react";
import {
  Select,
  SelectItem,
  Button,
  Card,
  Chip,
  Input,
  Pagination,
  Switch,
  Textarea,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from "@heroui/react";
import { FiEdit2, FiPlus, FiSearch } from "react-icons/fi";

type DictStatus = "enabled" | "disabled";

type DictItem = {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  itemCount: number;
  status: DictStatus;
  updatedAt: string;
};

type DictFormState = {
  id?: string;
  code: string;
  name: string;
  category: string;
  description: string;
  status: DictStatus;
};

type StatusFilter = "all" | "enabled" | "disabled";

const initialDicts: DictItem[] = [
  {
    id: "d_001",
    code: "user_status",
    name: "用户状态",
    category: "用户与权限",
    description: "控制用户在前台与后台的可见性与登录能力。",
    itemCount: 4,
    status: "enabled",
    updatedAt: "2026-01-10 10:12:00"
  },
  {
    id: "d_002",
    code: "video_category",
    name: "视频分类",
    category: "内容管理",
    description: "用于对教学视频进行多维度分类与筛选。",
    itemCount: 8,
    status: "enabled",
    updatedAt: "2026-01-11 09:32:18"
  },
  {
    id: "d_003",
    code: "doc_tag",
    name: "文档标签",
    category: "内容管理",
    description: "常用文档标签集合，便于前台按标签聚合展示。",
    itemCount: 12,
    status: "enabled",
    updatedAt: "2026-01-12 14:03:45"
  },
  {
    id: "d_004",
    code: "notify_channel",
    name: "通知渠道",
    category: "系统配置",
    description: "系统告警与运营通知的推送渠道集合。",
    itemCount: 5,
    status: "enabled",
    updatedAt: "2026-01-13 16:20:30"
  },
  {
    id: "d_005",
    code: "feature_flag",
    name: "功能开关",
    category: "系统配置",
    description: "用于灰度发布与 A/B 实验的功能开关配置。",
    itemCount: 6,
    status: "disabled",
    updatedAt: "2026-01-14 11:08:12"
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

function DictPage() {
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<DictItem[]>(() => initialDicts);
  const [formVisible, setFormVisible] = useState(false);
  const [formState, setFormState] = useState<DictFormState>({
    code: "",
    name: "",
    category: "",
    description: "",
    status: "enabled"
  });
  const [formError, setFormError] = useState("");

  const filteredItems = useMemo(() => {
    const trimmedKeyword = keyword.trim().toLowerCase();
    return items.filter(item => {
      if (trimmedKeyword) {
        const joined = `${item.code} ${item.name} ${item.category}`.toLowerCase();
        if (!joined.includes(trimmedKeyword)) {
          return false;
        }
      }
      if (statusFilter === "enabled" && item.status !== "enabled") {
        return false;
      }
      if (statusFilter === "disabled" && item.status !== "disabled") {
        return false;
      }
      return true;
    });
  }, [items, keyword, statusFilter]);

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
    setStatusFilter("all");
    setPage(1);
  };

  const handleOpenCreate = () => {
    setFormState({
      code: "",
      name: "",
      category: "",
      description: "",
      status: "enabled"
    });
    setFormError("");
    setFormVisible(true);
  };

  const handleOpenEdit = (item: DictItem) => {
    setFormState({
      id: item.id,
      code: item.code,
      name: item.name,
      category: item.category,
      description: item.description,
      status: item.status
    });
    setFormError("");
    setFormVisible(true);
  };

  const handleCloseForm = () => {
    setFormVisible(false);
    setFormError("");
  };

  const handleFormChange = (patch: Partial<DictFormState>) => {
    setFormState(previous => ({
      ...previous,
      ...patch
    }));
  };

  const handleSubmitForm = () => {
    const trimmedCode = formState.code.trim();
    const trimmedName = formState.name.trim();
    if (!trimmedCode || !trimmedName) {
      setFormError("请填写完整的字典编码和字典名称。");
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
                code: trimmedCode,
                name: trimmedName,
                category: formState.category.trim() || "未分组",
                description: formState.description.trim(),
                status: formState.status,
                updatedAt
              }
            : item
        )
      );
    } else {
      const id = `dict_${Date.now()}`;
      const newItem: DictItem = {
        id,
        code: trimmedCode,
        name: trimmedName,
        category: formState.category.trim() || "未分组",
        description: formState.description.trim(),
        status: formState.status,
        itemCount: 0,
        updatedAt
      };
      setItems(previous => [newItem, ...previous]);
      setPage(1);
    }
    setFormVisible(false);
  };

  const handleToggleStatus = (item: DictItem) => {
    const nextStatus: DictStatus = item.status === "enabled" ? "disabled" : "enabled";
    const updatedAt = formatNow();
    setItems(previous =>
      previous.map(row =>
        row.id === item.id
          ? {
              ...row,
              status: nextStatus,
              updatedAt
            }
          : row
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-xs text-[var(--primary-color)]">
          <span>系统管理 · 字典管理</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          维护系统运行所需的各类字典配置
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl">
          管理用户状态、内容分类、功能开关等通用字典项，为业务逻辑与展示层提供统一的枚举配置。
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
                placeholder="按编码 / 名称 / 模块搜索"
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
                aria-label="状态筛选"
                size="sm"
                className="w-36"
                selectedKeys={[statusFilter]}
                onSelectionChange={keys => {
                  const key = Array.from(keys)[0];
                  setStatusFilter(key ? String(key) as StatusFilter : "all");
                  setPage(1);
                }}
                items={[
                  { label: "全部状态", value: "all" },
                  { label: "仅启用", value: "enabled" },
                  { label: "仅停用", value: "disabled" }
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
                className="h-8 text-xs"
                startContent={<FiPlus className="text-xs" />}
                onPress={handleOpenCreate}
              >
                新建字典
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-color-secondary)]">
            <span>当前列表为示例数据，实际字段与操作行为待接入接口。</span>
          </div>
        </div>

        <div className="p-3">
          <div className="overflow-auto border border-[var(--border-color)] rounded-lg">
            <Table
              aria-label="字典列表"
              className="min-w-full text-xs"
            >
              <TableHeader className="bg-[var(--bg-elevated)]/80">
                <TableColumn className="px-3 py-2 text-left font-medium">
                  字典编码
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  字典名称
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  所属模块
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  字典项数量
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  状态
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
                emptyContent="未找到匹配的字典配置，可调整筛选条件后重试。"
              >
                {item => (
                  <TableRow
                    key={item.id}
                    className="border-t border-[var(--border-color)] hover:bg-[var(--bg-elevated)]/60"
                  >
                    <TableCell className="px-3 py-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-xs break-all">
                          {item.code}
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
                      <span>{item.category}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span>{item.itemCount}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <Chip
                        size="sm"
                        variant="flat"
                        className="text-xs"
                        color={item.status === "enabled" ? "success" : "default"}
                      >
                        {item.status === "enabled" ? "启用" : "停用"}
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
                          variant="light"
                          className="h-7 text-xs"
                          onPress={() => handleToggleStatus(item)}
                        >
                          {item.status === "enabled" ? "停用" : "启用"}
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
                {formState.id ? "编辑字典" : "新建字典"}
              </div>
              <button
                type="button"
                className="text-xs text-[var(--text-color-secondary)]"
                onClick={handleCloseForm}
              >
                关闭
              </button>
            </div>
            <div className="px-4 py-3 space-y-3 text-xs">
              {formError && (
                <div className="rounded-[var(--radius-base)] border border-red-500/60 bg-red-500/5 px-3 py-2 text-xs text-red-300">
                  {formError}
                </div>
              )}
              <div className="space-y-1">
                <div>字典编码（必填）</div>
                <Input
                  size="sm"
                  variant="bordered"
                  value={formState.code}
                  onValueChange={value => handleFormChange({ code: value })}
                  classNames={{
                    inputWrapper: "h-8 text-xs",
                    input: "text-xs"
                  }}
                />
              </div>
              <div className="space-y-1">
                <div>字典名称（必填）</div>
                <Input
                  size="sm"
                  variant="bordered"
                  value={formState.name}
                  onValueChange={value => handleFormChange({ name: value })}
                  classNames={{
                    inputWrapper: "h-8 text-xs",
                    input: "text-xs"
                  }}
                />
              </div>
              <div className="space-y-1">
                <div>所属模块</div>
                <Input
                  size="sm"
                  variant="bordered"
                  value={formState.category}
                  onValueChange={value => handleFormChange({ category: value })}
                  classNames={{
                    inputWrapper: "h-8 text-xs",
                    input: "text-xs"
                  }}
                />
              </div>
              <div className="space-y-1">
                <div>说明</div>
                <Textarea
                  size="sm"
                  variant="bordered"
                  minRows={3}
                  value={formState.description}
                  onValueChange={value => handleFormChange({ description: value })}
                  classNames={{
                    inputWrapper: "text-xs",
                    input: "text-xs"
                  }}
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="text-xs">启用状态</div>
                <div className="flex items-center gap-2">
                  <Switch
                    size="sm"
                    isSelected={formState.status === "enabled"}
                    onValueChange={selected =>
                      handleFormChange({ status: selected ? "enabled" : "disabled" })
                    }
                  />
                  <span className="text-xs text-[var(--text-color-secondary)]">
                    {formState.status === "enabled" ? "启用后即可在业务中引用" : "停用后业务端不应继续使用"}
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

export default DictPage;
