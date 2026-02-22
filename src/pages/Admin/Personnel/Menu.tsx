// ===== 1. 依赖导入区域 =====
import React, { useMemo, useState, useEffect } from "react";
import { Button, Card, Chip, Input, NumberInput, Switch, Checkbox, addToast } from "@heroui/react";
import * as Icons from "react-icons/fi";
import {
  FiBell,
  FiFileText,
  FiHome,
  FiLayout,
  FiLayers,
  FiList,
  FiMenu,
  FiPieChart,
  FiPlus,
  FiSave,
  FiSettings,
  FiTrash2,
  FiUsers,
  FiVideo
} from "react-icons/fi";
import Tree from "rc-tree";
import "rc-tree/assets/index.css";
import {
  type SysMenu,
  fetchAdminMenuList,
  createMenu,
  batchUpdateMenu,
  batchDeleteMenu
} from "@/api/admin/menu";
import { Loading } from "@/components/Loading";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
/**
 * 图标选项类型
 */
type IconOption = {
  /** 图标ID */
  id: string;
  /** 图标名称 */
  name: string;
  /** 图标组件 */
  icon: React.ReactNode;
};

/**
 * 树形数据节点类型
 */
type RcTreeDataNode = {
  /** 节点唯一标识 */
  key: string;
  /** 节点标题渲染 */
  title: React.ReactNode;
  /** 子节点列表 */
  children?: RcTreeDataNode[];
};

// ===== 4. 通用工具函数区域 =====
/**
 * 图标选项配置
 */
const iconOptions: IconOption[] = [
  { id: "FiHome", name: "首页", icon: <FiHome className="w-4 h-4" /> },
  { id: "FiMenu", name: "菜单", icon: <FiMenu className="w-4 h-4" /> },
  { id: "FiLayers", name: "分组", icon: <FiLayers className="w-4 h-4" /> },
  { id: "FiList", name: "列表", icon: <FiList className="w-4 h-4" /> },
  { id: "FiPieChart", name: "仪表盘", icon: <FiPieChart className="w-4 h-4" /> },
  { id: "FiLayout", name: "布局", icon: <FiLayout className="w-4 h-4" /> },
  { id: "FiUsers", name: "用户", icon: <FiUsers className="w-4 h-4" /> },
  { id: "FiSettings", name: "设置", icon: <FiSettings className="w-4 h-4" /> },
  { id: "FiVideo", name: "视频", icon: <FiVideo className="w-4 h-4" /> },
  { id: "FiFileText", name: "文档", icon: <FiFileText className="w-4 h-4" /> },
  { id: "FiBell", name: "通知", icon: <FiBell className="w-4 h-4" /> }
];

/**
 * 扁平化菜单树
 * @param nodes 菜单节点列表
 * @param depth 当前深度
 * @returns 扁平化后的带深度信息节点列表
 */
function flattenMenu(nodes: SysMenu[], depth = 0): Array<SysMenu & { depth: number }> {
  const result: Array<SysMenu & { depth: number }> = [];
  nodes
    .slice()
    .sort((a, b) => (a.order || a.orderNum || 0) - (b.order || b.orderNum || 0))
    .forEach(node => {
      result.push({ ...node, depth });
      if (node.children && node.children.length) {
        result.push(...flattenMenu(node.children, depth + 1));
      }
    });
  return result;
}

/**
 * 查找指定ID的节点
 * @param nodes 菜单节点列表
 * @param id 目标ID
 * @returns 找到的节点或null
 */
function findNode(nodes: SysMenu[], id: string): SysMenu | null {
  for (const node of nodes) {
    if (String(node.id) === id) {
      return node;
    }
    if (node.children && node.children.length) {
      const found = findNode(node.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * 查找节点的父级信息
 * @param nodes 菜单节点列表
 * @param id 目标ID
 * @param parentId 当前遍历的父级ID
 * @returns 父级ID与在父级中的索引
 */
function findParentInfo(
  nodes: SysMenu[],
  id: string,
  parentId: string | null = null
): { parentId: string | null; index: number } | null {
  const index = nodes.findIndex(node => String(node.id) === id);
  if (index !== -1) {
    return { parentId, index };
  }
  for (const node of nodes) {
    if (node.children && node.children.length) {
      const found = findParentInfo(node.children, id, String(node.id));
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * 移除指定ID的节点
 * @param nodes 菜单节点列表
 * @param id 目标ID
 * @returns 更新后的树与被移除的节点
 */
function removeNode(
  nodes: SysMenu[],
  id: string
): { tree: SysMenu[]; removed: SysMenu | null } {
  let removed: SysMenu | null = null;
  const next = nodes
    .map(node => {
      if (String(node.id) === id) {
        removed = node;
        return null;
      }
      if (node.children && node.children.length) {
        const { tree: children, removed: childRemoved } = removeNode(node.children, id);
        if (childRemoved) {
          removed = childRemoved;
        }
        return {
          ...node,
          children
        };
      }
      return node;
    })
    .filter((node): node is SysMenu => node !== null);
  return { tree: next, removed };
}

/**
 * 在指定位置插入节点
 * @param nodes 菜单节点列表
 * @param parentId 目标父级ID
 * @param index 插入索引
 * @param newNode 待插入节点
 * @returns 更新后的树
 */
function insertNodeAt(
  nodes: SysMenu[],
  parentId: string | null,
  index: number,
  newNode: SysMenu
): SysMenu[] {
  if (parentId === null) {
    const list = [...nodes];
    const position = index < 0 ? list.length : index;
    list.splice(position, 0, newNode);
    return list;
  }
  return nodes.map(node => {
    if (String(node.id) === parentId) {
      const children = node.children ? [...node.children] : [];
      const position = index < 0 ? children.length : index;
      children.splice(position, 0, newNode);
      return {
        ...node,
        children
      };
    }
    if (node.children && node.children.length) {
      const children = insertNodeAt(node.children, parentId, index, newNode);
      if (children !== node.children) {
        return {
          ...node,
          children
        };
      }
    }
    return node;
  });
}

/**
 * 重新计算节点排序
 * @param nodes 菜单节点列表
 * @param parentId 当前父级ID
 * @returns 更新后的树
 */
function recalcOrder(nodes: SysMenu[], parentId: string | null = null): SysMenu[] {
  return nodes.map((node, index) => {
    const next: SysMenu = {
      ...node,
      parentId: parentId ? Number(parentId) : undefined,
      order: index + 1
    };
    if (node.children && node.children.length) {
      next.children = recalcOrder(node.children, String(node.id));
    }
    return next;
  });
}

/**
 * 更新树中指定节点的属性
 * @param nodes 菜单节点列表
 * @param id 目标节点ID
 * @param patch 要更新的属性
 * @returns 更新后的树
 */
function updateNodeInTree(
  nodes: SysMenu[],
  id: string,
  patch: Partial<SysMenu>
): SysMenu[] {
  return nodes.map(node => {
    if (String(node.id) === id) {
      return { ...node, ...patch };
    }
    if (node.children && node.children.length) {
      return {
        ...node,
        children: updateNodeInTree(node.children, id, patch)
      };
    }
    return node;
  });
}

/**
 * 收集节点及其所有后代节点的ID
 * @param node 目标节点
 * @returns ID列表
 */
function collectNodeAndDescendants(node: SysMenu): string[] {
  const ids: string[] = [];
  ids.push(String(node.id));
  if (node.children && node.children.length) {
    node.children.forEach(child => {
      ids.push(...collectNodeAndDescendants(child));
    });
  }
  return ids;
}

/**
 * 获取图标显示文本
 * @param iconName 图标ID
 * @returns 图标名称
 */
function getIconLabel(iconName: string) {
  const match = iconOptions.find(item => item.id === iconName);
  return match ? match.name : "未设置";
}

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====
/**
 * 构建树形组件所需的数据结构
 * @param nodes 菜单节点列表
 * @param selectedIds 已选节点ID列表
 * @param toggleNodeChecked 切换勾选状态回调
 * @returns RcTreeDataNode数组
 */
function buildTreeData(
  nodes: SysMenu[],
  selectedIds: string[],
  toggleNodeChecked: (id: string, checked: boolean) => void
): RcTreeDataNode[] {
  return nodes
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(node => ({
      key: String(node.id),
      title: (
        <div className="flex items-center gap-2 text-[11px] pr-2">
          <span
            className="inline-flex items-center"
            onClick={event => {
              event.stopPropagation();
            }}
          >
            <Checkbox
              isSelected={selectedIds.includes(String(node.id))}
              onValueChange={value => toggleNodeChecked(String(node.id), value)}
              size="sm"
              aria-label={`选择菜单 ${node.name}`}
              classNames={{
                wrapper: "mr-1 scale-90",
                label: "hidden"
              }}
            />
          </span>
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[10px]">
            {(() => {
                // @ts-expect-error - iconName is a string but Icons is an object
                const Icon = Icons[node.iconName] || (node.parentId === null ? Icons.FiMoreHorizontal : Icons.FiList);
                return <Icon className="w-3 h-3" />;
              })()}
          </span>
          <span>{node.name}</span>
          <span className="text-[10px] text-[var(--text-color-secondary)]">{node.path}</span>
          <span className="ml-auto text-[10px] text-[var(--text-color-secondary)]">
            排序 {node.order}
          </span>
        </div>
      ),
      children:
        node.children && node.children.length
          ? buildTreeData(node.children, selectedIds, toggleNodeChecked)
          : undefined
    }));
}

// ===== 8. UI渲染逻辑区域 =====
/**
 * 菜单管理页面组件
 */
function MenuPage() {
  // 菜单树数据
  const [menuTree, setMenuTree] = useState<SysMenu[]>([]);
  // 加载状态
  const [isLoading, setIsLoading] = useState(true);
  // 当前激活（选中编辑）的菜单ID
  const [activeId, setActiveId] = useState<string | null>(null);
  // 批量选中的菜单ID列表
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // 提示信息文本
  const [message, setMessage] = useState("");
  // 当前正在选择图标的目标ID
  const [iconPickerTargetId, setIconPickerTargetId] = useState<string | null>(null);

  // 扁平化菜单数据，用于计算总数等
  const flatMenu = useMemo(() => flattenMenu(menuTree), [menuTree]);

  // 当前激活的菜单节点详情
  const activeNode = useMemo(
    () => (activeId ? findNode(menuTree, activeId) : null),
    [activeId, menuTree]
  );

  /**
   * 加载菜单树数据
   */
  const loadMenuTree = React.useCallback(async () => {
    const res = await fetchAdminMenuList(setIsLoading);
    if (res && res.code === 200) {
      setMenuTree(res.data);
      setActiveId(prev => {
        if (res.data.length > 0 && !prev) {
          return String(res.data[0].id);
        }
        return prev;
      });
    }
  }, []);

  // 页面加载时初始化数据
  useEffect(() => {
    const timer = setTimeout(() => {
      loadMenuTree();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadMenuTree]);

  /**
   * 新增一级根菜单
   */
  const handleAddRootMenu = async () => {
    const nextId = String(Date.now());
    const next: SysMenu = {
      id: Number(nextId),
      name: "新建菜单",
      path: "/admin/custom",
      iconName: "FiMenu",
      order: flatMenu.length + 1,
      visible: "0",
      permissionKey: `custom:${nextId}`,
      parentId: undefined,
      children: []
    };
    const res = await createMenu(next);
    if (res && res.code === 200) {
      addToast({
        title: "新增菜单成功",
        color: "success"
      });
      loadMenuTree();
      setActiveId(nextId);
    }
  };

  /**
   * 新增子菜单
   */
  const handleAddChildMenu = async () => {
    if (!activeId) {
      return;
    }
    const parent = findNode(menuTree, activeId);
    if (!parent) {
      return;
    }
    const nextId = String(Date.now());
    const next: SysMenu = {
      id: Number(nextId),
      name: "新建子菜单",
      path: `${parent.path}/child`,
      iconName: "FiList",
      order: (parent.children?.length ?? 0) + 1,
      visible: "0",
      permissionKey: `${parent.permissionKey}:child${(parent.children?.length ?? 0) + 1}`,
      parentId: parent.id,
      children: []
    };
    const res = await createMenu(next);
    if (res && res.code === 200) {
      addToast({
        title: "新增子菜单成功",
        color: "success"
      });
      loadMenuTree();
      setActiveId(nextId);
    }
  };

  /**
   * 批量删除选中的菜单
   */
  const handleBatchDelete = async () => {
    if (!selectedIds.length) {
      return;
    }
    const confirmed = window.confirm(
      `确定要删除选中的 ${selectedIds.length} 个菜单项吗？删除后相关权限需同步调整。`
    );
    if (!confirmed) {
      return;
    }
    const res = await batchDeleteMenu(selectedIds);

    if (res && res.code === 200) {
      addToast({
        title: "批量删除成功",
        color: "success"
      });
      setSelectedIds([]);
      loadMenuTree();
      if (activeId && selectedIds.includes(activeId)) {
        setActiveId(null);
      }
    }
  };

  /**
   * 处理树节点选中
   */
  const handleTreeSelect = (keys: React.Key[]) => {
    const first = keys[0];
    if (typeof first === "string") {
      setActiveId(first);
    } else if (typeof first === "number") {
      setActiveId(String(first));
    }
  };

  /**
   * 切换树节点勾选状态
   */
  const handleToggleNodeChecked = (id: string, checked: boolean) => {
    const target = findNode(menuTree, id);
    if (!target) {
      return;
    }
    const ids = collectNodeAndDescendants(target);
    setSelectedIds(previous => {
      const set = new Set(previous);
      if (checked) {
        ids.forEach(item => set.add(item));
      } else {
        ids.forEach(item => set.delete(item));
      }
      return Array.from(set);
    });
  };

  /**
   * 处理树节点拖拽放置（仅更新本地状态）
   */
  const handleTreeDrop = (info: {
    dragNode: { key: React.Key };
    node: { key: React.Key };
    dropToGap?: boolean;
    dropPosition?: number;
  }) => {
    const dragKey = String(info.dragNode.key);
    const dropKey = String(info.node.key);
    if (dragKey === dropKey) {
      return;
    }

    const { tree: withoutDrag, removed } = removeNode(menuTree, dragKey);
    if (!removed) {
      return;
    }

    let parentId: string | null;
    let index: number;

    if (!info.dropToGap) {
      parentId = dropKey;
      index = -1;
    } else {
      const parentInfo = findParentInfo(withoutDrag, dropKey);
      if (!parentInfo) {
        return;
      }
      parentId = parentInfo.parentId;
      const dropPosition = info.dropPosition ?? 0;
      index = dropPosition < 0 ? parentInfo.index : parentInfo.index + 1;
    }

    const nextTree = recalcOrder(insertNodeAt(withoutDrag, parentId, index, removed));
    setMenuTree(nextTree);
  };

  /**
   * 处理表单字段变更（仅更新本地状态）
   */
  const handleFieldChange = (patch: Partial<SysMenu>) => {
    if (!activeId) {
      return;
    }
    setMenuTree(prev => updateNodeInTree(prev, activeId, patch));
  };

  /**
   * 打开图标选择器
   */
  const handleOpenIconPicker = () => {
    if (!activeId) {
      return;
    }
    setIconPickerTargetId(activeId);
  };

  /**
   * 选择图标回调（仅更新本地状态）
   */
  const handleSelectIcon = (iconId: string) => {
    if (!iconPickerTargetId) {
      return;
    }
    setMenuTree(prev => updateNodeInTree(prev, iconPickerTargetId, { iconName: iconId }));
    setIconPickerTargetId(null);
  };

  /**
   * 保存当前菜单配置到后端
   */
  const handleSave = async () => {
    const res = await batchUpdateMenu(menuTree as Partial<SysMenu>[], setIsLoading);
    if (res && res.code === 200) {
      addToast({
        title: "配置保存成功",
        color: "success"
      });
    }
  };

  return (
    <div className="space-y-4">
      <style>{`
        .menu-tree-custom .rc-tree-node-content-wrapper {
          border-radius: 6px;
          padding: 2px 4px;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .menu-tree-custom .rc-tree-node-content-wrapper.rc-tree-node-selected {
           background-color: color-mix(in srgb, var(--primary-color) 12%, transparent) !important;
           border-color: var(--primary-color) !important;
           color: var(--primary-color) !important;
           outline: none !important;
           box-shadow: none !important;
         }
        .menu-tree-custom .rc-tree-node-content-wrapper:hover {
          background-color: color-mix(in srgb, var(--primary-color) 6%, transparent);
        }
        .menu-tree-custom .rc-tree-node-content-wrapper.rc-tree-node-selected .rc-tree-title {
           color: var(--primary-color) !important;
           font-weight: 500;
        }
        /* 移除默认的焦点轮廓 */
        .menu-tree-custom .rc-tree-node-content-wrapper:focus,
        .menu-tree-custom .rc-tree-node-content-wrapper:active {
           outline: none !important;
           box-shadow: none !important;
        }
      `}</style>
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-[11px] text-[var(--primary-color)]">
          <span>人员管理 · 菜单管理</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          配置后台菜单结构与显示规则
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl">
          通过左侧树形菜单与右侧配置表单，维护后台菜单层级、图标、排序与权限标识。
        </p>
      </div>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 space-y-3 text-xs border-b border-[var(--border-color)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="h-8 text-[11px]"
                startContent={<FiPlus className="text-[12px]" />}
                onPress={handleAddRootMenu}
              >
                新增一级菜单
              </Button>
              <Button
                size="sm"
                variant="light"
                className="h-8 text-[11px]"
                startContent={<FiPlus className="text-[12px]" />}
                disabled={!activeId}
                onPress={handleAddChildMenu}
              >
                新增子菜单
              </Button>
              <Button
                size="sm"
                color="danger"
                variant="flat"
                className="h-8 text-[11px]"
                startContent={<FiTrash2 className="text-[12px]" />}
                disabled={!selectedIds.length}
                onPress={handleBatchDelete}
              >
                批量删除
              </Button>
              <Button
                size="sm"
                color="primary"
                className="h-8 text-[11px]"
                startContent={<FiSave className="text-[12px]" />}
                onPress={handleSave}
              >
                保存配置
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-color-secondary)]">
              <span>拖拽调整菜单层级与排序后，需点击「保存配置」才会持久化到后端。</span>
            </div>
          </div>
          {message && (
            <div className="mt-1 flex items-center justify-between text-[11px] text-[var(--text-color-secondary)]">
              <span>{message}</span>
              <Button
                size="sm"
                variant="light"
                className="h-7 text-[10px]"
                onPress={() => setMessage("")}
              >
                知道了
              </Button>
            </div>
          )}
        </div>

        <div className="p-3 grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
          <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
            <div className="p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <FiMenu className="text-[13px]" />
                  <span className="text-xs font-medium">菜单树</span>
                </div>
                <Chip size="sm" variant="flat" className="text-[10px]">
                  共 {flatMenu.length} 个菜单项
                </Chip>
              </div>
              <div className="menu-tree-custom mt-1 max-h-[420px] overflow-auto rounded-md border border-[var(--border-color)] bg-[var(--bg-elevated)]/40 min-h-[100px] flex flex-col">
                {isLoading ? (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <Loading spinnerSize="sm" />
                  </div>
                ) : flatMenu.length === 0 ? (
                  <div className="px-3 py-4 text-center text-[11px] text-[var(--text-color-secondary)]">
                    当前暂无菜单项，可通过上方按钮新增一级菜单。
                  </div>
                ) : (
                  <Tree
                    selectable
                    selectedKeys={activeId ? [activeId] : []}
                    onSelect={handleTreeSelect}
                    treeData={buildTreeData(menuTree, selectedIds, handleToggleNodeChecked)}
                    draggable
                    onDrop={handleTreeDrop}
                    defaultExpandAll
                    showLine
                    showIcon={false}
                  />
                )}
              </div>
            </div>
          </Card>

          <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
            <div className="p-3 space-y-3 text-xs">
              {!activeNode ? (
                <div className="text-[11px] text-[var(--text-color-secondary)]">
                  请在左侧菜单树中选择一个菜单项后，在此处编辑其基础配置。
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1">
                        <FiLayers className="text-[13px]" />
                        <span className="text-xs font-medium">菜单配置</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-color-secondary)]">
                        为菜单「{activeNode.name}」配置名称、路由路径、图标、排序与显示规则。
                      </div>
                    </div>
                    <Chip size="sm" variant="flat" className="text-[10px]">
                      ID: {activeNode.id}
                    </Chip>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <div>菜单名称</div>
                      <Input
                        size="sm"
                        variant="bordered"
                        aria-label="菜单名称"
                        value={activeNode.name}
                        onValueChange={value => handleFieldChange({ name: value })}
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
                      <div>路由路径</div>
                      <Input
                        size="sm"
                        variant="bordered"
                        aria-label="路由路径"
                        value={activeNode.path}
                        onValueChange={value => handleFieldChange({ path: value })}
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
                      <div>权限标识</div>
                      <Input
                        size="sm"
                        variant="bordered"
                        aria-label="权限标识"
                        value={activeNode.permissionKey}
                        onValueChange={value => handleFieldChange({ permissionKey: value })}
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
                      <div className="text-[10px] text-[var(--text-color-secondary)]">
                        默认由模块 + 功能自动生成，可按需手动调整。
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span>排序值</span>
                        <span className="text-[10px] text-[var(--text-color-secondary)]">
                          数值越小越靠前
                        </span>
                      </div>
                      <NumberInput
                        size="sm"
                        variant="bordered"
                        aria-label="排序值"
                        value={activeNode.order}
                        minValue={1}
                        onValueChange={value =>
                          handleFieldChange({
                            order: value ?? 1
                          })
                        }
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
                      <div>图标</div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                              {(() => {
                                 // @ts-expect-error - iconName is a string but Icons is an object
                                 const Icon = Icons[activeNode.iconName] || Icons.FiMoreHorizontal;
                                 return <Icon className="w-4 h-4" />;
                               })()}
                            </span>
                          <span className="text-xs">{getIconLabel(activeNode.iconName || activeNode.icon || "")}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="light"
                          className="h-8 text-[11px]"
                          onPress={handleOpenIconPicker}
                        >
                          选择图标
                        </Button>
                      </div>
                      <div className="text-[10px] text-[var(--text-color-secondary)]">
                        实际项目中可接入完整的内置图标库选择器。
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span>是否显示</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            size="sm"
                            aria-label="是否在菜单中显示"
                            isSelected={activeNode.visible === "0"}
                            onValueChange={value => handleFieldChange({ visible: value ? "0" : "1" })}
                          />
                          <span className="text-[11px] text-[var(--text-color-secondary)]">
                            {activeNode.visible ? "在菜单中展示" : "在菜单中隐藏，仅通过路由访问"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-1 text-[11px] text-[var(--text-color-secondary)]">
                    配置变更会实时更新当前页面状态，点击「保存配置」按钮后持久化到后端。
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </Card>

      {iconPickerTargetId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-[var(--radius-base)] bg-[var(--bg-elevated)] border border-[var(--border-color)] shadow-lg">
            <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="text-sm font-medium">选择菜单图标</div>
              <button
                type="button"
                className="text-xs text-[var(--text-color-secondary)]"
                onClick={() => setIconPickerTargetId(null)}
              >
                关闭
              </button>
            </div>
            <div className="px-4 py-3 space-y-3 text-xs">
              <div className="text-[11px] text-[var(--text-color-secondary)]">
                点击下方任意图标即可应用到当前菜单项，实际项目中可拓展为完整图标库。
              </div>
              <div className="grid grid-cols-2 gap-2">
                {iconOptions.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    className="flex items-center gap-2 rounded-[var(--radius-base)] border border-[var(--border-color)] px-3 py-2 hover:border-[var(--primary-color)] hover:bg-[color-mix(in_srgb,var(--primary-color)_8%,transparent)]"
                    onClick={() => handleSelectIcon(option.id)}
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                      {option.icon}
                    </span>
                    <span className="text-xs">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuPage;
