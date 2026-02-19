/**
 * 基本信息表单组件
 * @module pages/Resume/components/BasicInfoForm
 * @description 简历基本信息编辑表单，包含姓名、联系方式、头像等字段
 */

import React, { useRef } from "react";
import { Input, Textarea, Avatar } from "@heroui/react";
import { User, Phone, Mail, Github, MapPin, Briefcase, Camera } from "lucide-react";
import { BasicInfo } from "@/api/front/resume";

interface BasicInfoFormProps {
  data: BasicInfo;
  onChange: (data: BasicInfo) => void;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ data, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (key: string, value: string) => {
    onChange({ ...data, [key]: value });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange("avatar", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="flex gap-6 items-start mb-2">
        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
          <Avatar
            src={data.avatar}
            className="w-24 h-24 text-large"
            isBordered
            color="primary"
            showFallback
            fallback={<User size={40} />}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white" size={24} />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        
        <div className="flex-1 flex flex-col gap-4">
          <Input
            label="姓名"
            placeholder="请输入姓名"
            value={data.name || ""}
            onValueChange={(v) => handleChange("name", v)}
            startContent={<User size={16} />}
            variant="flat"
          />
          <div className="flex gap-4">
            <Input
              label="年龄"
              placeholder="年龄"
              value={data.age?.toString() || ""}
              onValueChange={(v) => handleChange("age", v)}
              type="text"
              variant="flat"
              className="w-1/3"
            />
            <Input
              label="性别"
              placeholder="性别"
              value={data.gender || ""}
              onValueChange={(v) => handleChange("gender", v)}
              variant="flat"
              className="w-1/3"
            />
            <Input
              label="工作经验"
              placeholder="年限"
              value={data.experience || ""}
              onValueChange={(v) => handleChange("experience", v)}
              variant="flat"
              className="w-1/3"
            />
          </div>
          <Input
            label="求职意向"
            placeholder="例如：Java开发工程师"
            value={data.jobIntention || ""}
            onValueChange={(v) => handleChange("jobIntention", v)}
            startContent={<Briefcase size={16} />}
            variant="flat"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Input
          label="期望薪资"
          placeholder="例如：30K-50K"
          value={data.salary || ""}
          onValueChange={(v) => handleChange("salary", v)}
          className="flex-1"
        />
        <Input
          label="求职状态"
          placeholder="例如：面议/离职"
          value={data.status || ""}
          onValueChange={(v) => handleChange("status", v)}
          className="flex-1"
        />
        <Input
          label="政治面貌"
          placeholder="例如：群众"
          value={data.politics || ""}
          onValueChange={(v) => handleChange("politics", v)}
          className="flex-1"
        />
      </div>

      <div className="flex gap-4">
        <Input
          label="电话"
          placeholder="手机号码"
          value={data.phone || ""}
          onValueChange={(v) => handleChange("phone", v)}
          startContent={<Phone size={16} />}
          className="flex-1"
        />
        <Input
          label="邮箱"
          placeholder="电子邮箱"
          value={data.email || ""}
          onValueChange={(v) => handleChange("email", v)}
          startContent={<Mail size={16} />}
          className="flex-1"
        />
      </div>

      <div className="flex gap-4">
        <Input
          label="城市"
          placeholder="期望城市"
          value={data.city || ""}
          onValueChange={(v) => handleChange("city", v)}
          startContent={<MapPin size={16} />}
          className="flex-1"
        />
        <Input
          label="Github"
          placeholder="Github链接"
          value={data.github || ""}
          onValueChange={(v) => handleChange("github", v)}
          startContent={<Github size={16} />}
          className="flex-1"
        />
      </div>

      <Textarea
        label="个人总结"
        placeholder="简短的个人优势总结..."
        value={data.summary || ""}
        onValueChange={(v) => handleChange("summary", v)}
        minRows={3}
      />
    </div>
  );
};

export default BasicInfoForm;
