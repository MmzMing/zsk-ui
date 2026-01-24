import React, { useMemo, useState, useEffect } from "react";
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
  TableCell,
  addToast
} from "@heroui/react";
import { FiCopy, FiEdit2, FiKey, FiLayers, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { Loading } from "@/components/Loading";

import {
  type RoleItem,
  type PermissionGroup,
  fetchRoleList,
  createRole,
  updateRole,
  deleteRole
} from "@/api/admin/personnel";
import { mockPermissionGroups } from "@/api/mock/admin/personnel";

type RoleFormState = {
  id?: string;
  name: string;
  description: string;
};

type PermissionAssignState = {
  roleId: string;
  name: string;
  permissions: string[];
};

const permissionGroups: PermissionGroup[] = mockPermissionGroups;

function createEmptyRoleForm(): RoleFormState {
  return {
    name: "",
    description: ""
  };
}

function RolePage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [roleForm, setRoleForm] = useState<RoleFormState | null>(null);
  const [roleFormMode, setRoleFormMode] = useState<"create" | "edit">("create");
  const [roleFormError, setRoleFormError] = useState("");

  const [permissionAssign, setPermissionAssign] = useState<PermissionAssignState | null>(
    null
  );

  const [page, setPage] = useState(1);
  const pageSize = 6;

  const hasSelection = selectedIds.length > 0;

  // 获取角色列表
  const loadRoleList = React.useCallback(async () => {
    setIsLoading(true);
    const res = await fetchRoleList({ page, pageSize });
    if (res.code === 200 && !res.msg) {
      setRoles(res.data.list);
      setTotal(res.data.total);
    }
    setIsLoading(false);
  }, [page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRoleList();
  }, [loadRoleList]);

  const totalPermissionCount = useMemo(
    () => new Set(permissionGroups.flatMap(group => group.items.map(item => item.id))).size,
    []
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleTableSelectionChange = (keys: "all" | Set<React.Key>) => {
    if (keys === "all") {
      setSelectedIds(roles.map(item => item.id));
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

  const handleSubmitRoleForm = async () => {
    if (!roleForm) {
      return;
    }
    const trimmedName = roleForm.name.trim();
    if (!trimmedName) {
      setRoleFormError("角色名称为必填项，请补充后再提交。");
      return;
    }

    if (roleFormMode === "create") {
      const res = await createRole({
        name: trimmedName,
        description: roleForm.description.trim(),
        permissions: []
      });
      if (res.code === 200 && !res.msg) {
        addToast({
          title: "角色新增成功",
          description: `已新增角色「${trimmedName}」。`,
          color: "success"
        });
        loadRoleList();
        setRoleForm(null);
        setRoleFormError("");
      }
    } else if (roleForm.id) {
      const res = await updateRole({
        id: roleForm.id,
        name: trimmedName,
        description: roleForm.description.trim(),
        permissions: [] // 编辑时不改变权限，通常由权限分配功能处理
      });
      if (res.code === 200 && !res.msg) {
        addToast({
          title: "角色更新成功",
          description: `已更新角色「${trimmedName}」的信息。`,
          color: "success"
        });
        loadRoleList();
        setRoleForm(null);
        setRoleFormError("");
      }
    }
  };

  const handleBatchDeleteRoles = async () => {
    if (!hasSelection) {
      return;
    }
    const confirmed = window.confirm(
      `确定要删除选中的 ${selectedIds.length} 个角色吗？删除后对应用户的权限需同步核查。`
    );
    if (!confirmed) {
      return;
    }
    // 循环删除或调用批量接口（如果API支持）
    let successCount = 0;
    for (const id of selectedIds) {
      const res = await deleteRole(id);
      if (res.code === 200 && !res.msg) {
        successCount++;
      }
    }
    
    if (successCount > 0) {
      addToast({
        title: successCount === selectedIds.length ? "批量删除成功" : `部分删除成功 (${successCount}/${selectedIds.length})`,
        description: `已删除 ${successCount} 个角色。`,
        color: successCount === selectedIds.length ? "success" : "warning"
      });
      setSelectedIds([]);
      loadRoleList();
    }
  };

  const handleDeleteSingleRole = async (role: RoleItem) => {
    const confirmed = window.confirm(
      `确定要删除角色「${role.name}」吗？建议在确认无用户绑定该角色后再执行。`
    );
    if (!confirmed) {
      return;
    }
    const res = await deleteRole(role.id);
    if (res.code === 200 && !res.msg) {
      addToast({
        title: "角色删除成功",
        description: `已删除角色「${role.name}」。`,
        color: "success"
      });
      loadRoleList();
      setSelectedIds(previous => previous.filter(id => id !== role.id));
    }
  };

  const handleOpenAssignPermission = (role: RoleItem) => {
    setPermissionAssign({
      roleId: role.id,
      name: role.name,
      permissions: [...role.permissions]
    });
  };

  const handleConfirmAssignPermission = async () => {
    if (!permissionAssign) {
      return;
    }
    // 对接更新接口
    try {
      const res = await updateRole({
        id: permissionAssign.roleId,
        name: permissionAssign.name,
        description: roles.find(r => r.id === permissionAssign.roleId)?.description || "",
        permissions: [...permissionAssign.permissions]
      });
      if (res.code === 200 && !res.msg) {
        addToast({
          title: "权限更新成功",
          description: `已更新角色「${permissionAssign.name}」的权限配置。`,
          color: "success"
        });
        loadRoleList();
        setPermissionAssign(null);
      }
    } catch (error) {
      console.error("Assign permission failed:", error);
    }
  };

  const handleCopyRole = async (role: RoleItem) => {
    const baseName = `${role.name}（副本）`;
    let name = baseName;
    let index = 1;
    while (roles.some(item => item.name === name)) {
      name = `${baseName}${index}`;
      index += 1;
    }
    try {
      const res = await createRole({
        name,
        description: role.description,
        permissions: [...role.permissions]
      });
      if (res.code === 200 && !res.msg) {
        addToast({
          title: "角色复制成功",
          description: `已成功复制角色「${role.name}」并创建新角色「${name}」。`,
          color: "success"
        });
        loadRoleList();
      }
    } catch (error) {
      console.error("Copy role failed:", error);
    }
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
                  角色描述
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  权限数
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  创建时间
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  操作
                </TableColumn>
              </TableHeader>
              <TableBody
                items={roles}
                emptyContent={isLoading ? " " : "未找到角色配置，点击「新增角色」开始配置。"}
                loadingContent={<Loading />}
                isLoading={isLoading}
              >
                {role => (
                  <TableRow
                    key={role.id}
                    className="border-t border-[var(--border-color)] hover:bg-[var(--bg-elevated)]/60"
                  >
                    <TableCell className="px-3 py-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-xs break-all">{role.name}</span>
                        <span className="text-xs text-[var(--text-color-secondary)]">
                          ID: {role.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span className="line-clamp-1 max-w-[200px]">{role.description}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <Chip size="sm" variant="flat" color="primary" className="text-xs">
                        {role.permissions.length} / {totalPermissionCount}
                      </Chip>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span>{role.createdAt}</span>
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
                          startContent={<FiLayers className="text-xs" />}
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
                          复制
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
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-3 flex flex-col gap-2 text-xs md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <span>
                共 {total} 个角色，当前第 {page} / {totalPages} 页
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
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="h-8 w-8 text-[var(--text-color-secondary)]"
                onPress={handleCloseRoleForm}
              >
                <FiX className="text-base" />
              </Button>
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
                    inputWrapper: [
                      "h-8",
                      "bg-transparent",
                      "border border-[var(--border-color)]",
                      "dark:border-white/20",
                      "hover:border-[var(--primary-color)]/80!",
                      "group-data-[focus=true]:border-[var(--primary-color)]!",
                      "transition-colors",
                      "shadow-none"
                    ].join(" "),
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
                    inputWrapper: [
                      "bg-transparent",
                      "border border-[var(--border-color)]",
                      "dark:border-white/20",
                      "hover:border-[var(--primary-color)]/80!",
                      "group-data-[focus=true]:border-[var(--primary-color)]!",
                      "transition-colors",
                      "shadow-none"
                    ].join(" "),
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
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="h-8 w-8 text-[var(--text-color-secondary)]"
                onPress={() => setPermissionAssign(null)}
              >
                <FiX className="text-base" />
              </Button>
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
                                {item.name}
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
