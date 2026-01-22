import React, { useState, useMemo } from 'react';
import {
  Card,
  Chip,
  Accordion,
  AccordionItem,
  ScrollShadow,
  Button,
  Snippet,
  Code,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react';
import { Server, ChevronsUpDown, ChevronsDownUp } from 'lucide-react';
import apiDocsDataRaw from '@/config/api-docs-data.json';
import { AdminSearchInput } from '@/components/Admin/AdminSearchInput';

// --- Types ---
interface ApiItem {
  id: string;
  name: string;
  method: string;
  path: string;
  status: string;
  owner: string;
  funcName: string;
  params: string;
  returnType?: string;
  types?: Record<string, string>;
}

interface ApiCategory {
  id: string;
  name: string;
  children: ApiItem[];
}

const apiDocsData = apiDocsDataRaw as ApiCategory[];

// --- Helper Functions ---

// Parse "params: { id: string }" or "params: MyType"
const parseParams = (paramsStr: string, typesMap: Record<string, string> = {}) => {
  if (!paramsStr) return [];

  // Remove "params: " prefix
  let cleanStr = paramsStr.trim();
  if (cleanStr.startsWith('params:')) {
    cleanStr = cleanStr.substring(7).trim();
  }
  if (cleanStr.startsWith('data:')) {
    cleanStr = cleanStr.substring(5).trim();
  }

  // Check if it's a named type
  // e.g., "RecentAdminLogParams"
  const typeNameMatch = cleanStr.match(/^(\w+)$/);
  if (typeNameMatch && typesMap[typeNameMatch[1]]) {
    cleanStr = typesMap[typeNameMatch[1]];
  }

  // If it's an object definition "{ ... }"
  if (cleanStr.startsWith('{') && cleanStr.endsWith('}')) {
    const inner = cleanStr.substring(1, cleanStr.length - 1);
    // Split by ; or newline
    const lines = inner.split(/[;\n]/).filter(l => l.trim());
    return lines.map(line => {
      const parts = line.split(':');
      if (parts.length < 2) return null;
      const keyPart = parts[0].trim();
      const typePart = parts.slice(1).join(':').trim();
      
      const isOptional = keyPart.endsWith('?');
      const name = isOptional ? keyPart.slice(0, -1) : keyPart;
      
      return {
        name,
        type: typePart,
        required: !isOptional,
        desc: '' // No description available in current extraction
      };
    }).filter(Boolean) as { name: string, type: string, required: boolean, desc: string }[];
  }

  return [];
};

// Generate mock data from return type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateMockData = (returnType: string | undefined, typesMap: Record<string, string> = {}): any => {
  if (!returnType) return {};
  if (returnType === 'void') return {};
  if (returnType === 'any') return {};

  // Array type "Item[]"
  if (returnType.endsWith('[]')) {
    const itemType = returnType.slice(0, -2);
    return [generateMockData(itemType, typesMap)];
  }

  // Basic types
  if (returnType === 'string') return "string_value";
  if (returnType === 'number') return 0;
  if (returnType === 'boolean') return true;
  
  // Named type
  if (typesMap[returnType]) {
    const typeDef = typesMap[returnType];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {};
    const params = parseParams(typeDef, typesMap); // Reuse parser
    params.forEach(p => {
      // Avoid infinite recursion if type references itself (simplistic check)
      if (p.type === returnType) {
        result[p.name] = null;
      } else if (p.type.includes('|')) {
        // Union type: take first
        const first = p.type.split('|')[0].trim().replace(/['"]/g, '');
        result[p.name] = first;
      } else {
        result[p.name] = generateMockData(p.type, typesMap);
      }
    });
    return result;
  }

  return null;
};

// --- Main Component ---

export default function ApiDocPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApiId, setSelectedApiId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [expandedKeys, setExpandedKeys] = useState<any>(new Set(apiDocsData.map(d => d.id)));

  // 切换一键折叠/展开
  const toggleExpandAll = () => {
    if (expandedKeys.size === apiDocsData.length) {
      setExpandedKeys(new Set());
    } else {
      setExpandedKeys(new Set(apiDocsData.map(d => d.id)));
    }
  };

  // 过滤逻辑
  const filteredData = useMemo(() => {
    if (!searchQuery) return apiDocsData;
    const lowerQuery = searchQuery.toLowerCase();
    
    return apiDocsData.map(category => {
      const filteredChildren = category.children.filter(item => 
        item.name.toLowerCase().includes(lowerQuery) ||
        item.path.toLowerCase().includes(lowerQuery) ||
        item.funcName.toLowerCase().includes(lowerQuery)
      );
      
      if (filteredChildren.length > 0) {
        return { ...category, children: filteredChildren };
      }
      return null;
    }).filter(Boolean) as ApiCategory[];
  }, [searchQuery]);

  // 获取当前选中的 API
  const selectedApi = useMemo(() => {
    if (!selectedApiId) {
        if (apiDocsData.length > 0 && apiDocsData[0].children.length > 0) {
            return apiDocsData[0].children[0];
        }
        return null;
    }
    for (const category of apiDocsData) {
      const found = category.children.find(item => item.id === selectedApiId);
      if (found) return found;
    }
    return null;
  }, [selectedApiId]);

  // Method Colors
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'success';
      case 'POST': return 'warning';
      case 'PUT': return 'primary';
      case 'DELETE': return 'danger';
      case 'PATCH': return 'secondary';
      default: return 'default';
    }
  };

  // Method Short Name for Sidebar
  const getMethodShortName = (method: string) => {
    const m = method.toUpperCase();
    if (m === 'DELETE') return 'DEL';
    return m;
  };

  // Parsed Params
  const requestParams = useMemo(() => {
    if (!selectedApi) return [];
    return parseParams(selectedApi.params, selectedApi.types);
  }, [selectedApi]);

  // Request Params JSON for copying
  const requestParamsJson = useMemo(() => {
    if (!selectedApi || requestParams.length === 0) return '{}';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj: any = {};
    requestParams.forEach(p => {
      obj[p.name] = generateMockData(p.type, selectedApi.types);
    });
    return JSON.stringify(obj, null, 2);
  }, [requestParams, selectedApi]);

  // Mock Response
  const mockResponse = useMemo(() => {
    if (!selectedApi) return {};
    return {
      code: 200,
      message: "success",
      data: generateMockData(selectedApi.returnType, selectedApi.types),
      timestamp: 1737111241000 // Fixed timestamp for purity
    };
  }, [selectedApi]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] w-full gap-4">
      {/* Sidebar - API List */}
      <Card className="w-full lg:w-[300px] flex-none border border-[var(--border-color)] bg-[var(--bg-elevated)]/95 shadow-sm overflow-hidden flex flex-col">
        <div className="p-3 flex flex-col gap-3 border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[var(--text-color-secondary)] uppercase tracking-wider">接口列表</span>
            <div className="flex gap-1">
                 <Button 
                    isIconOnly 
                    size="sm" 
                    variant="light" 
                    radius="full" 
                    className="h-7 w-7 min-w-0"
                    onPress={toggleExpandAll}
                    title={expandedKeys.size === apiDocsData.length ? "全部折叠" : "全部展开"}
                 >
                    {expandedKeys.size === apiDocsData.length ? (
                      <ChevronsDownUp className="w-3.5 h-3.5 text-[var(--text-color-secondary)]" />
                    ) : (
                      <ChevronsUpDown className="w-3.5 h-3.5 text-[var(--text-color-secondary)]" />
                    )}
                 </Button>
            </div>
          </div>
          <AdminSearchInput
            placeholder="搜索接口..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="w-full"
          />
        </div>
        
        <ScrollShadow className="flex-1 p-2">
            <Accordion 
              selectionMode="multiple" 
              selectedKeys={expandedKeys}
              onSelectionChange={setExpandedKeys}
              showDivider={false}
              itemClasses={{
                base: "py-0 w-full",
                title: "text-[11px] font-medium text-[var(--text-color-secondary)]",
                trigger: "py-2 px-2 data-[hover=true]:bg-[var(--bg-elevated)]/60 rounded-lg h-8 flex items-center",
                indicator: "text-[var(--text-color-secondary)] text-[10px]",
                content: "pb-2 pt-0"
              }}
            >
              {filteredData.map((category) => (
                <AccordionItem 
                  key={category.id} 
                  aria-label={category.name} 
                  title={
                    <div className="flex items-center gap-2 truncate">
                      <Server className="w-3.5 h-3.5" />
                      <span className="truncate">{category.name}</span>
                    </div>
                  }
                >
                  <div className="flex flex-col gap-0.5 pl-2 border-l border-[var(--border-color)] ml-3">
                    {category.children.map((api) => (
                      <button
                        key={api.id}
                        onClick={() => setSelectedApiId(api.id)}
                        className={`
                          group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all w-full text-left
                          ${selectedApi?.id === api.id 
                            ? 'bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] text-[var(--primary-color)]' 
                            : 'text-[var(--text-color-secondary)] hover:bg-[var(--bg-elevated)]/80 hover:text-[var(--text-color)]'}
                        `}
                      >
                        <span className={`
                            text-[9px] font-bold px-1 py-0.5 rounded min-w-[32px] text-center
                            ${selectedApi?.id === api.id ? `bg-${getMethodColor(api.method)}/20 text-${getMethodColor(api.method)}` : 'bg-[var(--bg-elevated)]/80 text-[var(--text-color-secondary)]'}
                        `}>
                            {getMethodShortName(api.method)}
                        </span>
                        <span className="text-[11px] truncate flex-1">{api.funcName}</span>
                      </button>
                    ))}
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
        </ScrollShadow>
      </Card>

      {/* Main Content - API Details */}
      <Card className="flex-1 border border-[var(--border-color)] bg-[var(--bg-elevated)]/95 shadow-sm overflow-hidden flex flex-col">
        {selectedApi ? (
          <>
            {/* Top Bar - URL & Copy */}
            <div className="p-3 border-b border-[var(--border-color)]">
                <div className="flex items-center bg-[var(--bg-elevated)]/50 border border-[var(--border-color)] h-10 rounded-lg overflow-hidden">
                    <div className={`px-4 h-10 flex items-center text-[11px] font-bold border-r border-[var(--border-color)] bg-[var(--bg-elevated)]/80 text-${getMethodColor(selectedApi.method)}`}>
                        {selectedApi.method}
                    </div>
                    <Snippet 
                        fullWidth
                        symbol=""
                        variant="flat"
                        className="bg-transparent h-10 p-0 flex-1 shadow-none"
                        classNames={{
                            pre: "px-4 text-xs text-[var(--text-color-secondary)] font-mono truncate",
                            copyButton: "mr-1 text-[var(--text-color-secondary)] hover:text-[var(--primary-color)]"
                        }}
                    >
                        http://localhost:8080{selectedApi.path}
                    </Snippet>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <ScrollShadow className="flex-1">
                    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 sm:space-y-8">
                        {/* Header */}
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-lg font-bold text-[var(--text-color)]">{selectedApi.funcName}</h1>
                                <Chip size="sm" variant="flat" color={selectedApi.status === 'enabled' ? "success" : "warning"} className="h-5 text-[10px]">
                                    {selectedApi.status}
                                </Chip>
                                <div className="ml-auto flex items-center gap-2">
                                  <span className="text-[11px] text-[var(--text-color-secondary)]">维护者:</span>
                                  <Chip size="sm" variant="flat" className="h-5 text-[10px]">{selectedApi.owner}</Chip>
                                </div>
                            </div>
                            <div className="text-xs text-[var(--text-color-secondary)] bg-[var(--bg-elevated)]/40 p-3 rounded-lg border border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8">
                                <div className="flex items-center gap-2">
                                  <span className="w-16 flex-none">接口路径:</span>
                                  <span className="font-mono text-[var(--text-color)] break-all">{selectedApi.path}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-16 flex-none">返回类型:</span>
                                  <span className="font-mono text-[var(--primary-color)]">{selectedApi.returnType || 'unknown'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Request Params */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-[13px] font-bold text-[var(--text-color)] flex items-center gap-2">
                                <div className="w-1 h-3.5 bg-[var(--primary-color)] rounded-full"></div>
                                请求参数
                              </h3>
                              {requestParams.length > 0 && (
                                <Snippet 
                                  size="sm" 
                                  symbol="" 
                                  variant="flat" 
                                  className="h-7 px-2 bg-[var(--bg-elevated)]/50 border border-[var(--border-color)] text-[var(--text-color-secondary)]"
                                  classNames={{ pre: "hidden" }}
                                  tooltipProps={{ content: "复制请求参数 JSON" }}
                                >
                                  {requestParamsJson}
                                </Snippet>
                              )}
                            </div>
                            
                            {requestParams.length > 0 ? (
                                <Table 
                                    aria-label="Params Table" 
                                    className="min-w-full"
                                >
                                    <TableHeader>
                                        <TableColumn>参数名</TableColumn>
                                        <TableColumn>类型</TableColumn>
                                        <TableColumn>必填</TableColumn>
                                        <TableColumn>说明</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {requestParams.map((param, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-mono text-[11px]">{param.name}</TableCell>
                                                <TableCell>
                                                    <Chip size="sm" variant="flat" color="secondary" className="h-4.5 text-[9px] px-1">{param.type}</Chip>
                                                </TableCell>
                                                <TableCell>
                                                    {param.required ? 
                                                        <span className="text-danger text-[11px]">是</span> : 
                                                        <span className="text-[var(--text-color-secondary)] text-[11px]">否</span>
                                                    }
                                                </TableCell>
                                                <TableCell className="text-[var(--text-color-secondary)] text-[11px]">-</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="border border-[var(--border-color)] rounded-lg p-8 text-center text-[var(--text-color-secondary)] text-xs bg-[var(--bg-elevated)]/20">
                                    <div className="opacity-40 mb-2">无需参数或参数解析失败</div>
                                    {selectedApi.params && <div className="text-[10px] font-mono opacity-30">{selectedApi.params}</div>}
                                </div>
                            )}
                        </div>

                        {/* Response */}
                        <div className="space-y-4">
                            <h3 className="text-[13px] font-bold text-[var(--text-color)] flex items-center gap-2">
                              <div className="w-1 h-3.5 bg-success rounded-full"></div>
                              返回响应 (Mock)
                            </h3>
                             <div className="border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--bg-elevated)]/30">
                                <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]/60">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded">200 OK</span>
                                        <span className="text-[10px] text-[var(--text-color-secondary)] font-medium">application/json</span>
                                    </div>
                                    <Snippet size="sm" symbol="" variant="flat" className="p-0 h-6 min-w-0 bg-transparent text-[var(--text-color-secondary)]" classNames={{ pre: "hidden" }}>
                                      {JSON.stringify(mockResponse)}
                                    </Snippet>
                                </div>
                                <div className="p-0 bg-transparent">
                                    <Code className="w-full bg-transparent p-4 text-[11px] font-mono text-[var(--text-color)] block whitespace-pre-wrap shadow-none">
                                        {JSON.stringify(mockResponse, null, 2)}
                                    </Code>
                                </div>
                            </div>
                        </div>
                        
                        <div className="h-10"></div>
                    </div>
                </ScrollShadow>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-color-secondary)] p-8 text-center">
             <div className="w-16 h-16 mb-4 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center border border-[var(--border-color)]">
                <Server className="w-8 h-8 opacity-20" />
             </div>
             <p className="text-sm">请从左侧列表选择一个接口以查看详情</p>
          </div>
        )}
      </Card>
    </div>
  );
}
