import React, { useMemo, useState } from "react";
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

type PermissionItem = {
  id: string;
  key: string;
  name: string;
  module: string;
  description: string;
  type: "menu" | "action" | "data";
  createdAt: string;
};

type PermissionGroup = {
  id: string;
  label: string;
  items: PermissionItem[];
};

type ModuleFilter = "all" | "dashboard" | "ops" | "personnel" | "system" | "content";

const permissionGroups: PermissionGroup[] = [
  {
    id: "dashboard",
    label: "仪表盘",
    items: [
      {
        id: "perm_dashboard_view",
        key: "dashboard:view",
        name: "查看仪表盘总览",
        module: "仪表盘",
        description: "访问后台仪表盘首页，查看整体运行情况。",
        type: "menu",
        createdAt: "2026-01-10 09:00:00"
      },
      {
        id: "perm_dashboard_analysis",
        key: "dashboard:analysis",
        name: "查看分析页",
        module: "仪表盘",
        description: "访问分析页，查看详细流量趋势与指标。",
        type: "menu",
        createdAt: "2026-01-10 09:05:00"
      }
    ]
  },
  {
    id: "ops",
    label: "系统运维",
    items: [
      {
        id: "perm_ops_monitor",
        key: "ops:monitor",
        name: "查看系统监控",
        module: "系统运维",
        description: "访问系统监控页面，查看各类资源监控数据。",
        type: "menu",
        createdAt: "2026-01-11 10:00:00"
      },
      {
        id: "perm_ops_cache",
        key: "ops:cache",
        name: "查看缓存监控与列表",
        module: "系统运维",
        description: "查看缓存监控面板与缓存键列表。",
        type: "menu",
        createdAt: "2026-01-11 10:10:00"
      },
      {
        id: "perm_ops_log",
        key: "ops:log",
        name: "查看系统日志",
        module: "系统运维",
        description: "查看系统运行日志与导出日志文件。",
        type: "menu",
        createdAt: "2026-01-11 10:20:00"
      }
    ]
  },
  {
    id: "personnel",
    label: "人员管理",
    items: [
      {
        id: "perm_personnel_user",
        key: "personnel:user",
        name: "管理用户",
        module: "人员管理",
        description: "管理后台用户账号、基础信息与状态。",
        type: "menu",
        createdAt: "2026-01-12 09:00:00"
      },
      {
        id: "perm_personnel_menu",
        key: "personnel:menu",
        name: "管理菜单",
        module: "人员管理",
        description: "配置后台菜单结构与路由映射关系。",
        type: "menu",
        createdAt: "2026-01-12 09:10:00"
      },
      {
        id: "perm_personnel_role",
        key: "personnel:role",
        name: "管理角色与权限",
        module: "人员管理",
        description: "管理角色信息并分配角色权限。",
        type: "menu",
        createdAt: "2026-01-12 09:20:00"
      }
    ]
  },
  {
    id: "system",
    label: "系统管理",
    items: [
      {
        id: "perm_system_dict",
        key: "system:dict",
        name: "管理字典配置",
        module: "系统管理",
        description: "增删改查系统字典配置与字典项。",
        type: "menu",
        createdAt: "2026-01-13 09:00:00"
      },
      {
        id: "perm_system_token",
        key: "system:token",
        name: "管理访问令牌",
        module: "系统管理",
        description: "管理后台访问令牌与密钥，支持吊销与续期。",
        type: "menu",
        createdAt: "2026-01-13 09:10:00"
      },
      {
        id: "perm_system_param",
        key: "system:param",
        name: "管理系统参数",
        module: "系统管理",
        description: "管理系统运行参数与配置项。",
        type: "menu",
        createdAt: "2026-01-13 09:20:00"
      }
    ]
  },
  {
    id: "content",
    label: "内容管理",
    items: [
      {
        id: "perm_content_video_upload",
        key: "content:video:upload",
        name: "上传视频",
        module: "内容管理",
        description: "向后台上传新的视频内容。",
        type: "action",
        createdAt: "2026-01-14 10:00:00"
      },
      {
        id: "perm_content_doc_publish",
        key: "content:doc:publish",
        name: "发布文档",
        module: "内容管理",
        description: "将文档从草稿箱发布到线上。",
        type: "action",
        createdAt: "2026-01-14 10:10:00"
      }
    ]
  }
];

function getTypeLabel(type: PermissionItem["type"]) {
  if (type === "menu") {
    return "菜单权限";
  }
  if (type === "action") {
    return "操作权限";
  }
  return "数据权限";
}

import { AdminSearchInput } from "@/components/Admin/AdminSearchInput";
import { AdminSelect } from "@/components/Admin/AdminSelect";

function PermissionPage() {
  const [keyword, setKeyword] = useState("");
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>("all");
  const [page, setPage] = useState(1);

  const flatPermissions = useMemo(() => {
    return permissionGroups.flatMap(group => group.items);
  }, []);

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

  return (
    <div className="space-y-4">
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
        <div className="p-3 space-y-3 text-xs border-b border-[var(--border-color)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <AdminSearchInput
                className="w-56"
                placeholder="按权限标识 / 名称 / 模块搜索"
                value={keyword}
                onValueChange={value => setKeyword(value)}
              />
              <AdminSelect
                aria-label="模块筛选"
                size="sm"
                className="w-40"
                selectedKeys={[moduleFilter]}
                onSelectionChange={keys => {
                  const key = Array.from(keys)[0];
                  setModuleFilter(key ? (String(key) as ModuleFilter) : "all");
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

export default PermissionPage;
