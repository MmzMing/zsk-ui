// ===== 1. 依赖导入区域 =====
import React, { useState, useCallback, useEffect } from "react";
import {
  SelectItem,
  Button,
  Card,
  Chip,
  Pagination,
  Switch,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  addToast
} from "@heroui/react";
import { FiEdit2, FiPlus, FiRotateCcw, FiX } from "react-icons/fi";
import { AdminSearchInput } from "@/components/Admin/AdminSearchInput";
import { AdminSelect } from "@/components/Admin/AdminSelect";
import { AdminInput } from "@/components/Admin/AdminInput";
import { AdminTextarea } from "@/components/Admin/AdminTextarea";
import { Loading } from "@/components/Loading";
import {
  type DictItem,
  type DictStatus,
  type SaveDictRequest,
  fetchDictList,
  saveDict,
  toggleDictStatus,
  batchToggleDictStatus
} from "@/api/admin/system";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
/** 状态筛选类型 */
type StatusFilter = "all" | "enabled" | "disabled";

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====
/**
 * 字典管理页面组件
 * @returns 页面渲染内容
 */
function DictPage() {
  // --- 列表数据与加载状态 ---
  /** 搜索关键词 */
  const [keyword, setKeyword] = useState("");
  /** 状态筛选 */
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  /** 当前页码 */
  const [page, setPage] = useState(1);
  /** 字典列表数据 */
  const [items, setItems] = useState<DictItem[]>([]);
  /** 总条数 */
  const [total, setTotal] = useState(0);
  /** 是否正在加载 */
  const [isLoading, setIsLoading] = useState(false);
  /** 选中项的 ID 集合 */
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // --- 表单相关状态 ---
  /** 表单是否可见 */
  const [formVisible, setFormVisible] = useState(false);
  /** 表单状态数据 */
  const [formState, setFormState] = useState<SaveDictRequest>({
    code: "",
    name: "",
    category: "",
    description: "",
    status: "enabled"
  });
  /** 表单错误提示 */
  const [formError, setFormError] = useState("");

  /** 每页条数 */
  const pageSize = 8;
  /** 总页数 */
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  /**
   * 加载字典列表数据
   */
  const loadDictList = useCallback(async () => {
    const res = await fetchDictList(
      {
        page,
        pageSize,
        keyword: keyword.trim() || undefined,
        status: statusFilter === "all" ? undefined : statusFilter
      },
      setIsLoading
    );
    if (res && res.data) {
      setItems(res.data.list);
      setTotal(res.data.total);
    }
  }, [page, pageSize, keyword, statusFilter]);

  // --- 生命周期钩子 ---
  // 初始化加载
  useEffect(() => {
    const timer = setTimeout(() => {
      loadDictList();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDictList]);

  /**
   * 重置筛选条件
   */
  const handleResetFilter = () => {
    setKeyword("");
    setStatusFilter("all");
    setPage(1);
  };

  /**
   * 打开新建字典弹窗
   */
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

  /**
   * 打开编辑字典弹窗
   * @param item 字典项
   */
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

  /**
   * 关闭表单弹窗
   */
  const handleCloseForm = () => {
    setFormVisible(false);
    setFormError("");
  };

  /**
   * 处理表单字段变更
   * @param patch 变更的字段
   */
  const handleFormChange = (patch: Partial<SaveDictRequest>) => {
    setFormState(previous => ({
      ...previous,
      ...patch
    }));
  };

  /**
   * 提交表单数据
   */
  const handleSubmitForm = async () => {
    const trimmedCode = formState.code.trim();
    const trimmedName = formState.name.trim();
    if (!trimmedCode || !trimmedName) {
      setFormError("请填写完整的字典编码和字典名称。");
      return;
    }

    const res = await saveDict({
      ...formState,
      code: trimmedCode,
      name: trimmedName,
      category: formState.category.trim() || "未分组",
      description: formState.description.trim()
    });

    if (res && res.data) {
      addToast({
        title: formState.id ? "字典更新成功" : "字典新增成功",
        color: "success"
      });
      setFormVisible(false);
      loadDictList();
    }
  };

  /**
   * 切换字典启用状态
   * @param item 字典项
   */
  const handleToggleStatus = async (item: DictItem) => {
    const nextStatus: DictStatus = item.status === "enabled" ? "disabled" : "enabled";
    const res = await toggleDictStatus(item.id, nextStatus);
    if (res && res.data) {
      addToast({
        title: "状态更新成功",
        color: "success"
      });
      loadDictList();
    }
  };

  /**
   * 批量切换字典状态
   * @param status 目标状态
   */
  const handleBatchToggleStatus = async (status: DictStatus) => {
    const ids = Array.from(selectedKeys);
    if (ids.length === 0) return;

    const res = await batchToggleDictStatus(ids, status);

    if (res && res.data) {
      addToast({
        title: `成功批量${status === "enabled" ? "启用" : "停用"} ${ids.length} 项`,
        color: "success"
      });
      setSelectedKeys(new Set());
      loadDictList();
    }
  };

  return (
    <div className="space-y-4">
      {/* 头部标题区域 */}
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
        {/* 筛选与操作工具栏 */}
        <div className="p-3 space-y-3 text-xs border-b border-[var(--border-color)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <AdminSearchInput
                className="w-52"
                placeholder="按编码 / 名称 / 模块搜索"
                value={keyword}
                onValueChange={value => {
                  setKeyword(value);
                  setPage(1);
                }}
              />
              <AdminSelect
                aria-label="状态筛选"
                size="sm"
                className="w-36"
                selectedKeys={[statusFilter]}
                onSelectionChange={keys => {
                  const key = Array.from(keys)[0];
                  setStatusFilter(key ? (String(key) as StatusFilter) : "all");
                  setPage(1);
                }}
                items={[
                  { label: "全部状态", value: "all" },
                  { label: "仅启用", value: "enabled" },
                  { label: "仅停用", value: "disabled" }
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
              {selectedKeys.size > 0 && (
                <div className="flex items-center gap-2 px-2 border-r border-[var(--border-color)] mr-2">
                  <span className="text-[var(--text-color-secondary)]">
                    已选 {selectedKeys.size} 项:
                  </span>
                  <Button
                    size="sm"
                    variant="flat"
                    color="success"
                    className="h-8 text-xs"
                    onPress={() => handleBatchToggleStatus("enabled")}
                  >
                    批量启用
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    color="default"
                    className="h-8 text-xs"
                    onPress={() => handleBatchToggleStatus("disabled")}
                  >
                    批量停用
                  </Button>
                </div>
              )}
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

        {/* 表格内容区域 */}
        <div className="p-3">
          <div className="overflow-auto border border-[var(--border-color)] rounded-lg">
            <Table
              aria-label="字典列表"
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
                items={items}
                emptyContent="未找到匹配的字典配置，可调整筛选条件后重试。"
                isLoading={isLoading}
                loadingContent={<Loading height={200} text="获取字典数据中..." />}
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

          {/* 分页工具栏 */}
          <div className="mt-3 flex flex-col gap-2 text-xs md:flex-row md:items-center md:justify-between">
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

      {/* 新增/编辑弹窗 */}
      {formVisible && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-[var(--radius-base)] bg-[var(--bg-elevated)] border border-[var(--border-color)] shadow-lg">
            <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="text-sm font-medium">
                {formState.id ? "编辑字典" : "新建字典"}
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="h-8 w-8 text-[var(--text-color-secondary)]"
                onPress={handleCloseForm}
              >
                <FiX className="text-base" />
              </Button>
            </div>
            <div className="px-4 py-3 space-y-3 text-xs">
              {formError && (
                <div className="rounded-[var(--radius-base)] border border-red-500/60 bg-red-500/5 px-3 py-2 text-xs text-red-300">
                  {formError}
                </div>
              )}
              <div className="space-y-1">
                <div>字典编码（必填）</div>
                <AdminInput
                  value={formState.code}
                  onValueChange={value => handleFormChange({ code: value })}
                />
              </div>
              <div className="space-y-1">
                <div>字典名称（必填）</div>
                <AdminInput
                  value={formState.name}
                  onValueChange={value => handleFormChange({ name: value })}
                />
              </div>
              <div className="space-y-1">
                <div>所属模块</div>
                <AdminInput
                  value={formState.category}
                  onValueChange={value => handleFormChange({ category: value })}
                />
              </div>
              <div className="space-y-1">
                <div>说明</div>
                <AdminTextarea
                  minRows={3}
                  value={formState.description}
                  onValueChange={value => handleFormChange({ description: value })}
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

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
export default DictPage;
