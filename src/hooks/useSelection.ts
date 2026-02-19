/**
 * 表格选择管理 Hook
 * @module hooks/useSelection
 * @description 提供表格多选状态管理，支持全选、单选、批量操作等功能
 */

import { useState, useCallback, useMemo } from "react";
import React from "react";

/**
 * 表格选择配置参数
 */
interface UseSelectionOptions {
  /** 初始选中的ID列表 */
  initialSelectedIds?: string[];
}

/**
 * 表格选择返回值
 */
interface UseSelectionReturn {
  /** 选中的ID列表 */
  selectedIds: string[];
  /** 设置选中的ID列表 */
  setSelectedIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  /** 是否有选中项 */
  hasSelection: boolean;
  /** 选中项数量 */
  selectedCount: number;
  /** 清空选择 */
  clearSelection: () => void;
  /**
   * 处理表格选择变更
   * @param keys 选中的key集合或"all"
   */
  handleTableSelectionChange: (keys: "all" | Set<React.Key>) => void;
  /**
   * 切换单个项的选中状态
   * @param id 目标ID
   */
  toggleSelection: (id: string) => void;
  /**
   * 检查指定ID是否被选中
   * @param id 目标ID
   */
  isSelected: (id: string) => boolean;
}

/**
 * 表格选择管理 Hook
 * @param options 选择配置参数
 * @returns 选择状态与操作方法
 * @example
 * ```tsx
 * const { selectedIds, hasSelection, handleTableSelectionChange } = useSelection();
 * 
 * <Table
 *   selectionMode="multiple"
 *   selectedKeys={new Set(selectedIds)}
 *   onSelectionChange={handleTableSelectionChange}
 * >
 * ```
 */
function useSelection(options: UseSelectionOptions = {}): UseSelectionReturn {
  const { initialSelectedIds = [] } = options;

  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);

  const hasSelection = useMemo(() => selectedIds.length > 0, [selectedIds]);
  const selectedCount = selectedIds.length;

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const handleTableSelectionChange = useCallback(
    (keys: "all" | Set<React.Key>) => {
      if (keys === "all") {
        return;
      }
      setSelectedIds(Array.from(keys).map(String));
    },
    []
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  );

  return {
    selectedIds,
    setSelectedIds,
    hasSelection,
    selectedCount,
    clearSelection,
    handleTableSelectionChange,
    toggleSelection,
    isSelected,
  };
}

export default useSelection;
export type { UseSelectionOptions, UseSelectionReturn };
