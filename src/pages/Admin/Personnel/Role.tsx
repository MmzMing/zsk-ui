import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  Chip,
  Input,
  Textarea,
  Checkbox,
  Pagination,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from "@heroui/react";
import { FiCopy, FiEdit2, FiKey, FiLayers, FiPlus, FiTrash2 } from "react-icons/fi";

type RoleItem = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  permissions: string[];
};

type RoleFormState = {
  id?: string;
  name: string;
  description: string;
};

type PermissionGroup = {
  id: string;
  label: string;
  items: { id: string; label: string }[];
};

type PermissionAssignState = {
  roleId: string;
  name: string;
  permissions: string[];
};

const permissionGroups: PermissionGroup[] = [
  {
    id: "dashboard",
    label: "仪表盘",
    items: [
      { id: "dashboard:view", label: "查看仪表盘总览" },
      { id: "dashboard:analysis", label: "查看分析页" }
    ]
  },
  {
    id: "ops",
    label: "系统运维",
    items: [
      { id: "ops:monitor", label: "查看系统监控" },
      { id: "ops:cache", label: "查看缓存监控与列表" },
      { id: "ops:log", label: "查看系统日志" }
    ]
  },
  {
    id: "personnel",
    label: "人员管理",
    items: [
      { id: "personnel:user", label: "管理用户" },
      { id: "personnel:menu", label: "管理菜单" },
      { id: "personnel:role", label: "管理角色与权限" }
    ]
  }
];

const initialRoles: RoleItem[] = [
  {
    id: "r_001",
    name: "系统管理员",
    description: "拥有后台所有模块的访问与配置权限，用于项目初始配置阶段。",
    createdAt: "2026-01-10 09:00:00",
    permissions: [
      "dashboard:view",
      "dashboard:analysis",
      "ops:monitor",
      "ops:cache",
      "ops:log",
      "personnel:user",
      "personnel:menu",
      "personnel:role"
    ]
  },
  {
    id: "r_002",
    name: "内容运营",
    description: "负责日常内容上架与调整，可查看核心监控数据，但无法修改系统配置。",
    createdAt: "2026-01-11 13:20:15",
    permissions: ["dashboard:view", "dashboard:analysis", "ops:log"]
  },
  {
    id: "r_003",
    name: "审核员",
    description: "专注审核内容与处理违规记录，避免误操作系统级配置。",
    createdAt: "2026-01-12 16:45:30",
    permissions: ["dashboard:view", "ops:log"]
  }
];

function createEmptyRoleForm(): RoleFormState {
  return {
    name: "",
    description: ""
  };
}

function RolePage() {
  const [roles, setRoles] = useState<RoleItem[]>(() => initialRoles);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const [roleForm, setRoleForm] = useState<RoleFormState | null>(null);
  const [roleFormMode, setRoleFormMode] = useState<"create" | "edit">("create");
  const [roleFormError, setRoleFormError] = useState("");

  const [permissionAssign, setPermissionAssign] = useState<PermissionAssignState | null>(
    null
  );

  const [page, setPage] = useState(1);
  const pageSize = 6;

  const hasSelection = selectedIds.length > 0;

  const totalPermissionCount = useMemo(
    () => new Set(permissionGroups.flatMap(group => group.items.map(item => item.id))).size,
    []
  );

  const total = roles.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageItems = roles.slice(startIndex, endIndex);
  const handleTableSelectionChange = (keys: "all" | Set<React.Key>) => {
    if (keys === "all") {
      setSelectedIds(pageItems.map(item => item.id));
      return;
    }
    setSelectedIds(Array.from(keys).map(String));
  };

  const handleOpenCreate = () => {
    setRoleForm(createEmptyRoleForm());
    setRoleFormMode("create");
    setRoleFormError("");
  };

  const handleOpenEdit = (role: RoleItem) => {
    setRoleForm({
      id: role.id,
      name: role.name,
      description: role.description
    });
    setRoleFormMode("edit");
    setRoleFormError("");
  };

  const handleRoleFormChange = (patch: Partial<RoleFormState>) => {
    setRoleForm(previous => {
      if (!previous) {
        return previous;
      }
      return { ...previous, ...patch };
    });
  };

  const handleCloseRoleForm = () => {
    setRoleForm(null);
    setRoleFormError("");
  };

  const handleSubmitRoleForm = () => {
    if (!roleForm) {
      return;
    }
    const trimmedName = roleForm.name.trim();
    if (!trimmedName) {
      setRoleFormError("角色名称为必填项，请补充后再提交。");
      return;
    }
    const exists = roles.some(item => item.name === trimmedName && item.id !== roleForm.id);
    if (exists) {
      setRoleFormError("角色名称已存在，请保证唯一性。");
      return;
    }
    if (roleFormMode === "create") {
      const nextId = `r_${(roles.length + 1).toString().padStart(3, "0")}`;
      const now = new Date();
      const createdAt = `${now.getFullYear()}-${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")} ${now
        .getHours()
        .toString()
        .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now
        .getSeconds()
        .toString()
        .padStart(2, "0")}`;
      const next: RoleItem = {
        id: nextId,
        name: trimmedName,
        description: roleForm.description.trim(),
        createdAt,
        permissions: []
      };
      setRoles(previous => [next, ...previous]);
      setMessage(`已新增角色「${next.name}」，实际保存逻辑待接入角色接口。`);
    } else {
      setRoles(previous =>
        previous.map(item =>
          item.id === roleForm.id
            ? { ...item, name: trimmedName, description: roleForm.description.trim() }
            : item
        )
      );
      setMessage(`已更新角色「${trimmedName}」的信息，实际保存逻辑待接入角色接口。`);
    }
    setRoleForm(null);
    setRoleFormError("");
  };

  const handleBatchDeleteRoles = () => {
    if (!hasSelection) {
      return;
    }
    const confirmed = window.confirm(
      `确定要删除选中的 ${selectedIds.length} 个角色吗？删除后对应用户的权限需同步核查。`
    );
    if (!confirmed) {
      return;
    }
    setRoles(previous => previous.filter(item => !selectedIds.includes(item.id)));
    setPage(1);
    setSelectedIds([]);
    setMessage(
      `已从当前配置中删除 ${selectedIds.length} 个角色，实际删除逻辑待接入角色接口。`
    );
  };

  const handleDeleteSingleRole = (role: RoleItem) => {
    const confirmed = window.confirm(
      `确定要删除角色「${role.name}」吗？建议在确认无用户绑定该角色后再执行。`
    );
    if (!confirmed) {
      return;
    }
    setRoles(previous => previous.filter(item => item.id !== role.id));
    setSelectedIds(previous => previous.filter(id => id !== role.id));
    setMessage(
      `已删除角色「${role.name}」，实际删除逻辑待接入角色接口。`
    );
  };

  const handleOpenAssignPermission = (role: RoleItem) => {
    setPermissionAssign({
      roleId: role.id,
      name: role.name,
      permissions: [...role.permissions]
    });
  };

  const handleConfirmAssignPermission = () => {
    if (!permissionAssign) {
      return;
    }
    setRoles(previous =>
      previous.map(item =>
        item.id === permissionAssign.roleId
          ? { ...item, permissions: [...permissionAssign.permissions] }
          : item
      )
    );
    setMessage(
      `已更新角色「${permissionAssign.name}」的权限配置，实际保存逻辑待接入权限分配接口。`
    );
    setPermissionAssign(null);
  };

  const handleCopyRole = (role: RoleItem) => {
    const baseName = `${role.name}（副本）`;
    let name = baseName;
    let index = 1;
    while (roles.some(item => item.name === name)) {
      name = `${baseName}${index}`;
      index += 1;
    }
    const nextId = `r_${(roles.length + 1).toString().padStart(3, "0")}`;
    const now = new Date();
    const createdAt = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")} ${now
      .getHours()
      .toString()
      .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;
    const copy: RoleItem = {
      id: nextId,
      name,
      description: role.description,
      createdAt,
      permissions: [...role.permissions]
    };
    setRoles(previous => [copy, ...previous]);
    setMessage(
      `已基于角色「${role.name}」复制生成新角色「${name}」，并继承原有权限。`
    );
  };

  const handleBatchCopy = () => {
    if (!hasSelection) {
      return;
    }
    const target = roles.find(item => item.id === selectedIds[0]);
    if (!target) {
      return;
    }
    handleCopyRole(target);
  };

  const handlePageChange = (next: number) => {
    if (next < 1 || next > totalPages) {
      return;
    }
    setPage(next);
    setSelectedIds([]);
  };

  const selectedPermissionCount = useMemo(() => {
    if (!permissionAssign) {
      return 0;
    }
    return permissionAssign.permissions.length;
  }, [permissionAssign]);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-xs text-[var(--primary-color)]">
          <span>人员管理 · 角色管理</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          配置后台角色与权限边界
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl">
          通过角色将权限进行分组与复用，支持新增、编辑、批量删除与复制角色，以及按模块分配权限。
        </p>
      </div>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 space-y-3 text-xs border-b border-[var(--border-color)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="h-8 text-xs"
                startContent={<FiPlus className="text-xs" />}
                onPress={handleOpenCreate}
              >
                新增角色
              </Button>
              <Button
                size="sm"
                variant="light"
                className="h-8 text-xs"
                startContent={<FiCopy className="text-xs" />}
                disabled={!hasSelection}
                onPress={handleBatchCopy}
              >
                复制角色
              </Button>
              <Button
                size="sm"
                color="danger"
                variant="flat"
                className="h-8 text-xs"
                startContent={<FiTrash2 className="text-xs" />}
                disabled={!hasSelection}
                onPress={handleBatchDeleteRoles}
              >
                批量删除
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-color-secondary)]">
              <span>当前权限示例按模块进行分组，实际项目可与后端权限表结构对接。</span>
            </div>
          </div>
          {message && (
            <div className="mt-1 flex items-center justify-between text-xs text-[var(--text-color-secondary)]">
              <span>{message}</span>
              <Button
                size="sm"
                variant="light"
                className="h-7 text-xs"
                onPress={() => setMessage("")}
              >
                知道了
              </Button>
            </div>
          )}
        </div>

        <div className="p-3 space-y-3 text-xs">
          <div className="overflow-auto border border-[var(--border-color)] rounded-lg">
            <Table
              aria-label="角色列表"
              className="min-w-full text-xs"
              selectionMode="multiple"
              selectedKeys={selectedIds.length ? new Set(selectedIds) : new Set()}
              onSelectionChange={handleTableSelectionChange}
            >
              <TableHeader className="bg-[var(--bg-elevated)]/80">
                <TableColumn className="px-3 py-2 text-left font-medium">
                  角色名称
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  描述
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  创建时间
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  权限数
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  操作
                </TableColumn>
              </TableHeader>
              <TableBody
                items={pageItems}
                emptyContent="当前暂无角色配置，可通过上方按钮新增角色。"
              >
                {role => {
                  return (
                    <TableRow
                      key={role.id}
                      className="border-t border-[var(--border-color)] hover:bg-[var(--bg-elevated)]/60"
                    >
                      <TableCell className="px-3 py-2">
                        <div className="flex flex-col gap-0.5">
                          <span>{role.name}</span>
                          <span className="text-xs text-[var(--text-color-secondary)]">
                            ID: {role.id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <span className="line-clamp-2">
                          {role.description || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <span>{role.createdAt}</span>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <Chip size="sm" variant="flat" className="text-xs">
                          {role.permissions.length} / {totalPermissionCount}
                        </Chip>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <div className="flex flex-wrap gap-1.5">
                          <Button
                            size="sm"
                            variant="light"
                            className="h-7 text-xs"
                            startContent={<FiEdit2 className="text-xs" />}
                            onPress={() => handleOpenEdit(role)}
                          >
                            编辑
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            className="h-7 text-xs"
                            startContent={<FiKey className="text-xs" />}
                            onPress={() => handleOpenAssignPermission(role)}
                          >
                            分配权限
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            className="h-7 text-xs"
                            startContent={<FiCopy className="text-xs" />}
                            onPress={() => handleCopyRole(role)}
                          >
                            复制角色
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="light"
                            className="h-7 text-xs"
                            startContent={<FiTrash2 className="text-xs" />}
                            onPress={() => handleDeleteSingleRole(role)}
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
                共 {total} 个角色，当前第 {currentPage} / {totalPages} 页
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
          <div className="mt-1 text-xs text-[var(--text-color-secondary)]">
            角色与权限采用解耦设计，分页与当前筛选条件可与服务端角色查询接口联动。
          </div>
        </div>
      </Card>

      {roleForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-[var(--radius-base)] bg-[var(--bg-elevated)] border border-[var(--border-color)] shadow-lg">
            <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="text-sm font-medium">
                {roleFormMode === "create" ? "新增角色" : "编辑角色信息"}
              </div>
              <button
                type="button"
                className="text-xs text-[var(--text-color-secondary)]"
                onClick={handleCloseRoleForm}
              >
                关闭
              </button>
            </div>
            <div className="px-4 py-3 space-y-3 text-xs">
              {roleFormError && (
                <div className="rounded-[var(--radius-base)] border border-red-500/60 bg-red-500/5 px-3 py-2 text-xs text-red-300">
                  {roleFormError}
                </div>
              )}
              <div className="space-y-1">
                <div>角色名称（必填）</div>
                <Input
                  size="sm"
                  variant="bordered"
                  value={roleForm.name}
                  onValueChange={value => handleRoleFormChange({ name: value })}
                  classNames={{
                    inputWrapper: "h-8 text-xs",
                    input: "text-xs"
                  }}
                />
                <div className="text-xs text-[var(--text-color-secondary)]">
                  角色名称需保证唯一，例如「系统管理员」「内容运营」「审核员」等。
                </div>
              </div>
              <div className="space-y-1">
                <div>角色描述</div>
                <Textarea
                  minRows={3}
                  maxRows={5}
                  size="sm"
                  variant="bordered"
                  value={roleForm.description}
                  onValueChange={value => handleRoleFormChange({ description: value })}
                  classNames={{
                    inputWrapper: "text-xs",
                    input: "text-xs"
                  }}
                />
                <div className="text-xs text-[var(--text-color-secondary)]">
                  建议简要说明角色的职责边界，便于团队成员理解角色用途。
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-[var(--border-color)] flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="light"
                className="h-8 text-xs"
                onPress={handleCloseRoleForm}
              >
                取消
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs"
                onPress={handleSubmitRoleForm}
              >
                保存
              </Button>
            </div>
          </div>
        </div>
      )}

      {permissionAssign && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl rounded-[var(--radius-base)] bg-[var(--bg-elevated)] border border-[var(--border-color)] shadow-lg">
            <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="text-sm font-medium">
                分配权限 · {permissionAssign.name}
              </div>
              <button
                type="button"
                className="text-xs text-[var(--text-color-secondary)]"
                onClick={() => setPermissionAssign(null)}
              >
                关闭
              </button>
            </div>
            <div className="px-4 py-3 space-y-3 text-xs max-h-[460px] overflow-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <FiLayers className="text-xs" />
                  <span>按模块划分的权限树</span>
                </div>
                <Chip size="sm" variant="flat" className="text-xs">
                  已选 {selectedPermissionCount} / {totalPermissionCount}
                </Chip>
              </div>
              <div className="text-xs text-[var(--text-color-secondary)]">
                可按模块全选 / 反选权限项，勾选结果会实时统计在右上角，实际项目中可与后端权限树结构同步。
              </div>
              <div className="space-y-3">
                {permissionGroups.map(group => {
                  const groupIds = group.items.map(item => item.id);
                  const allInGroupSelected = groupIds.every(id =>
                    permissionAssign.permissions.includes(id)
                  );
                  const someInGroupSelected =
                    !allInGroupSelected &&
                    groupIds.some(id => permissionAssign.permissions.includes(id));
                  return (
                    <Card
                      key={group.id}
                      className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95"
                    >
                      <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs">
                              <FiKey className="w-3 h-3" />
                            </span>
                            <span className="text-xs font-medium">{group.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="light"
                              className="h-7 text-xs"
                              onPress={() => {
                                setPermissionAssign(previous => {
                                  if (!previous) {
                                    return previous;
                                  }
                                  return {
                                    ...previous,
                                    permissions: Array.from(
                                      new Set([...previous.permissions, ...groupIds])
                                    )
                                  };
                                });
                              }}
                            >
                              全选本模块
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              className="h-7 text-xs"
                              onPress={() => {
                                setPermissionAssign(previous => {
                                  if (!previous) {
                                    return previous;
                                  }
                                  return {
                                    ...previous,
                                    permissions: previous.permissions.filter(
                                      id => !groupIds.includes(id)
                                    )
                                  };
                                });
                              }}
                            >
                              反选本模块
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {group.items.map(item => {
                            const selected = permissionAssign.permissions.includes(item.id);
                            return (
                              <Checkbox
                                key={item.id}
                                isSelected={selected}
                                onValueChange={value => {
                                  setPermissionAssign(previous => {
                                    if (!previous) {
                                      return previous;
                                    }
                                    if (value) {
                                      return {
                                        ...previous,
                                        permissions: [...previous.permissions, item.id]
                                      };
                                    }
                                    return {
                                      ...previous,
                                      permissions: previous.permissions.filter(
                                        id => id !== item.id
                                      )
                                    };
                                  });
                                }}
                                className="text-xs"
                              >
                                {item.label}
                              </Checkbox>
                            );
                          })}
                        </div>
                        {someInGroupSelected && !allInGroupSelected && (
                          <div className="text-xs text-[var(--text-color-secondary)]">
                            已部分勾选本模块权限。
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
            <div className="px-4 py-3 border-t border-[var(--border-color)] flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="light"
                className="h-8 text-xs"
                onPress={() => setPermissionAssign(null)}
              >
                取消
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs"
                onPress={handleConfirmAssignPermission}
              >
                确认分配
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RolePage;
