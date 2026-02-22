/**
 * 系统参数管理页面
 * @module pages/Admin/System/Param
 * @description 系统参数配置管理，支持参数增删改查操作
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  Pagination,
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
import { AdminInput } from "@/components/Admin/AdminInput";
import { AdminTextarea } from "@/components/Admin/AdminTextarea";
import { Loading } from "@/components/Loading";
import {
  type SysConfig,
  fetchConfigList,
  saveConfig,
  deleteConfig,
  batchDeleteConfigs
} from "@/api/admin/system";
import { useAdminTable, useAdminDataLoader } from "@/hooks";
import { handleError } from "@/utils";
import { PAGINATION } from "@/constants";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
/** 参数表单状态类型 */
type ParamFormState = {
  /** 参数ID */
  id?: string;
  /** 参数键名 */
  configKey: string;
  /** 参数名称 */
  configName: string;
  /** 参数值 */
  configValue: string;
  /** 参数说明 */
  remark: string;
};

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====
/**
 * 参数管理页面组件
 * @returns 页面渲染内容
 */
function ParamPage() {
  // --- 列表数据与加载状态 ---
  /** 搜索关键词 */
  const [keyword, setKeyword] = useState("");
  /** 选中项的 ID 集合 */
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // --- 表单相关状态 ---
  /** 表单是否可见 */
  const [formVisible, setFormVisible] = useState(false);
  /** 表单状态数据 */
  const [formState, setFormState] = useState<ParamFormState>({
    configKey: "",
    configName: "",
    configValue: "",
    remark: ""
  });
  /** 表单错误提示 */
  const [formError, setFormError] = useState("");

  /** 每页条数 */
  const pageSize = PAGINATION.DEFAULT_PAGE_SIZE;

  // 使用自定义 hook 加载参数列表数据
  const {
    data: paramList,
    loading: isLoading,
    loadData: loadParamList
  } = useAdminDataLoader<SysConfig[]>();

  /** 加载参数列表 */
  const loadParamListData = useCallback(async () => {
    await loadParamList(async () => {
      const response = await fetchConfigList();
      return response.data?.rows || [];
    }, {
      showErrorToast: true,
      errorMessage: '加载参数列表失败'
    });
  }, [loadParamList]);

  // 使用自定义 hook 管理表格数据
  const {
    page,
    total,
    totalPages,
    currentPageData: pageItems,
    handlePageChange: setPage
  } = useAdminTable<SysConfig>({
    initialPageSize: pageSize
  });

  // 页面初始化加载
  useEffect(() => {
    loadParamListData();
  }, [loadParamListData]);

  /**
   * 重置筛选条件
   */
  const handleResetFilter = () => {
    setKeyword("");
    setPage(1);
  };

  /**
   * 打开新建参数弹窗
   */
  const handleOpenCreate = () => {
    setFormState({
      configKey: "",
      configName: "",
      configValue: "",
      remark: ""
    });
    setFormError("");
    setFormVisible(true);
  };

  /**
   * 打开编辑参数弹窗
   * @param item 参数项
   */
  const handleOpenEdit = (item: SysConfig) => {
    setFormState({
      id: String(item.id),
      configKey: item.configKey || "",
      configName: item.configName || "",
      configValue: item.configValue || "",
      remark: item.remark || ""
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
  const handleFormChange = (patch: Partial<ParamFormState>) => {
    setFormState(previous => ({
      ...previous,
      ...patch
    }));
  };

  /**
   * 删除单个参数
   * @param item 参数项
   */
  const handleDeleteParam = async (item: SysConfig) => {
    try {
      const res = await deleteConfig(item.id || 0);
      if (res && res.data) {
        addToast({
          title: "参数删除成功",
          color: "success"
        });
        loadParamListData();
      }
    } catch (error) {
      handleError(error, {
        showToast: true,
        errorMessage: "删除参数失败"
      });
    }
  };

  /**
   * 批量删除参数
   */
  const handleBatchDelete = async () => {
    const ids = Array.from(selectedKeys);
    if (ids.length === 0) return;

    try {
      const res = await batchDeleteConfigs(ids.map(Number));
      if (res && res.data) {
        addToast({
          title: `成功删除 ${ids.length} 个参数`,
          color: "success"
        });
        setSelectedKeys(new Set());
        loadParamListData();
      }
    } catch (error) {
      handleError(error, {
        showToast: true,
        errorMessage: "批量删除参数失败"
      });
    }
  };

  /**
   * 提交表单数据
   */
  const handleSubmitForm = async () => {
    const trimmedKey = formState.configKey.trim();
    const trimmedName = formState.configName.trim();
    if (!trimmedKey || !trimmedName) {
      setFormError("请填写完整的参数键名与参数名称。");
      return;
    }

    try {
      const res = await saveConfig({
        configKey: formState.configKey,
        configName: formState.configName,
        configValue: formState.configValue,
        remark: formState.remark.trim(),
        id: formState.id ? Number(formState.id) : undefined
      });

      if (res && res.data) {
        addToast({
          title: formState.id ? "参数更新成功" : "参数创建成功",
          color: "success"
        });
        setFormVisible(false);
        loadParamListData();
      }
    } catch (error) {
      handleError(error, {
        showToast: true,
        errorMessage: formState.id ? "更新参数失败" : "创建参数失败"
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* 头部标题区域 */}
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
        {/* 筛选与操作工具栏 */}
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
                    color="danger"
                    className="h-8 text-xs"
                    startContent={<FiTrash2 className="text-xs" />}
                    onPress={handleBatchDelete}
                  >
                    批量删除
                  </Button>
                </div>
              )}
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

        {/* 表格内容区域 */}
        <div className="p-3">
          <div className="overflow-auto border border-[var(--border-color)] rounded-lg">
            <Table
              aria-label="参数列表"
              className="min-w-full text-xs"
              selectionMode="multiple"
              selectedKeys={selectedKeys}
              onSelectionChange={keys => {
                if (keys === "all") {
                  setSelectedKeys(new Set((paramList || []).map(item => String(item.id))));
                } else {
                  setSelectedKeys(keys as Set<string>);
                }
              }}
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
                  备注
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
                isLoading={isLoading}
                loadingContent={<Loading height={200} text="获取参数数据中..." />}
              >
                {item => (
                  <TableRow
                    key={item.id}
                    className="border-t border-[var(--border-color)] hover:bg-[var(--bg-elevated)]/60"
                  >
                    <TableCell className="px-3 py-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-xs break-all">
                          {item.configKey}
                        </span>
                        <span className="text-xs text-[var(--text-color-secondary)]">
                          ID: {item.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span>{item.configName}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span className="font-mono text-xs break-all">
                        {item.configValue}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span>{item.remark || "-"}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span>{item.updateTime}</span>
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
                  value={formState.configKey}
                  onValueChange={value => handleFormChange({ configKey: value })}
                />
              </div>
              <div className="space-y-1">
                <div>参数名称（必填）</div>
                <AdminInput
                  value={formState.configName}
                  onValueChange={value => handleFormChange({ configName: value })}
                />
              </div>
              <div className="space-y-1">
                <div>参数值</div>
                <AdminTextarea
                  minRows={2}
                  value={formState.configValue}
                  onValueChange={value => handleFormChange({ configValue: value })}
                />
              </div>
              <div className="space-y-1">
                <div>备注</div>
                <AdminTextarea
                  minRows={2}
                  value={formState.remark}
                  onValueChange={value => handleFormChange({ remark: value })}
                />
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
export default ParamPage;
