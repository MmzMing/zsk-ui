import React, { useState, useRef, useEffect, useCallback } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { Phone, Mail, Github, Briefcase } from "lucide-react";
import { ResumeModule } from "@/api/front/resume";

const ResumePreview: React.FC = () => {
  const { 
    modules, 
    zoomLevel,
    fontFamily,
    fontSize,
    lineHeight,
    paragraphSpacing,
    pagePadding,
    theme 
  } = useResumeStore();

  // 拖拽相关状态
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const basicInfoModule = modules.find((m) => m.type === "basic");
  const basicInfo = basicInfoModule?.data || {};
  const visibleModules = modules.filter((m) => m.isVisible);

  // 处理拖拽开始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // 仅限左键
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  // 处理拖拽过程
   const handleMouseMove = useCallback((e: MouseEvent) => {
     if (!isDragging) return;
     setPosition({
       x: e.clientX - dragStart.x,
       y: e.clientY - dragStart.y
     });
   }, [isDragging, dragStart]);

  // 处理拖拽结束
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 1. 简约模板渲染 (Minimal)
  const renderMinimalLayout = () => {
    return (
      <div className="flex flex-col">
        {/* Basic Info Header */}
        {basicInfoModule && basicInfoModule.isVisible && (
          <div className="flex justify-between items-start mb-6 pb-4 relative">
            <div className="flex-1 flex flex-col items-center text-center">
              <h1 className="text-3xl font-bold mb-4 tracking-wider text-gray-900">{basicInfo.name || "您的姓名"}</h1>
              
              <div className="flex flex-col gap-2 text-[13px] text-gray-600">
                {/* Line 1: Job Intention | City | Salary | Status */}
                <div className="flex items-center justify-center gap-2">
                  {[
                    basicInfo.jobIntention && `求职意向: ${basicInfo.jobIntention}`,
                    basicInfo.city,
                    basicInfo.salary,
                    basicInfo.status
                  ].filter(Boolean).map((item, idx, arr) => (
                    <React.Fragment key={idx}>
                      <span className={idx === 0 && basicInfo.jobIntention ? "text-gray-800" : ""}>{item}</span>
                      {idx < arr.length - 1 && <span className="text-gray-300">|</span>}
                    </React.Fragment>
                  ))}
                </div>

                {/* Line 2: Age | Gender | Experience | Politics */}
                <div className="flex items-center justify-center gap-2">
                  {[
                    basicInfo.age && `${basicInfo.age}岁`,
                    basicInfo.gender,
                    basicInfo.experience && `${basicInfo.experience}${basicInfo.experience.includes('年') ? '' : '年'}经验`,
                    basicInfo.politics
                  ].filter(Boolean).map((item, idx, arr) => (
                    <React.Fragment key={idx}>
                      <span>{item}</span>
                      {idx < arr.length - 1 && <span className="text-gray-300">|</span>}
                    </React.Fragment>
                  ))}
                </div>

                {/* Line 3: Phone | Email */}
                <div className="flex items-center justify-center gap-4 mt-1">
                  {[basicInfo.phone, basicInfo.email].filter(Boolean).map((item, idx, arr) => (
                    <React.Fragment key={idx}>
                      <span>{item}</span>
                      {idx < arr.length - 1 && <span className="text-gray-300">|</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Avatar on the right */}
            {basicInfo.avatar && (
              <div className="w-24 h-28 ml-4 shrink-0 overflow-hidden border border-gray-100 shadow-sm">
                <img src={basicInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        )}

        {/* Modules with full width line dividers */}
        <div className="flex flex-col" style={{ gap: `${paragraphSpacing * 1.5}px` }}>
          {visibleModules.filter(m => m.type !== 'basic').map(renderMinimalModule)}
        </div>
      </div>
    );
  };

  const renderMinimalModule = (module: ResumeModule) => (
    <div key={module.id} className="module-section">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          {module.title}
        </h2>
        <div className="w-full h-[1.5px] bg-gray-800" />
      </div>
      <div 
        className="prose prose-sm max-w-none text-gray-800 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&_strong]:text-gray-900"
        style={{ lineHeight: lineHeight, fontSize: `${fontSize}px` }}
        dangerouslySetInnerHTML={{ __html: module.content || "" }} 
      />
    </div>
  );

  // 2. 标准模板渲染 (Standard)
  const renderStandardLayout = () => {
    return (
      <div className="flex flex-col">
        {/* Header with background block */}
        <div className="flex justify-between items-start mb-10">
          <div className="flex-1">
            <div 
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-br-3xl mb-8 -ml-[var(--padding-x)]"
              style={{ marginLeft: `-${pagePadding}mm` } as React.CSSProperties}
            >
              <h1 className="text-3xl font-bold tracking-widest uppercase">个人简历</h1>
              <span className="text-sm font-normal opacity-80 block tracking-widest mt-1">PERSONAL RESUME</span>
            </div>
            
            {basicInfoModule && basicInfoModule.isVisible && (
              <div className="grid grid-cols-2 gap-y-4 gap-x-12 text-sm mr-8">
                <div className="flex items-center gap-4 border-b border-indigo-50 pb-2">
                  <span className="text-indigo-600 font-bold w-12 shrink-0">姓 名</span> 
                  <span className="text-gray-800 font-medium">{basicInfo.name || "您的姓名"}</span>
                </div>
                <div className="flex items-center gap-4 border-b border-indigo-50 pb-2">
                  <span className="text-indigo-600 font-bold w-12 shrink-0">年 龄</span> 
                  <span className="text-gray-800">{basicInfo.age || "-"} 岁</span>
                </div>
                <div className="flex items-center gap-4 border-b border-indigo-50 pb-2">
                  <span className="text-indigo-600 font-bold w-12 shrink-0">电 话</span> 
                  <span className="text-gray-800">{basicInfo.phone || "-"}</span>
                </div>
                <div className="flex items-center gap-4 border-b border-indigo-50 pb-2">
                  <span className="text-indigo-600 font-bold w-12 shrink-0">邮 箱</span> 
                  <span className="text-gray-800">{basicInfo.email || "-"}</span>
                </div>
                <div className="flex items-center gap-4 border-b border-indigo-50 pb-2 col-span-2">
                  <span className="text-indigo-600 font-bold w-12 shrink-0">求 职</span> 
                  <span className="text-indigo-700 font-bold">{basicInfo.jobIntention || "-"}</span>
                </div>
              </div>
            )}
          </div>
          {basicInfo.avatar && (
            <div className="w-32 h-40 rounded-sm overflow-hidden border-4 border-indigo-50 shadow-lg ml-4 mt-2">
              <img src={basicInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Modules with colored headers */}
        <div className="flex flex-col" style={{ gap: `${paragraphSpacing * 2.5}px` }}>
          {visibleModules.filter(m => m.type !== 'basic').map(renderStandardModule)}
        </div>
      </div>
    );
  };

  const renderStandardModule = (module: ResumeModule) => (
    <div key={module.id} className="module-section">
      <div className="flex items-center mb-5">
        <div className="bg-indigo-600 text-white px-5 py-1.5 rounded-sm skew-x-[-15deg] shadow-sm">
          <h2 className="text-lg font-bold tracking-widest skew-x-[15deg]">
            {module.title}
          </h2>
        </div>
        <div className="flex-1 h-[2px] bg-indigo-50 ml-4" />
      </div>
      <div 
        className="prose prose-sm max-w-none text-gray-700 pl-4 border-l-2 border-indigo-50 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&_strong]:text-gray-900"
        style={{ lineHeight: lineHeight, fontSize: `${fontSize}px` }}
        dangerouslySetInnerHTML={{ __html: module.content || "" }} 
      />
    </div>
  );

  // 3. 创意模板渲染 (Creative)
  const renderCreativeLayout = () => {
    return (
      <div className="flex gap-10 h-full min-h-[inherit]">
        {/* Main Content (Left) */}
        <div className="flex-[6.5] flex flex-col">
          {/* Header Area */}
          <div className="mb-12 pb-8 border-b-4 border-teal-600">
             <h1 className="text-5xl font-black text-gray-900 mb-3 uppercase tracking-tighter">
                {basicInfo.name || "您的姓名"}
             </h1>
             <div className="flex items-center gap-3 text-teal-600 font-bold text-xl">
                <Briefcase size={22} />
                {basicInfo.jobIntention || "求职意向"}
             </div>
          </div>

          <div className="flex flex-col" style={{ gap: `${paragraphSpacing * 3}px` }}>
            {visibleModules.filter(m => m.type !== 'basic').map(renderCreativeModule)}
          </div>
        </div>

        {/* Sidebar (Right) */}
        <div 
          className="flex-[3.5] bg-teal-50 -my-[var(--padding-y)] -mr-[var(--padding-x)] p-8 flex flex-col border-l border-teal-100"
          style={{ 
            marginTop: `-${pagePadding}mm`, 
            marginBottom: `-${pagePadding}mm`, 
            marginRight: `-${pagePadding}mm` 
          } as React.CSSProperties}
        >
          {basicInfo.avatar && (
            <div className="w-full aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-xl mb-12">
              <img src={basicInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="space-y-10">
            <section>
              <h3 className="text-sm font-black text-teal-800 uppercase tracking-widest mb-5 border-b-2 border-teal-200 pb-2">联系方式</h3>
              <ul className="space-y-4 text-sm text-gray-600">
                {basicInfo.phone && <li className="flex items-center gap-3"><Phone size={16} className="text-teal-600" />{basicInfo.phone}</li>}
                {basicInfo.email && <li className="flex items-center gap-3"><Mail size={16} className="text-teal-600" />{basicInfo.email}</li>}
                {basicInfo.github && <li className="flex items-center gap-3"><Github size={16} className="text-teal-600" />{basicInfo.github}</li>}
              </ul>
            </section>

            {basicInfo.summary && (
              <section>
                <h3 className="text-sm font-black text-teal-800 uppercase tracking-widest mb-5 border-b-2 border-teal-200 pb-2">关于我</h3>
                <p className="text-xs text-gray-600 leading-relaxed bg-white p-4 rounded-xl shadow-sm">{basicInfo.summary}</p>
              </section>
            )}

            {/* Additional info grid */}
            <section className="bg-teal-600 text-white p-5 rounded-2xl shadow-md">
               <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-80">个人信息</h3>
               <div className="grid grid-cols-2 gap-4 text-xs">
                  {basicInfo.age && <div><div className="opacity-70 mb-1">年龄</div><div className="font-bold">{basicInfo.age}岁</div></div>}
                  {basicInfo.city && <div><div className="opacity-70 mb-1">城市</div><div className="font-bold">{basicInfo.city}</div></div>}
               </div>
            </section>
          </div>
        </div>
      </div>
    );
  };

  const renderCreativeModule = (module: ResumeModule) => (
    <div key={module.id} className="module-section">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-teal-600 flex items-center justify-center text-white font-bold rounded-sm">
          {module.title.charAt(0)}
        </div>
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
          {module.title}
        </h2>
      </div>
      <div 
        className="prose prose-sm max-w-none text-gray-700 pl-11 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&_strong]:text-gray-900"
        style={{ lineHeight: lineHeight, fontSize: `${fontSize}px` }}
        dangerouslySetInnerHTML={{ __html: module.content || "" }} 
      />
    </div>
  );

  const renderCurrentLayout = () => {
    switch (theme) {
      case "minimal": return renderMinimalLayout();
      case "creative": return renderCreativeLayout();
      case "standard": return renderStandardLayout();
      default: return renderStandardLayout();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 bg-[#1e1e20] flex justify-center items-start overflow-hidden relative cursor-grab active:cursor-grabbing print:p-0 print:bg-white print:overflow-visible"
      onMouseDown={handleMouseDown}
    >
      <div
        id="resume-preview"
        className={`bg-white text-black shadow-2xl box-border relative print:shadow-none print:w-full print:min-h-0 print:absolute print:top-0 print:left-0 origin-top transition-shadow duration-200 theme-${theme}`}
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: `${pagePadding}mm ${pagePadding}mm`,
          fontFamily: fontFamily,
          fontSize: `${fontSize}px`,
          lineHeight: lineHeight,
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel || 1})`,
          marginTop: "40px", // 初始顶部间距
        }}
      >
        {renderCurrentLayout()}
      </div>

      {/* Print Styles Injection */}
      <style>{`
        @media print {
            body * {
                visibility: hidden;
            }
            #resume-preview, #resume-preview * {
                visibility: visible;
            }
            #resume-preview {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: ${pagePadding}mm !important;
                box-shadow: none !important;
            }
            @page {
                size: A4;
                margin: 0;
            }
        }
      `}</style>
    </div>
  );
};

export default ResumePreview;
