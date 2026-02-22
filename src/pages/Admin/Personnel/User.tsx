/**
 * 用户管理页面
 * @module pages/Admin/Personnel/User
 * @description 后台用户账号管理，支持新增、编辑、删除、角色分配、密码重置等功能
 */

import React from "react";
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
  Tab,
  Tooltip,
  addToast
} from "@heroui/react";
import {
  FiDownload,
  FiEdit2,
  FiKey,
  FiPlus,
  FiRotateCcw,
  FiTrash2,
  FiUpload,
  FiUserCheck,
  FiX
} from "react-icons/fi";
import { AdminSearchInput } from "@/components/Admin/AdminSearchInput";
import { AdminSelect } from "@/components/Admin/AdminSelect";
import { AdminTabs } from "@/components/Admin/AdminTabs";
import { AdminInput } from "@/components/Admin/AdminInput";
import { Loading } from "@/components/Loading";
import {
  type SysUser,
  fetchUserList,
  createUser,
  updateUser,
  deleteUser,
  batchDeleteUsers,
  toggleUserStatus,
  resetPassword,
  batchResetPassword
} from "@/api/admin/personnel";
import { useUserStore } from "@/store/modules/userStore";
import { usePageState, useSelection } from "@/hooks";
import { PAGINATION } from "@/constants";

/**
 * 用户表单状态类型定义
 */
type UserFormState = {
  /** 用户ID（编辑模式） */
  id?: string;
  /** 用户名 */
  userName: string;
  /** 姓名 */
  nickName: string;
  /** 手机号 */
  phonenumber: string;
  /** 是否启用 */
  enabled: boolean;
};

/**
 * 角色分配状态类型定义
 */
type RoleAssignState = {
  /** 用户ID */
  userId: string;
  /** 用户名 */
  name: string;
  /** 已选角色列表 */
  roles: string[];
};

/**
 * 创建空的用户表单初始状态
 * @returns 初始化的表单状态对象
 */
function createEmptyUserForm(): UserFormState {
  return {
    userName: "",
    nickName: "",
    phonenumber: "",
    enabled: true
  };
}

/**
 * 用户管理页面组件
 * @returns 页面JSX元素
 */
function UserPage() {
  /** 当前登录用户ID */
  const { userId: currentUserId } = useUserStore();

  /** 分页状态 */
  const { page, setPage, total, setTotal, totalPages, handlePageChange } = usePageState({ pageSize: PAGINATION.DEFAULT_PAGE_SIZE });

  /** 表格选择状态 */
  const { selectedIds, setSelectedIds, hasSelection, handleTableSelectionChange: handleSelectionChange } = useSelection();

  /** 列表数据与加载状态 */
  const [users, setUsers] = React.useState<SysUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  /** 筛选条件状态 */
  const [keyword, setKeyword] = React.useState("");
  const [phoneKeyword, setPhoneKeyword] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "enabled" | "disabled">("all");

  /** 表单相关状态 */
  const [userForm, setUserForm] = React.useState<UserFormState | null>(null);
  const [userFormMode, setUserFormMode] = React.useState<"create" | "edit">("create");
  const [userFormError, setUserFormError] = React.useState("");

  /** 角色分配相关状态 */
  const [roleAssign, setRoleAssign] = React.useState<RoleAssignState | null>(null);

  /**
   * 获取用户列表数据
   */
  const loadUserList = React.useCallback(async () => {
    const res = await fetchUserList({
      page,
      pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
      keyword: keyword.trim() || undefined,
      phone: phoneKeyword.trim() || undefined,
      status: statusFilter === "all" ? undefined : statusFilter
    }, setIsLoading);

    if (res && res.code === 200) {
      setUsers(res.data.rows);
      setTotal(res.data.total);
    }
  }, [page, keyword, phoneKeyword, statusFilter, setTotal]);

  /** 初始化加载 */
  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadUserList();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadUserList]);

  /**
   * 处理表格选择变更
   */
  const handleTableSelectionChange = (keys: "all" | Set<React.Key>) => {
    if (keys === "all") {
      setSelectedIds(users.map(item => String(item.id)));
      return;
    }
    handleSelectionChange(keys);
  };

  /**
   * 重置所有筛选条件
   */
  const handleResetFilter = () => {
    setKeyword("");
    setPhoneKeyword("");
    setRoleFilter("all");
    setStatusFilter("all");
    setPage(1);
    setSelectedIds([]);
  };

  /**
   * 打开新增用户表单
   */
  const handleOpenCreateUser = () => {
    setUserForm(createEmptyUserForm());
    setUserFormMode("create");
    setUserFormError("");
  };

  /**
   * 打开编辑用户表单
   */
  const handleOpenEditUser = (user: SysUser) => {
    setUserForm({
      id: String(user.id),
      userName: user.userName || "",
      nickName: user.nickName || "",
      phonenumber: user.phonenumber || "",
      enabled: user.status === "0"
    });
    setUserFormMode("edit");
    setUserFormError("");
  };

  /**
   * 处理表单字段变更
   */
  const handleUserFormChange = (patch: Partial<UserFormState>) => {
    setUserForm(previous => previous ? { ...previous, ...patch } : null);
  };

  /**
   * 关闭用户表单
   */
  const handleCloseUserForm = () => {
    setUserForm(null);
    setUserFormError("");
  };

  /**
   * 提交用户表单
   */
  const handleSubmitUserForm = async () => {
    if (!userForm) return;

    const trimmedUsername = userForm.userName.trim();
    const trimmedName = userForm.nickName.trim();
    if (!trimmedUsername || !trimmedName) {
      setUserFormError("账号与姓名为必填项，请补充完整后再提交。");
      return;
    }

    if (userFormMode === "create") {
      const res = await createUser({
        userName: trimmedUsername,
        nickName: trimmedName,
        phonenumber: userForm.phonenumber.trim(),
        status: userForm.enabled ? "0" : "1"
      });
      if (res && res.code === 200) {
        addToast({ title: "用户新增成功", description: `已新增用户 ${trimmedUsername}。`, color: "success" });
        loadUserList();
        handleCloseUserForm();
      }
    } else if (userForm.id) {
      if (userForm.id === currentUserId && !userForm.enabled) {
        addToast({ title: "操作受限", description: "不允许禁用当前登录账号。", color: "warning" });
        return;
      }
      const res = await updateUser({
        id: Number(userForm.id),
        userName: trimmedUsername,
        nickName: trimmedName,
        phonenumber: userForm.phonenumber.trim(),
        status: userForm.enabled ? "0" : "1"
      });
      if (res && res.code === 200) {
        addToast({ title: "用户更新成功", description: `已更新用户 ${trimmedUsername} 的资料。`, color: "success" });
        loadUserList();
        handleCloseUserForm();
      }
    }
  };

  /**
   * 删除单个用户
   */
  const handleDeleteUser = async (user: SysUser) => {
    const confirmed = window.confirm(`确定要删除用户 ${user.userName} 吗？此操作需谨慎。`);
    if (!confirmed) return;

    const res = await deleteUser(String(user.id));
    if (res && res.code === 200) {
      addToast({ title: "用户删除成功", description: `已删除用户 ${user.userName}。`, color: "success" });
      loadUserList();
      setSelectedIds(prev => prev.filter(id => id !== String(user.id)));
    }
  };

  /**
   * 批量删除用户
   */
  const handleBatchDelete = async () => {
    if (!hasSelection) return;
    const confirmed = window.confirm(`确定要删除选中的 ${selectedIds.length} 个用户吗？`);
    if (!confirmed) return;

    const res = await batchDeleteUsers(selectedIds);
    if (res && res.code === 200) {
      addToast({ title: "批量删除成功", description: `已成功删除 ${selectedIds.length} 个用户。`, color: "success" });
      setSelectedIds([]);
      loadUserList();
    }
  };

  /**
   * 切换用户状态
   */
  const handleToggleStatus = async (user: SysUser) => {
    if (String(user.id) === currentUserId) {
      addToast({ title: "操作受限", description: "不允许调整当前登录账号的状态。", color: "warning" });
      return;
    }
    const nextStatus = user.status === "0" ? "1" : "0";
    const res = await toggleUserStatus(String(user.id), nextStatus);
    if (res && res.code === 200) {
      addToast({ title: "状态更新成功", description: `用户 ${user.userName} 已${nextStatus === "0" ? "启用" : "禁用"}。`, color: "success" });
      loadUserList();
    }
  };

  /**
   * 重置用户密码
   */
  const handleResetPwd = async (user: SysUser) => {
    const confirmed = window.confirm(`确定要重置用户 ${user.userName} 的密码吗？`);
    if (!confirmed) return;

    const res = await resetPassword(String(user.id));
    if (res && res.code === 200) {
      addToast({ title: "密码重置成功", description: `用户 ${user.userName} 的密码已重置为初始密码。`, color: "success" });
    }
  };

  /**
   * 批量重置密码
   */
  const handleBatchResetPwd = async () => {
    if (!hasSelection) return;
    const confirmed = window.confirm(`确定要为选中的 ${selectedIds.length} 个用户重置密码吗？`);
    if (!confirmed) return;

    const res = await batchResetPassword(selectedIds);
    if (res && res.code === 200) {
      addToast({ title: "批量重置成功", description: `已成功重置 ${selectedIds.length} 个用户的密码。`, color: "success" });
    }
  };

  /**
   * 打开分配角色对话框
   */
  const handleOpenAssignRole = (user: SysUser) => {
    setRoleAssign({ userId: String(user.id), name: user.nickName || "", roles: [] });
  };

  const handleConfirmAssignRole = async () => {
    if (!roleAssign) return;
    const user = users.find(u => String(u.id) === roleAssign.userId);
    if (!user) return;

    const res = await updateUser({
      id: Number(user.id),
      userName: user.userName || "",
      nickName: user.nickName || "",
      phonenumber: user.phonenumber || "",
      status: user.status || "0"
    });
    if (res && res.code === 200) {
      addToast({ title: "角色分配成功", description: `已更新用户 ${roleAssign.name} 的角色配置。`, color: "success" });
      loadUserList();
      setRoleAssign(null);
    }
  };

  /**
   * 批量导入操作（占位）
   */
  const handleBatchImport = () => {
    addToast({ title: "批量导入", description: "已触发批量导入占位操作。", color: "primary" });
  };

  /**
   * 批量导出操作（占位）
   */
  const handleBatchExport = () => {
    addToast({ title: "导出用户", description: `已提交导出当前筛选结果的任务，共 ${total} 个用户。`, color: "primary" });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-xs text-[var(--primary-color)]">
          <span>人员管理 · 用户管理</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          管理后台用户账号与基础信息
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl">
          支持新增用户、批量导入 / 导出与重置密码，并通过多维度筛选快速定位目标账号。
        </p>
      </div>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-4 space-y-4 text-xs border-b border-[var(--border-color)]">
          {/* 第一层：搜索框，下拉框，重置筛选 */}
          <div className="flex flex-wrap items-center gap-3">
            <AdminSearchInput
              className="w-44"
              placeholder="按账号 / 姓名搜索"
              value={keyword}
              onValueChange={value => {
                setKeyword(value);
                setPage(1);
              }}
            />
            <AdminSearchInput
              className="w-40"
              placeholder="按手机号搜索"
              value={phoneKeyword}
              onValueChange={value => {
                setPhoneKeyword(value);
                setPage(1);
              }}
            />
            <AdminSelect
              aria-label="角色筛选"
              size="sm"
              className="w-40"
              selectedKeys={[roleFilter]}
              onSelectionChange={keys => {
                const key = Array.from(keys)[0];
                setRoleFilter(key ? String(key) : "all");
                setPage(1);
              }}
              items={[
                { label: "全部角色", value: "all" },
                { label: "管理员", value: "admin" },
                { label: "普通用户", value: "user" }
              ]}
              isClearable
              classNames={{
                trigger: "h-8 min-h-8 text-xs"
              }}
            >
              {(item: { label: string; value: string }) => (
                <SelectItem key={item.value} className="text-xs">
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

          {/* 第二层：状态 */}
          <div className="flex items-center gap-3">
            <span className="text-[var(--text-color-secondary)]">状态：</span>
            <AdminTabs
              aria-label="用户状态筛选"
              size="sm"
              selectedKey={statusFilter}
              onSelectionChange={key => {
                const value = key as "all" | "enabled" | "disabled";
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <Tab key="all" title="全部状态" />
              <Tab key="enabled" title="启用" />
              <Tab key="disabled" title="禁用" />
            </AdminTabs>
          </div>

          {/* 第三层：其他按钮 */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="h-8 text-xs"
                startContent={<FiPlus className="text-xs" />}
                onPress={handleOpenCreateUser}
              >
                新增用户
              </Button>
              <Button
                size="sm"
                variant="light"
                className="h-8 text-xs"
                startContent={<FiUpload className="text-xs" />}
                onPress={handleBatchImport}
              >
                批量导入
              </Button>
              <Button
                size="sm"
                variant="light"
                className="h-8 text-xs"
                startContent={<FiDownload className="text-xs" />}
                onPress={handleBatchExport}
              >
                导出用户
              </Button>
              <Button
                size="sm"
                variant="flat"
                className="h-8 text-xs"
                startContent={<FiKey className="text-xs" />}
                disabled={!hasSelection}
                onPress={handleBatchResetPwd}
              >
                批量重置密码
              </Button>
              <Button
                size="sm"
                color="danger"
                variant="flat"
                className="h-8 text-xs"
                startContent={<FiTrash2 className="text-xs" />}
                disabled={!hasSelection}
                onPress={handleBatchDelete}
              >
                批量删除
              </Button>
            </div>
            <div className="text-xs text-[var(--text-color-secondary)]">
              <span>当前为示例数据，后续可与实际用户中心与权限系统对接。</span>
            </div>
          </div>
        </div>

        <div className="p-3">
          <div className="overflow-auto border border-[var(--border-color)] rounded-lg">
            <Table
              aria-label="用户列表"
              className="min-w-full text-xs"
              selectionMode="multiple"
              selectedKeys={selectedIds.length ? new Set(selectedIds) : new Set()}
              onSelectionChange={handleTableSelectionChange}
            >
              <TableHeader className="bg-[var(--bg-elevated)]/80">
                <TableColumn className="px-3 py-2 text-left font-medium">
                  账号
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  姓名
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  手机号
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  角色
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  状态
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  创建时间
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  操作
                </TableColumn>
              </TableHeader>
              <TableBody
                items={users}
                emptyContent={isLoading ? " " : "未找到匹配的用户账号，可调整筛选条件后重试。"}
                loadingContent={<Loading />}
                isLoading={isLoading}
              >
                {user => {
                  const enabled = user.status === "0";
                  return (
                    <TableRow
                      key={user.id}
                      className="border-t border-[var(--border-color)] hover:bg-[var(--bg-elevated)]/60"
                    >
                      <TableCell className="px-3 py-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono break-all">
                            {user.userName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <span>{user.nickName}</span>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <span>{user.phonenumber}</span>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <span>-</span>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Chip
                            size="sm"
                            variant="flat"
                            className="text-xs"
                            color={enabled ? "success" : "danger"}
                          >
                            {enabled ? "启用" : "禁用"}
                          </Chip>
                          <Switch
                            size="sm"
                            isSelected={enabled}
                            onValueChange={() => handleToggleStatus(user)}
                            aria-label="切换状态"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <span>{user.createTime}</span>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <div className="flex flex-wrap gap-1.5">
                          <Button
                            size="sm"
                            variant="light"
                            className="h-7 text-xs"
                            startContent={<FiEdit2 className="text-xs" />}
                            onPress={() => handleOpenEditUser(user)}
                          >
                            编辑
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            className="h-7 text-xs"
                            startContent={<FiUserCheck className="text-xs" />}
                            onPress={() => handleOpenAssignRole(user)}
                          >
                            分配角色
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            className="h-7 text-xs"
                            startContent={<FiKey className="text-xs" />}
                            onPress={() => handleResetPwd(user)}
                          >
                            重置密码
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="light"
                            className="h-7 text-xs"
                            startContent={<FiTrash2 className="text-xs" />}
                            onPress={() => handleDeleteUser(user)}
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
                共 {total} 个用户，当前第 {page} / {totalPages} 页
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

      {userForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-[var(--radius-base)] bg-[var(--bg-elevated)] border border-[var(--border-color)] shadow-lg">
            <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="text-sm font-medium">
                {userFormMode === "create" ? "新增用户" : "编辑用户信息"}
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="h-8 w-8 text-[var(--text-color-secondary)]"
                onPress={handleCloseUserForm}
              >
                <FiX className="text-base" />
              </Button>
            </div>
            <div className="px-4 py-3 space-y-3 text-xs">
              {userFormError && (
                <div className="rounded-[var(--radius-base)] border border-red-500/60 bg-red-500/5 px-3 py-2 text-xs text-red-300">
                  {userFormError}
                </div>
              )}
              <div className="space-y-1">
                <div>账号（必填）</div>
                <AdminInput
                  value={userForm.userName}
                  onValueChange={value => handleUserFormChange({ userName: value })}
                />
              </div>
              <div className="space-y-1">
                <div>姓名（必填）</div>
                <AdminInput
                  value={userForm.nickName}
                  onValueChange={value => handleUserFormChange({ nickName: value })}
                />
              </div>
              <div className="space-y-1">
                <div>手机号</div>
                <AdminInput
                  value={userForm.phonenumber}
                  onValueChange={value => handleUserFormChange({ phonenumber: value })}
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="text-xs">启用状态</div>
                <div className="flex items-center gap-2">
                  <Switch
                    size="sm"
                    isSelected={userForm.enabled}
                    onValueChange={value => handleUserFormChange({ enabled: value })}
                  />
                  <span className="text-xs text-[var(--text-color-secondary)]">
                    {userForm.enabled ? "启用后可正常登录后台" : "禁用后无法登录后台"}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-[var(--border-color)] flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="light"
                className="h-8 text-xs"
                onPress={handleCloseUserForm}
              >
                取消
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs"
                onPress={handleSubmitUserForm}
              >
                保存
              </Button>
            </div>
          </div>
        </div>
      )}

      {roleAssign && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-[var(--radius-base)] bg-[var(--bg-elevated)] border border-[var(--border-color)] shadow-lg">
            <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="text-sm font-medium">分配角色 · {roleAssign.name}</div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="h-8 w-8 text-[var(--text-color-secondary)]"
                onPress={() => setRoleAssign(null)}
              >
                <FiX className="text-base" />
              </Button>
            </div>
            <div className="px-4 py-3 space-y-3 text-xs">
              <div className="text-xs text-[var(--text-color-secondary)]">
                选择该用户在后台系统中的角色，可同时授予多个角色，权限将按角色集合计算。
              </div>
              <div className="text-xs text-[var(--text-color-secondary)]">
                角色分配功能待完善...
              </div>
            </div>
            <div className="px-4 py-3 border-t border-[var(--border-color)] flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="light"
                className="h-8 text-xs"
                onPress={() => setRoleAssign(null)}
              >
                取消
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs"
                onPress={handleConfirmAssignRole}
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

export default UserPage;
