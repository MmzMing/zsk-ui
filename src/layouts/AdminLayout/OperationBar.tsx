import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { FiGrid, FiBell, FiSettings, FiHome, FiUser, FiLogOut, FiEye, FiEyeOff } from "react-icons/fi";
import { Dock, DockIcon } from "../../components/MagicUI/Dock";
import MainMenu from "./MainMenu";
import { useAppStore } from "../../store";
import { useUserStore } from "../../store/modules/userStore";
import { routes } from "../../router/routes";

interface OperationBarProps {
  onOpenSettings: () => void;
}

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="font-mono text-xs font-medium tabular-nums text-[var(--text-color)] whitespace-nowrap">
      {time.toLocaleTimeString()}
    </div>
  );
};

const OperationBar = ({ onOpenSettings }: OperationBarProps) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { showTopNav, setShowTopNav } = useAppStore();
  const { reset: resetUser } = useUserStore();

  const handleMenuSelect = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    try {
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("permissions");
      window.localStorage.removeItem("userInfo");
    } catch {
      // ignore
    }
    resetUser();
    navigate(routes.home);
  };

  return (
    <>
      <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center items-center pointer-events-none">
        {/* Dock Area */}
        <div className="pointer-events-auto relative">
           <Dock magnification={60} distance={100} className="px-4 bg-[var(--bg-elevated)]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-xl">
            <DockIcon onClick={() => setMenuOpen(!menuOpen)}>
              <Tooltip content="主菜单">
                <div className="w-full h-full flex items-center justify-center text-[var(--text-color)] hover:text-[var(--primary-color)] transition-colors">
                  <FiGrid className="text-xl" />
                </div>
              </Tooltip>
            </DockIcon>

            <DockIcon onClick={() => {}}>
              <Tooltip content="消息通知">
                <div className="w-full h-full flex items-center justify-center text-[var(--text-color)] hover:text-[var(--primary-color)] transition-colors">
                  <FiBell className="text-xl" />
                </div>
              </Tooltip>
            </DockIcon>

            <DockIcon onClick={() => setShowTopNav(!showTopNav)}>
              <Tooltip content={showTopNav ? "隐藏导航" : "显示导航"}>
                <div className="w-full h-full flex items-center justify-center text-[var(--text-color)] hover:text-[var(--primary-color)] transition-colors">
                  {showTopNav ? <FiEyeOff className="text-xl" /> : <FiEye className="text-xl" />}
                </div>
              </Tooltip>
            </DockIcon>

            <DockIcon onClick={onOpenSettings}>
              <Tooltip content="系统设置">
                <div className="w-full h-full flex items-center justify-center text-[var(--text-color)] hover:text-[var(--primary-color)] transition-colors">
                  <FiSettings className="text-xl" />
                </div>
              </Tooltip>
            </DockIcon>

            <DockIcon>
               <Dropdown placement="top">
                <DropdownTrigger>
                  <div className="w-full h-full flex items-center justify-center outline-none cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white text-xs font-bold shadow-lg transform transition-transform hover:scale-110 active:scale-95">
                      管
                    </div>
                  </div>
                </DropdownTrigger>
                <DropdownMenu aria-label="User Actions">
                  <DropdownItem key="home" startContent={<FiHome />} onPress={() => navigate(routes.home)}>
                    返回前台
                  </DropdownItem>
                  <DropdownItem key="profile" startContent={<FiUser />} onPress={() => navigate(routes.profile)}>
                    个人中心
                  </DropdownItem>
                  <DropdownItem key="logout" className="text-danger" color="danger" startContent={<FiLogOut />} onPress={handleLogout}>
                    退出登录
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </DockIcon>

            {/* Clock in Dock */}
             <DockIcon className="!w-auto !aspect-auto px-2">
                <div className="h-full flex items-center justify-center">
                   <Clock />
                </div>
            </DockIcon>
          </Dock>
        </div>
      </div>

      <MainMenu 
        isOpen={menuOpen} 
        onClose={() => setMenuOpen(false)} 
        onSelect={handleMenuSelect} 
      />
    </>
  );
};

export default OperationBar;
