/**
 * 角色管理页面
 * @module pages/Admin/Personnel/Role
 */

import React, { useMemo, useState, useEffect, useCallback } from "react";
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
  addToast,
} from "@heroui/react";
import { FiCopy, FiEdit2, FiKey, FiLayers, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { Loading } from "@/components/Loading";
import {
  type RoleItem,
  type PermissionGroup,
  fetchRoleList,
  createRole,
  updateRole,
  deleteRole,
  batchDeleteRoles,
  batchCopyRoles,
  fetchPermissionGroups,
} from "@/api/admin/personnel";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
/**
 * 角色表单状态类型定义
 */
type RoleFormState = {
  /** 角色ID（编辑模式） */
  id?: string;
  /** 角色名称 */
  name: string;
  /** 角色描述 */
  description: string;
};

/**
 * 权限分配状态类型定义
 */
type PermissionAssignState = {
  /** 角色ID */
  roleId: string;
  /** 角色名称 */
  name: string;
  /** 已选权限ID列表 */
  permissions: string[];
};

// ===== 4. 通用工具函数区域 =====
/**
 * 创建空的角色表单初始状态
 * @returns 初始化的表单状态对象
 */
function createEmptyRoleForm(): RoleFormState {
  return {
    name: "",
    description: ""
  };
}

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====
/**
 * 显示角色表单验证错误
 * @param message 错误信息
 * @param setError 设置错误状态的函数
 */
function showRoleFormError(message: string, setError: (msg: string) => void) {
  setError(message);
}

// ===== 7. 数据处理函数区域 =====
/**
 * 格式化权限显示文本
 * @param count 已选数量
 * @param total 总数量
 * @returns 格式化后的字符串
 */
function formatPermissionLabel(count: number, total: number): string {
  return `${count} / ${total}`;
}

// ===== 8. UI渲染逻辑区域 =====
/**
 * 角色管理页面组件
 * @returns 页面JSX元素
 */
function RolePage() {
  // 列表数据与加载状态
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 表单相关状态
  const [roleForm, setRoleForm] = useState<RoleFormState | null>(null);
  const [roleFormMode, setRoleFormMode] = useState<"create" | "edit">("create");
  const [roleFormError, setRoleFormError] = useState("");

  // 权限分配相关状态
  const [permissionAssign, setPermissionAssign] = useState<PermissionAssignState | null>(null);

  // 分页状态
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // 权限数据
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);

  // 是否有选中的项
  const hasSelection = selectedIds.length > 0;
  
  // 总权限数量计算
  const totalPermissionCount = useMemo(
    () => new Set(permissionGroups.flatMap(group => group.items.map(item => item.id))).size,
    [permissionGroups]
  );

  // 总页数计算
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  /**
   * 获取角色列表数据
   */
  const loadRoleList = useCallback(async () => {
    const res = await fetchRoleList({ page, pageSize }, setIsLoading);
    
    if (res && res.code === 200) {
      setRoles(res.data.list);
      setTotal(res.data.total);
    }
  }, [page, pageSize]);

  /**
   * 加载权限分组数据
   */
  const loadPermissionGroups = useCallback(async () => {
    const res = await fetchPermissionGroups();
    if (res && res.code === 200) {
      setPermissionGroups(res.data);
    }
  }, []);

  // 初始化与页码变更监听
  useEffect(() => {
    const timer = setTimeout(() => {
      loadRoleList();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadRoleList]);

  // 初始化权限分组
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPermissionGroups();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadPermissionGroups]);

  /**
   * 处理表格选择变更
   * @param keys 选中的key集合
   */
  const handleTableSelectionChange = (keys: "all" | Set<React.Key>) => {
    if (keys === "all") {
      setSelectedIds(roles.map(item => item.id));
      return;
    }
    setSelectedIds(Array.from(keys).map(String));
  };

  /**
   * 打开新增角色弹窗
   */
  const handleOpenCreate = () => {
    setRoleForm(createEmptyRoleForm());
    setRoleFormMode("create");
    setRoleFormError("");
  };

  /**
   * 打开编辑角色弹窗
   * @param role 目标角色对象
   */
  const handleOpenEdit = (role: RoleItem) => {
    setRoleForm({
      id: role.id,
      name: role.name,
      description: role.description
    });
    setRoleFormMode("edit");
    setRoleFormError("");
  };

  /**
   * 处理表单字段变更
   * @param patch 变更的字段对象
   */
  const handleRoleFormChange = (patch: Partial<RoleFormState>) => {
    setRoleForm(previous => {
      if (!previous) return previous;
      return { ...previous, ...patch };
    });
  };

  /**
   * 关闭角色表单弹窗
   */
  const handleCloseRoleForm = () => {
    setRoleForm(null);
    setRoleFormError("");
  };

  /**
   * 提交角色表单（新增或更新）
   */
  const handleSubmitRoleForm = async () => {
    if (!roleForm) return;
    
    const trimmedName = roleForm.name.trim();
    if (!trimmedName) {
      showRoleFormError("角色名称为必填项，请补充后再提交。", setRoleFormError);
      return;
    }

    if (roleFormMode === "create") {
      const res = await createRole({
        name: trimmedName,
        description: roleForm.description.trim(),
        permissions: []
      });
      
      if (res && res.code === 200) {
        addToast({
          title: "角色新增成功",
          description: `已新增角色「${trimmedName}」。`,
          color: "success"
        });
        loadRoleList();
        handleCloseRoleForm();
      }
    } else if (roleForm.id) {
      const res = await updateRole({
        id: roleForm.id!,
        name: trimmedName,
        description: roleForm.description.trim(),
        permissions: [] 
      });
      
      if (res && res.code === 200) {
        addToast({
          title: "角色更新成功",
          description: `已更新角色「${trimmedName}」的信息。`,
          color: "success"
        });
        loadRoleList();
        handleCloseRoleForm();
      }
    }
  };

  /**
   * 批量删除角色
   */
  const handleBatchDeleteRoles = async () => {
    if (!hasSelection) return;
    
    const confirmed = window.confirm(
      `确定要删除选中的 ${selectedIds.length} 个角色吗？删除后对应用户的权限需同步核查。`
    );
    if (!confirmed) return;

    const res = await batchDeleteRoles(selectedIds);
    
    if (res && res.code === 200) {
      addToast({
        title: "批量删除成功",
        description: `已成功删除 ${selectedIds.length} 个角色。`,
        color: "success"
      });
      setSelectedIds([]);
      loadRoleList();
    }
  };

  /**
   * 删除单个角色
   * @param role 目标角色对象
   */
  const handleDeleteSingleRole = async (role: RoleItem) => {
    const confirmed = window.confirm(
      `确定要删除角色「${role.name}」吗？建议在确认无用户绑定该角色后再执行。`
    );
    if (!confirmed) return;

    const res = await deleteRole(role.id);
    
    if (res && res.code === 200) {
      addToast({
        title: "角色删除成功",
        description: `已删除角色「${role.name}」。`,
        color: "success"
      });
      loadRoleList();
      setSelectedIds(previous => previous.filter(id => id !== role.id));
    }
  };

  /**
   * 打开权限分配弹窗
   * @param role 目标角色对象
   */
  const handleOpenAssignPermission = (role: RoleItem) => {
    setPermissionAssign({
      roleId: role.id,
      name: role.name,
      permissions: [...role.permissions]
    });
  };

  /**
   * 确认并保存权限分配
   */
  const handleConfirmAssignPermission = async () => {
    if (!permissionAssign) return;

    const targetRole = roles.find(r => r.id === permissionAssign.roleId);
    
    const res = await updateRole({
      id: permissionAssign.roleId,
      name: permissionAssign.name,
      description: targetRole?.description || "",
      permissions: [...permissionAssign.permissions]
    });
    
    if (res && res.code === 200) {
      addToast({
        title: "权限更新成功",
        description: `已更新角色「${permissionAssign.name}」的权限配置。`,
        color: "success"
      });
      loadRoleList();
      setPermissionAssign(null);
    }
  };

  /**
   * 复制单个角色
   * @param role 目标角色对象
   */
  const handleCopyRole = async (role: RoleItem) => {
    const baseName = `${role.name}（副本）`;
    let name = baseName;
    let index = 1;
    
    while (roles.some(item => item.name === name)) {
      name = `${baseName}${index}`;
      index += 1;
    }

    const res = await createRole({
      name,
      description: role.description,
      permissions: [...role.permissions]
    });
    
    if (res && res.code === 200) {
      addToast({
        title: "角色复制成功",
        description: `已成功复制角色「${role.name}」并创建新角色「${name}」。`,
        color: "success"
      });
      loadRoleList();
    }
  };

  /**
   * 批量复制角色
   */
  const handleBatchCopy = async () => {
    if (!hasSelection) return;

    const confirmed = window.confirm(
      `确定要复制选中的 ${selectedIds.length} 个角色吗？`
    );
    if (!confirmed) return;

    const res = await batchCopyRoles(selectedIds);
    
    if (res && res.code === 200) {
      addToast({
        title: "批量复制成功",
        description: `已成功复制 ${selectedIds.length} 个角色。`,
        color: "success"
      });
      loadRoleList();
      setSelectedIds([]);
    }
  };

  /**
   * 处理分页切换
   * @param next 下一页页码
   */
  const handlePageChange = (next: number) => {
    if (next < 1 || next > totalPages) return;
    setPage(next);
    setSelectedIds([]);
  };

  // 已选权限数量计算
  const selectedPermissionCount = useMemo(() => {
    return permissionAssign?.permissions.length || 0;
  }, [permissionAssign]);

  return (
    <div className="space-y-4">
      {/* 页面头部 */}
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
        {/* 工具栏 */}
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

        {/* 角色表格 */}
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
                <TableColumn className="px-3 py-2 text-left font-medium">角色名称</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">角色描述</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">角色权限</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">显示顺序</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">状态</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">权限数</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">创建时间</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">操作</TableColumn>
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
                      <span className="text-xs">{role.roleKey}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span className="text-xs">{role.roleSort}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                        role.status === '0' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {role.status === '0' ? '正常' : '停用'}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <Chip size="sm" variant="flat" color="primary" className="text-xs">
                        {formatPermissionLabel(role.permissions.length, totalPermissionCount)}
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
                          权限
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
          
          {/* 分页 */}
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
        </div>
      </Card>

      {/* 角色编辑弹窗 */}
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
                  placeholder="请输入角色名称"
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
              </div>
              <div className="space-y-1">
                <div>角色描述</div>
                <Textarea
                  minRows={3}
                  maxRows={5}
                  size="sm"
                  variant="bordered"
                  placeholder="请输入角色职责描述"
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

      {/* 权限分配弹窗 */}
      {permissionAssign && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl rounded-[var(--radius-base)] bg-[var(--bg-elevated)] border border-[var(--border-color)] shadow-lg">
            <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="text-sm font-medium">分配权限 · {permissionAssign.name}</div>
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
              
              <div className="space-y-3">
                {permissionGroups.map(group => {
                  const groupIds = group.items.map(item => item.id);
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
                                setPermissionAssign(prev => {
                                  if (!prev) return prev;
                                  return {
                                    ...prev,
                                    permissions: Array.from(new Set([...prev.permissions, ...groupIds]))
                                  };
                                });
                              }}
                            >
                              全选
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              className="h-7 text-xs"
                              onPress={() => {
                                setPermissionAssign(prev => {
                                  if (!prev) return prev;
                                  return {
                                    ...prev,
                                    permissions: prev.permissions.filter(id => !groupIds.includes(id))
                                  };
                                });
                              }}
                            >
                              清空
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {group.items.map(item => (
                            <Checkbox
                              key={item.id}
                              isSelected={permissionAssign.permissions.includes(item.id)}
                              onValueChange={value => {
                                setPermissionAssign(prev => {
                                  if (!prev) return prev;
                                  const newPermissions = value
                                    ? [...prev.permissions, item.id]
                                    : prev.permissions.filter(id => id !== item.id);
                                  return { ...prev, permissions: newPermissions };
                                });
                              }}
                              className="text-xs"
                            >
                              {item.name}
                            </Checkbox>
                          ))}
                        </div>
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

// ===== 9. 页面初始化与事件绑定 =====
// (逻辑已包含在组件内部)

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
export default RolePage;
