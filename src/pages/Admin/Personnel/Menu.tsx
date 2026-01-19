import React, { useMemo, useState } from "react";
import { Button, Card, Chip, Input, NumberInput, Switch, Checkbox } from "@heroui/react";
import {
  FiHome,
  FiLayers,
  FiList,
  FiMenu,
  FiMoreHorizontal,
  FiPlus,
  FiTrash2
} from "react-icons/fi";
import Tree from "rc-tree";
import "rc-tree/assets/index.css";

type MenuNode = {
  id: string;
  name: string;
  path: string;
  iconName: string;
  order: number;
  visible: boolean;
  permissionKey: string;
  parentId: string | null;
  children?: MenuNode[];
};

type IconOption = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

type RcTreeDataNode = {
  key: string;
  title: React.ReactNode;
  children?: RcTreeDataNode[];
};

const iconOptions: IconOption[] = [
  {
    id: "FiHome",
    name: "首页",
    icon: <FiHome className="w-4 h-4" />
  },
  {
    id: "FiMenu",
    name: "菜单",
    icon: <FiMenu className="w-4 h-4" />
  },
  {
    id: "FiLayers",
    name: "分组",
    icon: <FiLayers className="w-4 h-4" />
  },
  {
    id: "FiList",
    name: "列表",
    icon: <FiList className="w-4 h-4" />
  }
];

const initialMenuTree: MenuNode[] = [
  {
    id: "m_001",
    name: "仪表盘",
    path: "/admin",
    iconName: "FiHome",
    order: 1,
    visible: true,
    permissionKey: "dashboard:view",
    parentId: null,
    children: [
      {
        id: "m_001_01",
        name: "工作台",
        path: "/admin",
        iconName: "FiHome",
        order: 1,
        visible: true,
        permissionKey: "dashboard:workbench",
        parentId: "m_001"
      },
      {
        id: "m_001_02",
        name: "分析页",
        path: "/admin/analysis",
        iconName: "FiLayers",
        order: 2,
        visible: true,
        permissionKey: "dashboard:analysis",
        parentId: "m_001"
      }
    ]
  },
  {
    id: "m_002",
    name: "系统运维",
    path: "/admin/ops",
    iconName: "FiLayers",
    order: 2,
    visible: true,
    permissionKey: "ops:root",
    parentId: null,
    children: [
      {
        id: "m_002_01",
        name: "接口文档",
        path: "/admin/ops/api-doc",
        iconName: "FiList",
        order: 1,
        visible: true,
        permissionKey: "ops:apiDoc",
        parentId: "m_002"
      },
      {
        id: "m_002_02",
        name: "系统监控",
        path: "/admin/ops/system-monitor",
        iconName: "FiList",
        order: 2,
        visible: true,
        permissionKey: "ops:systemMonitor",
        parentId: "m_002"
      }
    ]
  },
  {
    id: "m_003",
    name: "人员管理",
    path: "/admin/personnel",
    iconName: "FiMenu",
    order: 3,
    visible: true,
    permissionKey: "personnel:root",
    parentId: null,
    children: [
      {
        id: "m_003_01",
        name: "用户管理",
        path: "/admin/personnel/user",
        iconName: "FiList",
        order: 1,
        visible: true,
        permissionKey: "personnel:user",
        parentId: "m_003"
      },
      {
        id: "m_003_02",
        name: "菜单管理",
        path: "/admin/personnel/menu",
        iconName: "FiList",
        order: 2,
        visible: true,
        permissionKey: "personnel:menu",
        parentId: "m_003"
      },
      {
        id: "m_003_03",
        name: "角色管理",
        path: "/admin/personnel/role",
        iconName: "FiList",
        order: 3,
        visible: true,
        permissionKey: "personnel:role",
        parentId: "m_003"
      }
    ]
  }
];

function flattenMenu(nodes: MenuNode[], depth = 0): Array<MenuNode & { depth: number }> {
  const result: Array<MenuNode & { depth: number }> = [];
  nodes
    .slice()
    .sort((a, b) => a.order - b.order)
    .forEach(node => {
      result.push({ ...node, depth });
      if (node.children && node.children.length) {
        result.push(...flattenMenu(node.children, depth + 1));
      }
    });
  return result;
}

function updateNode(
  nodes: MenuNode[],
  id: string,
  updater: (node: MenuNode) => MenuNode
): MenuNode[] {
  return nodes.map(node => {
    if (node.id === id) {
      const next = updater(node);
      if (node.children && node.children.length) {
        return { ...next, children: node.children };
      }
      return next;
    }
    if (node.children && node.children.length) {
      return {
        ...node,
        children: updateNode(node.children, id, updater)
      };
    }
    return node;
  });
}

function deleteNodes(nodes: MenuNode[], ids: string[]): MenuNode[] {
  return nodes
    .filter(node => !ids.includes(node.id))
    .map(node => {
      if (!node.children || !node.children.length) {
        return node;
      }
      const children = deleteNodes(node.children, ids);
      return { ...node, children };
    });
}

function findNode(nodes: MenuNode[], id: string): MenuNode | null {
  for (const node of nodes) {
    if (node.id === id) {
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

function findParentInfo(
  nodes: MenuNode[],
  id: string,
  parentId: string | null = null
): { parentId: string | null; index: number } | null {
  const index = nodes.findIndex(node => node.id === id);
  if (index !== -1) {
    return { parentId, index };
  }
  for (const node of nodes) {
    if (node.children && node.children.length) {
      const found = findParentInfo(node.children, id, node.id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function removeNode(
  nodes: MenuNode[],
  id: string
): { tree: MenuNode[]; removed: MenuNode | null } {
  let removed: MenuNode | null = null;
  const next = nodes
    .map(node => {
      if (node.id === id) {
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
    .filter((node): node is MenuNode => node !== null);
  return { tree: next, removed };
}

function insertNodeAt(
  nodes: MenuNode[],
  parentId: string | null,
  index: number,
  newNode: MenuNode
): MenuNode[] {
  if (parentId === null) {
    const list = [...nodes];
    const position = index < 0 ? list.length : index;
    list.splice(position, 0, newNode);
    return list;
  }
  return nodes.map(node => {
    if (node.id === parentId) {
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

function recalcOrder(nodes: MenuNode[], parentId: string | null = null): MenuNode[] {
  return nodes.map((node, index) => {
    const next: MenuNode = {
      ...node,
      parentId,
      order: index + 1
    };
    if (node.children && node.children.length) {
      next.children = recalcOrder(node.children, node.id);
    }
    return next;
  });
}

function collectNodeAndDescendants(node: MenuNode): string[] {
  const ids = [node.id];
  if (node.children && node.children.length) {
    node.children.forEach(child => {
      ids.push(...collectNodeAndDescendants(child));
    });
  }
  return ids;
}

function buildTreeData(
  nodes: MenuNode[],
  selectedIds: string[],
  toggleNodeChecked: (id: string, checked: boolean) => void
): RcTreeDataNode[] {
  return nodes
    .slice()
    .sort((a, b) => a.order - b.order)
    .map(node => ({
      key: node.id,
      title: (
        <div className="flex items-center gap-2 text-[11px] pr-2">
          <span
            className="inline-flex items-center"
            onClick={event => {
              event.stopPropagation();
            }}
          >
            <Checkbox
              isSelected={selectedIds.includes(node.id)}
              onValueChange={value => toggleNodeChecked(node.id, value)}
              size="sm"
              classNames={{
                wrapper: "mr-1 scale-90",
                label: "hidden"
              }}
            />
          </span>
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[10px]">
            {node.parentId === null ? (
              <FiMoreHorizontal className="w-3 h-3" />
            ) : (
              <FiList className="w-3 h-3" />
            )}
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

function getIconLabel(iconName: string) {
  const match = iconOptions.find(item => item.id === iconName);
  return match ? match.name : "未设置";
}

function MenuPage() {
  const [menuTree, setMenuTree] = useState<MenuNode[]>(() => initialMenuTree);
  const [activeId, setActiveId] = useState<string | null>(
    () => initialMenuTree[0]?.id ?? null
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const [iconPickerTargetId, setIconPickerTargetId] = useState<string | null>(null);

  const flatMenu = useMemo(() => flattenMenu(menuTree), [menuTree]);

  const activeNode = useMemo(
    () => (activeId ? findNode(menuTree, activeId) : null),
    [activeId, menuTree]
  );

  const handleAddRootMenu = () => {
    const nextId = `m_${(flatMenu.length + 1).toString().padStart(3, "0")}`;
    const next: MenuNode = {
      id: nextId,
      name: "新建菜单",
      path: "/admin/custom",
      iconName: "FiMenu",
      order: flatMenu.length + 1,
      visible: true,
      permissionKey: `custom:${nextId}`,
      parentId: null,
      children: []
    };
    setMenuTree(previous => [...previous, next]);
    setActiveId(next.id);
    setSelectedIds([]);
    setMessage("已新增一级菜单，实际保存逻辑待接入菜单配置接口。");
  };

  const handleAddChildMenu = () => {
    if (!activeId) {
      return;
    }
    const parent = findNode(menuTree, activeId);
    if (!parent) {
      return;
    }
    const nextId = `${parent.id}_${(parent.children?.length ?? 0) + 1}`
      .replace(/__+/g, "_")
      .replace(/_+$/, "");
    const next: MenuNode = {
      id: nextId,
      name: "新建子菜单",
      path: `${parent.path}/child`,
      iconName: "FiList",
      order: (parent.children?.length ?? 0) + 1,
      visible: true,
      permissionKey: `${parent.permissionKey}:child${(parent.children?.length ?? 0) + 1}`,
      parentId: parent.id,
      children: []
    };
    setMenuTree(previous =>
      updateNode(previous, parent.id, node => ({
        ...node,
        children: [...(node.children ?? []), next]
      }))
    );
    setActiveId(next.id);
    setSelectedIds([]);
    setMessage("已在当前菜单下新增子菜单，实际保存逻辑待接入菜单配置接口。");
  };

  const handleBatchDelete = () => {
    if (!selectedIds.length) {
      return;
    }
    const confirmed = window.confirm(
      `确定要删除选中的 ${selectedIds.length} 个菜单项吗？删除后相关权限需同步调整。`
    );
    if (!confirmed) {
      return;
    }
    setMenuTree(previous => deleteNodes(previous, selectedIds));
    setMessage(
      `已从当前配置中删除 ${selectedIds.length} 个菜单项，实际删除逻辑待接入菜单配置接口。`
    );
    if (activeId && selectedIds.includes(activeId)) {
      setActiveId(null);
    }
    setSelectedIds([]);
  };

  const handleTreeSelect = (keys: React.Key[]) => {
    const first = keys[0];
    if (typeof first === "string") {
      setActiveId(first);
    } else if (typeof first === "number") {
      setActiveId(String(first));
    }
  };

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
    setMessage("已通过拖拽调整菜单层级与排序，仅更新前端示例数据。");
  };

  const handleFieldChange = (patch: Partial<MenuNode>) => {
    if (!activeId) {
      return;
    }
    setMenuTree(previous =>
      updateNode(previous, activeId, node => ({
        ...node,
        ...patch
      }))
    );
    setMessage("已更新菜单配置，实际保存逻辑待接入菜单配置接口。");
  };

  const handleOpenIconPicker = () => {
    if (!activeId) {
      return;
    }
    setIconPickerTargetId(activeId);
  };

  const handleSelectIcon = (iconId: string) => {
    if (!iconPickerTargetId) {
      return;
    }
    setMenuTree(previous =>
      updateNode(previous, iconPickerTargetId, node => ({
        ...node,
        iconName: iconId
      }))
    );
    setMessage("已更新菜单图标配置，实际保存逻辑待接入菜单配置接口。");
    setIconPickerTargetId(null);
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
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-color-secondary)]">
              <span>已支持拖拽调整菜单层级与排序，当前仅为前端示例数据，未落库。</span>
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
              <div className="menu-tree-custom mt-1 max-h-[420px] overflow-auto rounded-md border border-[var(--border-color)] bg-[var(--bg-elevated)]/40">
                {flatMenu.length === 0 ? (
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
                        value={activeNode.name}
                        onValueChange={value => handleFieldChange({ name: value })}
                        classNames={{
                          inputWrapper: "h-8 text-xs",
                          input: "text-xs"
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <div>路由路径</div>
                      <Input
                        size="sm"
                        variant="bordered"
                        value={activeNode.path}
                        onValueChange={value => handleFieldChange({ path: value })}
                        classNames={{
                          inputWrapper: "h-8 text-xs",
                          input: "text-xs"
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <div>权限标识</div>
                      <Input
                        size="sm"
                        variant="bordered"
                        value={activeNode.permissionKey}
                        onValueChange={value => handleFieldChange({ permissionKey: value })}
                        classNames={{
                          inputWrapper: "h-8 text-xs",
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
                        value={activeNode.order}
                        minValue={1}
                        onValueChange={value =>
                          handleFieldChange({
                            order: value ?? 1
                          })
                        }
                        classNames={{
                          inputWrapper: "h-8 text-xs",
                          input: "text-xs"
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <div>图标</div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                            {activeNode.iconName === "FiHome" && (
                              <FiHome className="w-4 h-4" />
                            )}
                            {activeNode.iconName === "FiMenu" && (
                              <FiMenu className="w-4 h-4" />
                            )}
                            {activeNode.iconName === "FiLayers" && (
                              <FiLayers className="w-4 h-4" />
                            )}
                            {activeNode.iconName === "FiList" && (
                              <FiList className="w-4 h-4" />
                            )}
                            {!iconOptions.some(item => item.id === activeNode.iconName) && (
                              <FiMoreHorizontal className="w-4 h-4" />
                            )}
                          </span>
                          <span className="text-xs">{getIconLabel(activeNode.iconName)}</span>
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
                            isSelected={activeNode.visible}
                            onValueChange={value => handleFieldChange({ visible: value })}
                          />
                          <span className="text-[11px] text-[var(--text-color-secondary)]">
                            {activeNode.visible ? "在菜单中展示" : "在菜单中隐藏，仅通过路由访问"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-1 text-[11px] text-[var(--text-color-secondary)]">
                    配置变更会实时更新当前页面状态，后续可通过保存接口持久化到服务端。
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
