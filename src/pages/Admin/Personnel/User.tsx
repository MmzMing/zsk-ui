import React, { useMemo, useState } from "react";
import {
  Select,
  SelectItem,
  Button,
  Card,
  Input,
  Pagination,
  Switch,
  Checkbox,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tab,
  addToast
} from "@heroui/react";
import { AdminTabs } from "@/components/Admin/AdminTabs";
import {
  FiDownload,
  FiEdit2,
  FiKey,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUpload,
  FiUserCheck
} from "react-icons/fi";

type UserStatus = "enabled" | "disabled";

type UserItem = {
  id: string;
  username: string;
  name: string;
  phone: string;
  roles: string[];
  status: UserStatus;
  createdAt: string;
};

type UserFormState = {
  id?: string;
  username: string;
  name: string;
  phone: string;
  role: string;
  enabled: boolean;
};

type RoleAssignState = {
  userId: string;
  name: string;
  roles: string[];
};

const allRoles = ["管理员", "内容运营", "审核员", "访客"];

const initialUsers: UserItem[] = [
  {
    id: "u_001",
    username: "admin",
    name: "系统管理员",
    phone: "13800000001",
    roles: ["管理员"],
    status: "enabled",
    createdAt: "2026-01-10 09:20:11"
  },
  {
    id: "u_002",
    username: "editor",
    name: "内容编辑",
    phone: "13800000002",
    roles: ["内容运营"],
    status: "enabled",
    createdAt: "2026-01-11 14:32:45"
  },
  {
    id: "u_003",
    username: "auditor",
    name: "审核员",
    phone: "13800000003",
    roles: ["审核员"],
    status: "disabled",
    createdAt: "2026-01-12 16:05:30"
  },
  {
    id: "u_004",
    username: "guest001",
    name: "访客用户",
    phone: "13800000004",
    roles: ["访客"],
    status: "enabled",
    createdAt: "2026-01-15 10:12:09"
  }
];

function createEmptyUserForm(): UserFormState {
  return {
    username: "",
    name: "",
    phone: "",
    role: allRoles[0] ?? "",
    enabled: true
  };
}

function UserPage() {
  const [users, setUsers] = useState<UserItem[]>(() => initialUsers);
  const [keyword, setKeyword] = useState("");
  const [phoneKeyword, setPhoneKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "enabled" | "disabled">("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [userForm, setUserForm] = useState<UserFormState | null>(null);
  const [userFormMode, setUserFormMode] = useState<"create" | "edit">("create");
  const [userFormError, setUserFormError] = useState("");

  const [roleAssign, setRoleAssign] = useState<RoleAssignState | null>(null);

  const hasSelection = selectedIds.length > 0;

  const filteredUsers = useMemo(() => {
    const nameKeyword = keyword.trim().toLowerCase();
    const phoneValue = phoneKeyword.trim();
    return users.filter(item => {
      if (nameKeyword) {
        const text = `${item.username} ${item.name}`.toLowerCase();
        if (!text.includes(nameKeyword)) {
          return false;
        }
      }
      if (phoneValue && !item.phone.includes(phoneValue)) {
        return false;
      }
      if (roleFilter !== "all" && !item.roles.includes(roleFilter)) {
        return false;
      }
      if (statusFilter === "enabled" && item.status !== "enabled") {
        return false;
      }
      if (statusFilter === "disabled" && item.status !== "disabled") {
        return false;
      }
      return true;
    });
  }, [users, keyword, phoneKeyword, roleFilter, statusFilter]);

  const total = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageItems = filteredUsers.slice(startIndex, endIndex);
  const handleTableSelectionChange = (keys: "all" | Set<React.Key>) => {
    if (keys === "all") {
      setSelectedIds(pageItems.map(item => item.id));
      return;
    }
    setSelectedIds(Array.from(keys).map(String));
  };

  const handleResetFilter = () => {
    setKeyword("");
    setPhoneKeyword("");
    setRoleFilter("all");
    setStatusFilter("all");
    setPage(1);
    setSelectedIds([]);
  };

  const handleOpenCreateUser = () => {
    setUserForm(createEmptyUserForm());
    setUserFormMode("create");
    setUserFormError("");
  };

  const handleOpenEditUser = (user: UserItem) => {
    setUserForm({
      id: user.id,
      username: user.username,
      name: user.name,
      phone: user.phone,
      role: user.roles[0] ?? allRoles[0] ?? "",
      enabled: user.status === "enabled"
    });
    setUserFormMode("edit");
    setUserFormError("");
  };

  const handleUserFormChange = (patch: Partial<UserFormState>) => {
    setUserForm(previous => {
      if (!previous) {
        return previous;
      }
      return { ...previous, ...patch };
    });
  };

  const handleCloseUserForm = () => {
    setUserForm(null);
    setUserFormError("");
  };

  const handleSubmitUserForm = () => {
    if (!userForm) {
      return;
    }
    const trimmedUsername = userForm.username.trim();
    const trimmedName = userForm.name.trim();
    if (!trimmedUsername || !trimmedName) {
      setUserFormError("账号与姓名为必填项，请补充完整后再提交。");
      return;
    }
    const exists = users.some(item => item.username === trimmedUsername && item.id !== userForm.id);
    if (exists) {
      setUserFormError("账号已存在，请更换一个唯一的账号标识。");
      return;
    }
    if (userFormMode === "create") {
      const nextId = `u_${(users.length + 1).toString().padStart(3, "0")}`;
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
      const nextUser: UserItem = {
        id: nextId,
        username: trimmedUsername,
        name: trimmedName,
        phone: userForm.phone.trim(),
        roles: userForm.role ? [userForm.role] : [],
        status: userForm.enabled ? "enabled" : "disabled",
        createdAt
      };
      setUsers(previous => [nextUser, ...previous]);
      addToast({
        title: "用户新增成功",
        description: `已新增用户 ${nextUser.username}，实际保存逻辑待接入用户接口。`,
        color: "success"
      });
    } else {
      setUsers(previous =>
        previous.map(item =>
          item.id === userForm.id
            ? {
                ...item,
                username: trimmedUsername,
                name: trimmedName,
                phone: userForm.phone.trim(),
                roles: userForm.role ? [userForm.role] : [],
                status: userForm.enabled ? "enabled" : "disabled"
              }
            : item
        )
      );
      addToast({
        title: "用户更新成功",
        description: `已更新用户 ${trimmedUsername} 的资料，实际保存逻辑待接入用户接口。`,
        color: "success"
      });
    }
    setUserForm(null);
    setUserFormError("");
  };

  const handleToggleStatus = (user: UserItem) => {
    setUsers(previous =>
      previous.map(item =>
        item.id === user.id
          ? { ...item, status: item.status === "enabled" ? "disabled" : "enabled" }
          : item
      )
    );
    addToast({
      title: "状态切换成功",
      description: `已切换用户 ${user.username} 的启用状态，实际保存逻辑待接入用户接口。`,
      color: "success"
    });
  };

  const handleDeleteUser = (user: UserItem) => {
    const confirmed = window.confirm(`确定要删除用户 ${user.username} 吗？此操作需谨慎。`);
    if (!confirmed) {
      return;
    }
    setUsers(previous => previous.filter(item => item.id !== user.id));
    setSelectedIds(previous => previous.filter(id => id !== user.id));
    addToast({
      title: "用户删除成功",
      description: `已从当前列表中删除用户 ${user.username}，实际删除逻辑待接入用户接口。`,
      color: "success"
    });
  };

  const handleOpenAssignRole = (user: UserItem) => {
    setRoleAssign({
      userId: user.id,
      name: user.name,
      roles: [...user.roles]
    });
  };

  const handleConfirmAssignRole = () => {
    if (!roleAssign) {
      return;
    }
    setUsers(previous =>
      previous.map(item =>
        item.id === roleAssign.userId ? { ...item, roles: [...roleAssign.roles] } : item
      )
    );
    addToast({
      title: "角色分配成功",
      description: `已更新用户 ${roleAssign.name} 的角色配置，实际保存逻辑待接入角色分配接口。`,
      color: "success"
    });
    setRoleAssign(null);
  };

  const handleBatchResetPassword = () => {
    if (!hasSelection) {
      return;
    }
    const confirmed = window.confirm(
      `确定要为选中的 ${selectedIds.length} 个用户重置登录密码吗？`
    );
    if (!confirmed) {
      return;
    }
    addToast({
      title: "批量重置密码",
      description: `已提交批量重置密码任务，共 ${selectedIds.length} 个用户，实际逻辑待接入重置密码接口。`,
      color: "primary"
    });
  };

  const handleSingleResetPassword = (user: UserItem) => {
    const confirmed = window.confirm(
      `确定要重置用户 ${user.username} 的登录密码吗？`
    );
    if (!confirmed) {
      return;
    }
    addToast({
      title: "重置密码",
      description: `已提交用户 ${user.username} 的密码重置任务，实际逻辑待接入重置密码接口。`,
      color: "primary"
    });
  };

  const handleBatchDeleteUsers = () => {
    if (!hasSelection) {
      return;
    }
    const confirmed = window.confirm(
      `确定要删除选中的 ${selectedIds.length} 个用户吗？此操作建议仅在测试环境使用。`
    );
    if (!confirmed) {
      return;
    }
    setUsers(previous => previous.filter(item => !selectedIds.includes(item.id)));
    addToast({
      title: "批量删除成功",
      description: `已从当前列表中删除 ${selectedIds.length} 个用户，实际删除逻辑待接入用户接口。`,
      color: "success"
    });
    setSelectedIds([]);
  };

  const handleBatchImport = () => {
    addToast({
      title: "批量导入",
      description: "已触发批量导入占位操作，实际需通过上传文件并解析后调用 /api/admin/user/import 接口。",
      color: "primary"
    });
  };

  const handleBatchExport = () => {
    addToast({
      title: "导出用户",
      description: `已提交导出当前筛选结果的任务，共 ${total} 个用户，实际导出逻辑待接入 /api/admin/user/export 接口。`,
      color: "primary"
    });
  };

  const handlePageChange = (next: number) => {
    if (next < 1 || next > totalPages) {
      return;
    }
    setPage(next);
    setSelectedIds([]);
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
        <div className="p-3 space-y-3 text-xs border-b border-[var(--border-color)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
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
                onPress={handleBatchResetPassword}
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
                onPress={handleBatchDeleteUsers}
              >
                批量删除
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Input
                size="sm"
                variant="bordered"
                className="w-44"
                placeholder="按账号 / 姓名搜索"
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
              <Input
                size="sm"
                variant="bordered"
                className="w-40"
                placeholder="按手机号搜索"
                value={phoneKeyword}
                onValueChange={value => {
                  setPhoneKeyword(value);
                  setPage(1);
                }}
                classNames={{
                  inputWrapper: "h-8 text-xs",
                  input: "text-xs"
                }}
              />
              <Select
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
                  ...allRoles.map(role => ({ label: role, value: role }))
                ]}
                isClearable
              >
                {item => (
                  <SelectItem key={item.value}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
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
              <Button
                size="sm"
                variant="light"
                className="h-8 text-xs"
                onPress={handleResetFilter}
              >
                重置筛选
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-color-secondary)]">
            <span>当前为示例数据，后续可与实际用户中心与权限系统对接。</span>
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
                items={pageItems}
                emptyContent="未找到匹配的用户账号，可调整筛选条件后重试。"
              >
                {user => {
                  const enabled = user.status === "enabled";
                  return (
                    <TableRow
                      key={user.id}
                      className="border-t border-[var(--border-color)] hover:bg-[var(--bg-elevated)]/60"
                    >
                      <TableCell className="px-3 py-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-xs break-all">
                            {user.username}
                          </span>
                          <span className="text-xs text-[var(--text-color-secondary)]">
                            ID: {user.id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <span>{user.name}</span>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <span>{user.phone}</span>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <span>{user.roles.join("、") || "-"}</span>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            size="sm"
                            isSelected={enabled}
                            onValueChange={() => handleToggleStatus(user)}
                          />
                          <span className="text-xs text-[var(--text-color-secondary)]">
                            {enabled ? "启用" : "禁用"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <span>{user.createdAt}</span>
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
                            onPress={() => handleSingleResetPassword(user)}
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
                共 {total} 个用户，当前第 {currentPage} / {totalPages} 页
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
          <div className="mt-1 flex flex-col gap-1 text-xs text-[var(--text-color-secondary)]">
            <span>列表支持按账号、姓名、手机号、角色与状态组合筛选，便于快速定位目标用户。</span>
            <span>当前分页与筛选条件可用于拼接服务端用户列表查询接口的请求参数。</span>
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
              <button
                type="button"
                className="text-xs text-[var(--text-color-secondary)]"
                onClick={handleCloseUserForm}
              >
                关闭
              </button>
            </div>
            <div className="px-4 py-3 space-y-3 text-xs">
              {userFormError && (
                <div className="rounded-[var(--radius-base)] border border-red-500/60 bg-red-500/5 px-3 py-2 text-xs text-red-300">
                  {userFormError}
                </div>
              )}
              <div className="space-y-1">
                <div>账号（必填）</div>
                <Input
                  size="sm"
                  variant="bordered"
                  value={userForm.username}
                  onValueChange={value => handleUserFormChange({ username: value })}
                  classNames={{
                    inputWrapper: "h-8 text-xs",
                    input: "text-xs"
                  }}
                />
              </div>
              <div className="space-y-1">
                <div>姓名（必填）</div>
                <Input
                  size="sm"
                  variant="bordered"
                  value={userForm.name}
                  onValueChange={value => handleUserFormChange({ name: value })}
                  classNames={{
                    inputWrapper: "h-8 text-xs",
                    input: "text-xs"
                  }}
                />
              </div>
              <div className="space-y-1">
                <div>手机号</div>
                <Input
                  size="sm"
                  variant="bordered"
                  value={userForm.phone}
                  onValueChange={value => handleUserFormChange({ phone: value })}
                  classNames={{
                    inputWrapper: "h-8 text-xs",
                    input: "text-xs"
                  }}
                />
              </div>
              <div className="space-y-1">
                <div>角色</div>
                <Select
                  aria-label="用户角色"
                  size="sm"
                  selectedKeys={userForm.role ? [userForm.role] : []}
                  onSelectionChange={keys => {
                    const key = Array.from(keys)[0];
                    if (key) {
                      handleUserFormChange({ role: String(key) });
                    }
                  }}
                  items={allRoles.map(role => ({
                    label: role,
                    value: role
                  }))}
                  className="w-full"
                >
                  {item => (
                    <SelectItem key={item.value}>
                      {item.label}
                    </SelectItem>
                  )}
                </Select>
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
              <button
                type="button"
                className="text-xs text-[var(--text-color-secondary)]"
                onClick={() => setRoleAssign(null)}
              >
                关闭
              </button>
            </div>
            <div className="px-4 py-3 space-y-3 text-xs">
              <div className="text-xs text-[var(--text-color-secondary)]">
                选择该用户在后台系统中的角色，可同时授予多个角色，权限将按角色集合计算。
              </div>
              <div className="space-y-2">
                {allRoles.map(role => (
                  <Checkbox
                    key={role}
                    isSelected={roleAssign.roles.includes(role)}
                    onValueChange={selected => {
                      setRoleAssign(previous => {
                        if (!previous) {
                          return previous;
                        }
                        if (selected) {
                          return {
                            ...previous,
                            roles: [...previous.roles, role]
                          };
                        }
                        return {
                          ...previous,
                          roles: previous.roles.filter(item => item !== role)
                        };
                      });
                    }}
                    className="text-xs"
                  >
                    {role}
                  </Checkbox>
                ))}
              </div>
              <div className="text-xs text-[var(--text-color-secondary)]" />
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
