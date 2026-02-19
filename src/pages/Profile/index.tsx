/**
 * 个人中心页面
 * @module pages/Profile
 * @description 用户个人中心，支持个人信息展示、设置修改、退出登录等功能
 */

import React from "react";
import { Tab, Card, Avatar, Button, Input, Switch } from "@heroui/react";
import { AdminTabs } from "@/components/Admin/AdminTabs";
import { FiEdit2, FiSettings, FiHeart, FiStar, FiMessageSquare, FiShield, FiLock, FiLogOut } from "react-icons/fi";
import { useUserStore } from "@/store/modules/userStore";
import { logout } from "@/api/auth";
import { useNavigate } from "react-router-dom";
import { routes } from "@/router/routes";

function ProfilePage() {
  const { userId, avatar, reset: resetUser } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
    resetUser();
    navigate(routes.home);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Info */}
        <div className="md:w-80 space-y-6">
          <Card className="p-6 flex flex-col items-center text-center space-y-4 bg-[var(--bg-elevated)] border border-[var(--border-color)]">
            <div className="relative">
              <Avatar 
                className="w-24 h-24 text-3xl" 
                src={avatar || undefined}
                name={userId?.charAt(0).toUpperCase() || "U"} 
                showFallback
              />
              <Button isIconOnly size="sm" radius="full" className="absolute bottom-0 right-0 bg-[var(--primary-color)] text-white">
                <FiEdit2 />
              </Button>
            </div>
            <div>
              <h2 className="text-xl font-bold">{userId || "知库用户"}</h2>
              <p className="text-sm text-[var(--text-color-secondary)]">前端开发者 · 知识库探索者</p>
            </div>
            <div className="flex gap-4 w-full justify-center pt-2">
              <div className="text-center">
                <div className="font-bold">12</div>
                <div className="text-xs text-[var(--text-color-secondary)]">发布</div>
              </div>
              <div className="text-center">
                <div className="font-bold">48</div>
                <div className="text-xs text-[var(--text-color-secondary)]">关注</div>
              </div>
              <div className="text-center">
                <div className="font-bold">128</div>
                <div className="text-xs text-[var(--text-color-secondary)]">粉丝</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-2 bg-[var(--bg-elevated)] border border-[var(--border-color)]">
             <Button variant="light" className="w-full justify-start gap-3 text-danger" onPress={handleLogout}>
                <FiLogOut /> 退出登录
             </Button>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <AdminTabs
            aria-label="Profile Tabs"
            variant="underlined"
            classNames={{
              tabList: "p-0 gap-8 border-none",
              tab: "h-11 px-0 min-w-0 text-lg",
              cursor: "h-[2px] w-full bg-[var(--primary-color)]",
              tabContent: "group-data-[selected=true]:text-[var(--primary-color)] font-medium"
            }}
          >
            <Tab key="collections" title={<div className="flex items-center gap-2"><FiStar /> 我的收藏</div>}>
              <Card className="p-6 mt-4 bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                <div className="text-center py-12 text-[var(--text-color-secondary)]">
                  暂无收藏内容
                </div>
              </Card>
            </Tab>
            <Tab key="likes" title={<div className="flex items-center gap-2"><FiHeart /> 我的点赞</div>}>
              <Card className="p-6 mt-4 bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                <div className="text-center py-12 text-[var(--text-color-secondary)]">
                  暂无点赞记录
                </div>
              </Card>
            </Tab>
            <Tab key="messages" title={<div className="flex items-center gap-2"><FiMessageSquare /> 消息通知</div>}>
              <Card className="p-6 mt-4 bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                <div className="text-center py-12 text-[var(--text-color-secondary)]">
                  暂无新消息
                </div>
              </Card>
            </Tab>
            <Tab key="settings" title={<div className="flex items-center gap-2"><FiSettings /> 设置中心</div>}>
              <Card className="p-6 mt-4 space-y-8 bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2"><FiShield /> 账号安全</h3>
                  <div className="space-y-4">
                    <Input label="绑定邮箱" placeholder="user@example.com" labelPlacement="outside" />
                    <Input label="绑定手机" placeholder="+86 1xx xxxx xxxx" labelPlacement="outside" />
                    <Button size="sm">修改密码</Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2"><FiLock /> 隐私设置</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">公开我的收藏</div>
                    <Switch defaultSelected size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">允许他人查看我的关注</div>
                    <Switch defaultSelected size="sm" />
                  </div>
                </div>
              </Card>
            </Tab>
          </AdminTabs>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
