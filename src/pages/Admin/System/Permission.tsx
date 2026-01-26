// ===== 1. 依赖导入区域 =====
import React, { useMemo, useState, useCallback, useEffect } from "react";
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
  TableCell
} from "@heroui/react";
import { FiKey } from "react-icons/fi";
import { AdminSearchInput } from "@/components/Admin/AdminSearchInput";
import { AdminSelect } from "@/components/Admin/AdminSelect";
import { Loading } from "@/components/Loading";
import {
  type PermissionItem,
  type PermissionGroup,
  fetchPermissionList
} from "@/api/admin/system";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
/** 模块筛选类型 */
type ModuleFilter = "all" | "dashboard" | "ops" | "personnel" | "system" | "content";

// ===== 4. 通用工具函数区域 =====
/**
 * 获取权限类型标签
 * @param type 权限类型
 * @returns 对应的中文标签
 */
const getTypeLabel = (type: PermissionItem["type"]): string => {
  const typeMap: Record<PermissionItem["type"], string> = {
    menu: "菜单权限",
    action: "操作权限",
    data: "数据权限"
  };
  return typeMap[type] || "未知权限";
};

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====
/**
 * 权限管理页面组件
 * @returns 页面渲染内容
 */
function PermissionPage() {
  // --- 列表数据与加载状态 ---
  /** 搜索关键词 */
  const [keyword, setKeyword] = useState("");
  /** 模块筛选 */
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>("all");
  /** 当前页码 */
  const [page, setPage] = useState(1);
  /** 权限分组数据 */
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  /** 是否正在加载 */
  const [isLoading, setIsLoading] = useState(false);

  /** 每页条数 */
  const pageSize = 8;

  /**
   * 加载权限列表数据
   */
  const loadPermissions = useCallback(async () => {
    const res = await fetchPermissionList(setIsLoading);
    if (res && res.data) {
      setPermissionGroups(res.data);
    }
  }, []);

  // --- 生命周期钩子 ---
  // 初始化加载
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPermissions();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadPermissions]);

  /**
   * 扁平化后的权限列表
   */
  const flatPermissions = useMemo(() => {
    return (permissionGroups || []).flatMap(group => group.items);
  }, [permissionGroups]);

  /**
   * 过滤后的列表数据
   */
  const filteredItems = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    return flatPermissions.filter(item => {
      if (moduleFilter !== "all") {
        if (moduleFilter === "dashboard" && !item.key.startsWith("dashboard:")) {
          return false;
        }
        if (moduleFilter === "ops" && !item.key.startsWith("ops:")) {
          return false;
        }
        if (moduleFilter === "personnel" && !item.key.startsWith("personnel:")) {
          return false;
        }
        if (moduleFilter === "system" && !item.key.startsWith("system:")) {
          return false;
        }
        if (moduleFilter === "content" && !item.key.startsWith("content:")) {
          return false;
        }
      }
      if (trimmed) {
        const content = `${item.key} ${item.name} ${item.module}`.toLowerCase();
        if (!content.includes(trimmed)) {
          return false;
        }
      }
      return true;
    });
  }, [flatPermissions, keyword, moduleFilter]);

  /** 总条数 */
  const total = filteredItems.length;
  /** 总页数 */
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  /** 当前页显示的条目 */
  const pageItems = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredItems.slice(startIndex, startIndex + pageSize);
  }, [filteredItems, page, pageSize]);

  /**
   * 处理分页变更
   * @param next 下一页页码
   */
  const handlePageChange = (next: number) => {
    setPage(next);
  };

  return (
    <div className="space-y-4">
      {/* 头部标题区域 */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-xs text-[var(--primary-color)]">
          <span>系统管理 · 权限管理</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          统一查看与梳理权限点
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl">
          以统一的权限标识规范串联菜单、接口与操作权限，便于后续与角色、菜单管理模块联动，实现基于 RBAC 的权限控制体系。
        </p>
      </div>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        {/* 筛选与操作工具栏 */}
        <div className="p-3 space-y-3 text-xs border-b border-[var(--border-color)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <AdminSearchInput
                className="w-56"
                placeholder="按权限标识 / 名称 / 模块搜索"
                value={keyword}
                onValueChange={value => {
                  setKeyword(value);
                  setPage(1);
                }}
              />
              <AdminSelect
                aria-label="模块筛选"
                size="sm"
                className="w-40"
                selectedKeys={[moduleFilter]}
                onSelectionChange={keys => {
                  const key = Array.from(keys)[0];
                  setModuleFilter(key ? (String(key) as ModuleFilter) : "all");
                  setPage(1);
                }}
                items={[
                  { label: "全部模块", value: "all" },
                  { label: "仪表盘", value: "dashboard" },
                  { label: "系统运维", value: "ops" },
                  { label: "人员管理", value: "personnel" },
                  { label: "系统管理", value: "system" },
                  { label: "内容管理", value: "content" }
                ]}
                isClearable
              >
                {(item: { label: string; value: string }) => (
                  <SelectItem key={item.value}>
                    {item.label}
                  </SelectItem>
                )}
              </AdminSelect>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="light"
                className="h-8 text-xs"
                startContent={<FiKey className="text-xs" />}
              >
                权限新增与编辑建议在角色管理中完成
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-color-secondary)]">
            <span>权限标识应保持稳定且具备可读性，建议采用「模块:资源:操作」命名规则。</span>
          </div>
        </div>

        {/* 表格内容区域 */}
        <div className="p-3">
          <div className="overflow-auto border border-[var(--border-color)] rounded-lg">
            <Table
              aria-label="权限列表"
              className="min-w-full text-xs"
            >
              <TableHeader className="bg-[var(--bg-elevated)]/80">
                <TableColumn className="w-48 px-3 py-2 text-left font-medium">
                  权限标识
                </TableColumn>
                <TableColumn className="w-32 px-3 py-2 text-left font-medium">
                  权限名称
                </TableColumn>
                <TableColumn className="w-24 px-3 py-2 text-left font-medium">
                  所属模块
                </TableColumn>
                <TableColumn className="w-24 px-3 py-2 text-left font-medium">
                  类型
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  说明
                </TableColumn>
                <TableColumn className="w-40 px-3 py-2 text-left font-medium">
                  创建时间
                </TableColumn>
              </TableHeader>
              <TableBody
                items={pageItems}
                emptyContent="未找到匹配的权限记录，可调整筛选条件后重试。"
                isLoading={isLoading}
                loadingContent={<Loading height={200} text="获取权限数据中..." />}
              >
                {item => (
                  <TableRow
                    key={item.id}
                    className="border-t border-[var(--border-color)] hover:bg-[var(--bg-elevated)]/60"
                  >
                    <TableCell className="px-3 py-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[11px] break-all">
                          {item.key}
                        </span>
                        <span className="text-[10px] text-[var(--text-color-secondary)]">
                          ID: {item.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span>{item.name}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span>{item.module}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <Chip
                        size="sm"
                        variant="flat"
                        className="text-[10px] h-5 px-1"
                        color={
                          item.type === "menu"
                            ? "default"
                            : item.type === "action"
                            ? "primary"
                            : "warning"
                        }
                      >
                        {getTypeLabel(item.type)}
                      </Chip>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span className="text-[var(--text-color-secondary)] truncate max-w-xs block" title={item.description}>
                        {item.description}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span className="font-mono text-xs">
                        {item.createdAt}
                      </span>
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

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
export default PermissionPage;
