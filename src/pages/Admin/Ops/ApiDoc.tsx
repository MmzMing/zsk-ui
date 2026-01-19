import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  Chip,
  Input,
  Tab,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Textarea
} from "@heroui/react";
import { AdminTabs } from "@/components/Admin/AdminTabs";
import { FiSearch, FiFileText, FiDownload, FiLink, FiChevronDown, FiCopy, FiChevronUp } from "react-icons/fi";

type ApiCategory = {
  id: string;
  name: string;
  children: ApiItem[];
};

type ApiItem = {
  id: string;
  name: string;
  method: "GET" | "POST";
  path: string;
  status: "enabled" | "disabled";
  owner: string;
  description?: string;
  tag?: string;
};

const apiTreeData: ApiCategory[] = [
  {
    id: "dashboard",
    name: "仪表盘相关",
    children: [
      {
        id: "dashboard-overview",
        name: "获取仪表盘核心指标",
        method: "GET",
        path: "/api/admin/dashboard/overview",
        status: "enabled",
        owner: "admin"
      },
      {
        id: "dashboard-traffic",
        name: "获取访问结构柱状图数据",
        method: "GET",
        path: "/api/admin/dashboard/traffic",
        status: "enabled",
        owner: "admin"
      }
    ]
  },
  {
    id: "content",
    name: "内容管理",
    children: [
      {
        id: "content-doc-list",
        name: "获取文档列表",
        method: "GET",
        path: "/api/admin/content/docs",
        status: "enabled",
        owner: "editor"
      },
      {
        id: "content-doc-create",
        name: "创建文档",
        method: "POST",
        path: "/api/admin/content/docs",
        status: "enabled",
        owner: "editor"
      }
    ]
  }
];

function ApiDocPage() {
  const [keyword, setKeyword] = useState("");
  const [activeApiId, setActiveApiId] = useState("dashboard-overview");
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>(() =>
    apiTreeData.map(category => category.id)
  );
  const [debugBody, setDebugBody] = useState<string>(() => `{
  "range": "7d"
}`);
  const [debugResponse, setDebugResponse] = useState<string>(() => `{
  "code": 0,
  "msg": "mock only",
  "data": null
}`);
  const [debugLoading, setDebugLoading] = useState(false);

  const flatApiList = useMemo(
    () =>
      apiTreeData.flatMap(category =>
        category.children.map(item => ({
          categoryId: category.id,
          categoryName: category.name,
          item
        }))
      ),
    []
  );

  const filteredTree = useMemo(() => {
    if (!keyword.trim()) {
      return apiTreeData;
    }
    const lower = keyword.toLowerCase();
    return apiTreeData
      .map(category => {
        const children = category.children.filter(item => {
          const text = `${item.name} ${item.path} ${item.method}`.toLowerCase();
          return text.includes(lower);
        });
        return { ...category, children };
      })
      .filter(category => category.children.length > 0);
  }, [keyword]);

  const activeApi = useMemo(() => {
    const found = flatApiList.find(item => item.item.id === activeApiId);
    if (found) {
      return found;
    }
    return flatApiList[0] ?? null;
  }, [flatApiList, activeApiId]);

  const renderMethodChip = (method: ApiItem["method"]) => {
    const color = method === "GET" ? "success" : "warning";
    return (
      <Chip size="sm" color={color} variant="flat" className="text-xs">
        {method}
      </Chip>
    );
  };

  const renderStatusChip = (status: ApiItem["status"]) => {
    if (status === "enabled") {
      return (
        <Chip size="sm" color="success" variant="dot" className="text-xs">
          启用
        </Chip>
      );
    }
    return (
      <Chip size="sm" color="default" variant="flat" className="text-xs">
        禁用
      </Chip>
    );
  };

  const handleToggleExpandAll = () => {
    if (expandedCategoryIds.length === apiTreeData.length) {
      setExpandedCategoryIds([]);
    } else {
      setExpandedCategoryIds(apiTreeData.map(category => category.id));
    }
  };

  const handleCategoryToggle = (id: string) => {
    setExpandedCategoryIds(previous =>
      previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]
    );
  };

  const handlePresetApply = (type: string) => {
    if (type === "today") {
      setDebugBody(`{
  "range": "1d"
}`);
      return;
    }
    if (type === "7d") {
      setDebugBody(`{
  "range": "7d"
}`);
      return;
    }
    setDebugBody(`{
  "range": "30d"
}`);
  };

  const handleCopyResponse = () => {
    try {
      window.navigator.clipboard.writeText(debugResponse);
    } catch {
      setDebugResponse(previous => previous);
    }
  };

  const handleDebugSend = () => {
    setDebugLoading(true);
    window.setTimeout(() => {
      const now = new Date().toISOString();
      setDebugResponse(`{
  "code": 0,
  "msg": "mock success",
  "data": {
    "echoedBody": ${debugBody || "{}"},
    "debugTime": "${now}"
  }
}`);
      setDebugLoading(false);
    }, 600);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-xs text-[var(--primary-color)]">
            <FiFileText className="text-xs" />
            <span>系统运维 · 接口文档中心</span>
          </div>
          <h1 className="text-lg md:text-xl font-semibold tracking-tight">
            按模块集中管理后台接口说明
          </h1>
          <p className="text-xs text-[var(--text-color-secondary)]">
            支持按模块浏览接口、查看详细请求参数与响应示例，为前后端联调与长期维护提供统一入口。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            size="sm"
            variant="bordered"
            placeholder="按名称 / 路径搜索接口"
            startContent={<FiSearch className="text-xs text-[var(--text-color-secondary)]" />}
            value={keyword}
            onValueChange={setKeyword}
            classNames={{
              inputWrapper: "h-8",
              input: "text-xs"
            }}
          />
          <Button
            size="sm"
            variant="bordered"
            startContent={<FiDownload className="text-xs" />}
            className="text-xs"
          >
            导出文档
          </Button>
          <Button
            size="sm"
            variant="light"
            className="text-xs"
            onPress={handleToggleExpandAll}
          >
            {expandedCategoryIds.length === apiTreeData.length ? "折叠全部" : "展开全部"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] h-[calc(100vh-220px)]">
        <Card className="h-full border border-[var(--border-color)] bg-[var(--bg-elevated)]/95 overflow-hidden">
          <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between">
            <div className="text-xs font-medium">接口分类树</div>
            <Chip size="sm" variant="flat" className="text-xs">
              共 {flatApiList.length} 个接口
            </Chip>
          </div>
          <div className="h-full overflow-auto p-2 space-y-2 text-xs">
            {filteredTree.map(category => {
              const isExpanded = expandedCategoryIds.includes(category.id);
              return (
                <div key={category.id} className="space-y-1">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-2 py-1 rounded-md hover:bg-[var(--bg-elevated)]/80"
                    onClick={() => handleCategoryToggle(category.id)}
                  >
                    <span className="text-xs font-medium text-[var(--text-color-secondary)]">
                      {category.name}
                    </span>
                    {isExpanded ? (
                      <FiChevronUp className="text-xs text-[var(--text-color-secondary)]" />
                    ) : (
                      <FiChevronDown className="text-xs text-[var(--text-color-secondary)]" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="space-y-1">
                      {category.children.map(item => (
                        <button
                          key={item.id}
                          type="button"
                          className={
                            "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-left transition-colors " +
                            (activeApi?.item.id === item.id
                              ? "bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] text-[var(--primary-color)]"
                              : "text-[var(--text-color-secondary)] hover:bg-[var(--bg-elevated)]/90")
                          }
                          onClick={() => setActiveApiId(item.id)}
                        >
                          {renderMethodChip(item.method)}
                          <span className="flex-1 truncate">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="h-full border border-[var(--border-color)] bg-[var(--bg-elevated)]/95 overflow-hidden">
          <div className="p-4 border-b border-[var(--border-color)] flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {activeApi && renderMethodChip(activeApi.item.method)}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {activeApi?.item.name ?? "请选择接口"}
                  </span>
                  {activeApi && renderStatusChip(activeApi.item.status)}
                </div>
                <div className="text-xs text-[var(--text-color-secondary)] flex items-center gap-1">
                  <FiLink className="text-xs" />
                  <span className="truncate">{activeApi?.item.path}</span>
                  {activeApi && (
                    <span className="ml-2">
                      负责人：{activeApi.item.owner}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Chip size="sm" variant="flat" className="text-xs">
                在线调试面板仅示例交互
              </Chip>
            </div>
          </div>

          <div className="h-[calc(100%-76px)]">
            <AdminTabs
              aria-label="接口详情"
              size="sm"
              className="px-4 pt-1"
            >
              <Tab key="basic" title="基本信息">
                <div className="p-4 space-y-3 text-xs">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="space-y-1">
                      <div className="text-[var(--text-color-secondary)]">
                        接口名称
                      </div>
                      <div>{activeApi?.item.name}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[var(--text-color-secondary)]">
                        接口路径
                      </div>
                      <div>{activeApi?.item.path}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[var(--text-color-secondary)]">
                        请求方式
                      </div>
                      <div>{activeApi?.item.method}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[var(--text-color-secondary)]">
                        负责人
                      </div>
                      <div>{activeApi?.item.owner}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[var(--text-color-secondary)]">
                      状态说明
                    </div>
                    <div>
                      启用表示接口已对外开放并可正常调用，禁用表示接口暂不可用或处于预留状态。
                    </div>
                  </div>
                </div>
              </Tab>
              <Tab key="request" title="请求参数">
                <div className="p-4 space-y-3 text-xs">
                  <div className="text-[var(--text-color-secondary)]">
                    示例参数定义，仅用于前端占位演示，后续将与后端实际字段对齐。
                  </div>
                  <div className="overflow-auto border border-[var(--border-color)] rounded-lg">
                    <Table
                      aria-label="请求参数示例"
                      className="min-w-full text-xs"
                    >
                      <TableHeader className="bg-[var(--bg-elevated)]/80">
                        <TableColumn className="px-3 py-2 text-left font-medium">
                          参数名
                        </TableColumn>
                        <TableColumn className="px-3 py-2 text-left font-medium">
                          类型
                        </TableColumn>
                        <TableColumn className="px-3 py-2 text-left font-medium">
                          是否必填
                        </TableColumn>
                        <TableColumn className="px-3 py-2 text-left font-medium">
                          说明
                        </TableColumn>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="border-t border-[var(--border-color)]" key="range">
                          <TableCell className="px-3 py-2">range</TableCell>
                          <TableCell className="px-3 py-2">string</TableCell>
                          <TableCell className="px-3 py-2">否</TableCell>
                          <TableCell className="px-3 py-2">
                            时间范围，如 7d、30d，具体规则见接口 TODO 文档。
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-t border-[var(--border-color)]" key="page">
                          <TableCell className="px-3 py-2">page</TableCell>
                          <TableCell className="px-3 py-2">number</TableCell>
                          <TableCell className="px-3 py-2">否</TableCell>
                          <TableCell className="px-3 py-2">
                            分页页码，从 1 开始。
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-t border-[var(--border-color)]" key="pageSize">
                          <TableCell className="px-3 py-2">pageSize</TableCell>
                          <TableCell className="px-3 py-2">number</TableCell>
                          <TableCell className="px-3 py-2">否</TableCell>
                          <TableCell className="px-3 py-2">
                            分页大小，建议在 10 - 50 之间选择。
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </Tab>
              <Tab key="response" title="响应示例">
                <div className="p-4 space-y-3 text-xs">
                  <div className="text-[var(--text-color-secondary)]">
                    下方为示意性响应示例，格式与项目约定的统一响应结构保持一致。
                  </div>
                  <div className="border border-[var(--border-color)] rounded-lg overflow-hidden">
                    <div className="px-3 py-2 flex items-center justify-between bg-[var(--bg-elevated)]/80">
                      <span className="text-xs text-[var(--text-color-secondary)]">
                        统一响应结构示例
                      </span>
                      <Button
                        size="sm"
                        variant="light"
                        className="text-xs px-2 h-7"
                        startContent={<FiCopy className="text-xs" />}
                        onPress={handleCopyResponse}
                      >
                        复制示例
                      </Button>
                    </div>
                    <pre className="text-xs bg-[var(--bg-elevated)]/80 p-3 overflow-auto">
{`{
  "code": 0,
  "msg": "ok",
  "data": { }
}`}
                    </pre>
                  </div>
                </div>
              </Tab>
              <Tab key="debug" title="在线调试">
                <div className="p-4 space-y-3 text-xs">
                  <div className="grid gap-3 md:grid-cols-[minmax(0,3fr)_minmax(0,4fr)]">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="text-[var(--text-color-secondary)]">
                          请求地址
                        </div>
                        <Input
                          size="sm"
                          variant="bordered"
                          value={activeApi?.item.path ?? ""}
                          startContent={
                            activeApi && renderMethodChip(activeApi.item.method)
                          }
                          classNames={{
                            inputWrapper: "h-8",
                            input: "text-xs"
                          }}
                          isReadOnly
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="text-[var(--text-color-secondary)]">
                          请求体示例
                        </div>
                        <Textarea
                          size="sm"
                          variant="bordered"
                          value={debugBody}
                          onValueChange={setDebugBody}
                          minRows={6}
                          classNames={{
                            inputWrapper:
                              "h-40 text-xs bg-[var(--bg-elevated)]/80 border-[var(--border-color)]",
                            input: "text-xs"
                          }}
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-[var(--text-color-secondary)]">
                            参数预设：
                          </span>
                          <Button
                            size="sm"
                            variant="light"
                            className="text-xs h-7"
                            onPress={() => handlePresetApply("today")}
                          >
                            今日
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            className="text-xs h-7"
                            onPress={() => handlePresetApply("7d")}
                          >
                            最近 7 天
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            className="text-xs h-7"
                            onPress={() => handlePresetApply("30d")}
                          >
                            最近 30 天
                          </Button>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        color="primary"
                        className="text-xs"
                        isLoading={debugLoading}
                        onPress={handleDebugSend}
                      >
                        发送请求
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[var(--text-color-secondary)]">
                        响应结果
                      </div>
                      <div className="w-full h-56 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)]/80 flex flex-col overflow-hidden">
                        <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-[var(--border-color)]">
                          <span className="text-xs text-[var(--text-color-secondary)]">
                            模拟响应（本地格式化）
                          </span>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button
                                size="sm"
                                variant="light"
                                className="text-xs h-6 px-2"
                                endContent={<FiChevronDown className="text-xs" />}
                              >
                                操作
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="响应操作">
                              <DropdownItem
                                key="copy"
                                startContent={<FiCopy className="text-xs" />}
                                onPress={handleCopyResponse}
                              >
                                复制响应
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                        <pre className="flex-1 px-2.5 py-2 overflow-auto">
{debugResponse}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </Tab>
            </AdminTabs>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ApiDocPage;

