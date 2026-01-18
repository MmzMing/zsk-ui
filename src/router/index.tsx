import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { routes } from "./routes";
import HomePage from "../pages/Home";
import AllSearchPage from "../pages/AllSearch";
import ResumePage from "../pages/Resume";
import ToolsPage from "../pages/Tools";
import AboutPage from "../pages/About";
import VideoDetail from "../pages/VideoDetail";
import DocDetail from "../pages/DocDetail";
import LoginPage from "../pages/Auth/Login";
import RegisterPage from "../pages/Auth/Register";
import ForgotPasswordPage from "../pages/Auth/ForgotPassword";
import ProfilePage from "../pages/Profile";
import AdminPage from "../pages/Admin";
import AnalysisPage from "../pages/Admin/Analysis";
import ApiDocPage from "../pages/Admin/Ops/ApiDoc";
import SystemMonitorPage from "../pages/Admin/Ops/SystemMonitor";
import CacheMonitorPage from "../pages/Admin/Ops/CacheMonitor";
import CacheListPage from "../pages/Admin/Ops/CacheList";
import SystemLogPage from "../pages/Admin/Ops/SystemLog";
import UserBehaviorPage from "../pages/Admin/Ops/UserBehavior";
import UserManagePage from "../pages/Admin/Personnel/User";
import MenuManagePage from "../pages/Admin/Personnel/Menu";
import RoleManagePage from "../pages/Admin/Personnel/Role";
import DictManagePage from "../pages/Admin/System/Dict";
import TokenManagePage from "../pages/Admin/System/Token";
import ParamManagePage from "../pages/Admin/System/Param";
import PermissionManagePage from "../pages/Admin/System/Permission";
import VideoUploadPage from "../pages/Admin/Video/Upload";
import VideoListPage from "../pages/Admin/Video/List";
import VideoReviewPage from "../pages/Admin/Video/Review";
import DocumentUploadPage from "../pages/Admin/Document/Upload";
import DocumentListPage from "../pages/Admin/Document/List";
import DocumentReviewPage from "../pages/Admin/Document/Review";
import NapCatPage from "../pages/Admin/Bot/NapCat";
import QQBotPage from "../pages/Admin/Bot/QQBot";
import WeChatBotPage from "../pages/Admin/Bot/WeChatBot";
import DingTalkBotPage from "../pages/Admin/Bot/DingTalkBot";
import NotFoundPage from "../pages/NotFound";
import BasicLayout from "../layouts/BasicLayout";
import BlankLayout from "../layouts/BlankLayout";
import AdminLayout from "../layouts/AdminLayout";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={React.createElement(BasicLayout)}>
          <Route path={routes.home} element={<HomePage />} />
          <Route path={routes.allSearch} element={<AllSearchPage />} />
          <Route path={routes.resume} element={<ResumePage />} />
          <Route path={routes.tools} element={<ToolsPage />} />
          <Route path={routes.about} element={<AboutPage />} />
          <Route path={routes.profile} element={<ProfilePage />} />
          <Route path={routes.videoDetail} element={<VideoDetail />} />
          <Route path={routes.docDetail} element={<DocDetail />} />
        </Route>
        <Route element={React.createElement(AdminLayout)}>
          <Route path={routes.admin} element={<AdminPage />} />
          <Route path={`${routes.admin}/analysis`} element={<AnalysisPage />} />
          <Route path={`${routes.admin}/ops/api-doc`} element={<ApiDocPage />} />
          <Route path={`${routes.admin}/ops/system-monitor`} element={<SystemMonitorPage />} />
          <Route path={`${routes.admin}/ops/cache-monitor`} element={<CacheMonitorPage />} />
          <Route path={`${routes.admin}/ops/cache-list`} element={<CacheListPage />} />
          <Route path={`${routes.admin}/ops/system-log`} element={<SystemLogPage />} />
          <Route path={`${routes.admin}/ops/user-behavior`} element={<UserBehaviorPage />} />
          <Route path={`${routes.admin}/personnel/user`} element={<UserManagePage />} />
          <Route path={`${routes.admin}/personnel/menu`} element={<MenuManagePage />} />
          <Route path={`${routes.admin}/personnel/role`} element={<RoleManagePage />} />
          <Route path={`${routes.admin}/system/dict`} element={<DictManagePage />} />
          <Route path={`${routes.admin}/system/token`} element={<TokenManagePage />} />
          <Route path={`${routes.admin}/system/param`} element={<ParamManagePage />} />
          <Route path={`${routes.admin}/system/permission`} element={<PermissionManagePage />} />
          <Route path={`${routes.admin}/video/upload`} element={<VideoUploadPage />} />
          <Route path={`${routes.admin}/video/list`} element={<VideoListPage />} />
          <Route path={`${routes.admin}/video/review`} element={<VideoReviewPage />} />
          <Route path={`${routes.admin}/document/upload`} element={<DocumentUploadPage />} />
          <Route path={`${routes.admin}/document/list`} element={<DocumentListPage />} />
          <Route path={`${routes.admin}/document/review`} element={<DocumentReviewPage />} />
          <Route path={`${routes.admin}/bot/napcat`} element={<NapCatPage />} />
          <Route path={`${routes.admin}/bot/qq`} element={<QQBotPage />} />
          <Route path={`${routes.admin}/bot/wechat`} element={<WeChatBotPage />} />
          <Route path={`${routes.admin}/bot/dingtalk`} element={<DingTalkBotPage />} />
        </Route>
        <Route element={React.createElement(BlankLayout)}>
          <Route path={routes.login} element={<LoginPage />} />
          <Route path={routes.register} element={<RegisterPage />} />
          <Route path={routes.forgotPassword} element={<ForgotPasswordPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
