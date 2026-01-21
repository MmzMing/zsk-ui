import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Spinner } from "@heroui/react";
import { routes } from "./routes";
import BasicLayout from "../layouts/BasicLayout";
import BlankLayout from "../layouts/BlankLayout";
import AdminLayout from "../layouts/AdminLayout";

// Lazy load pages
const HomePage = React.lazy(() => import("../pages/Home"));
const AllSearchPage = React.lazy(() => import("../pages/AllSearch"));
const ResumePage = React.lazy(() => import("../pages/Resume"));
const CrazinessPage = React.lazy(() => import("../pages/Craziness"));
const ToolsPage = React.lazy(() => import("../pages/Tools"));
const AboutPage = React.lazy(() => import("../pages/About"));
const VideoDetail = React.lazy(() => import("../pages/VideoDetail"));
const DocDetail = React.lazy(() => import("../pages/DocDetail"));
const LoginPage = React.lazy(() => import("../pages/Auth/Login"));
const RegisterPage = React.lazy(() => import("../pages/Auth/Register"));
const ForgotPasswordPage = React.lazy(() => import("../pages/Auth/ForgotPassword"));
const ProfilePage = React.lazy(() => import("../pages/Profile"));
const AdminPage = React.lazy(() => import("../pages/Admin"));
const AnalysisPage = React.lazy(() => import("../pages/Admin/Analysis"));
const ApiDocPage = React.lazy(() => import("../pages/Admin/Ops/ApiDoc"));
const SystemMonitorPage = React.lazy(() => import("../pages/Admin/Ops/SystemMonitor"));
const CacheMonitorPage = React.lazy(() => import("../pages/Admin/Ops/CacheMonitor"));
const CacheListPage = React.lazy(() => import("../pages/Admin/Ops/CacheList"));
const SystemLogPage = React.lazy(() => import("../pages/Admin/Ops/SystemLog"));
const UserBehaviorPage = React.lazy(() => import("../pages/Admin/Ops/UserBehavior"));
const UserManagePage = React.lazy(() => import("../pages/Admin/Personnel/User"));
const MenuManagePage = React.lazy(() => import("../pages/Admin/Personnel/Menu"));
const RoleManagePage = React.lazy(() => import("../pages/Admin/Personnel/Role"));
const DictManagePage = React.lazy(() => import("../pages/Admin/System/Dict"));
const TokenManagePage = React.lazy(() => import("../pages/Admin/System/Token"));
const ParamManagePage = React.lazy(() => import("../pages/Admin/System/Param"));
const PermissionManagePage = React.lazy(() => import("../pages/Admin/System/Permission"));
const VideoUploadPage = React.lazy(() => import("../pages/Admin/Video/Upload"));
const VideoListPage = React.lazy(() => import("../pages/Admin/Video/List"));
const VideoReviewPage = React.lazy(() => import("../pages/Admin/Video/Review"));
const DocumentUploadPage = React.lazy(() => import("../pages/Admin/Document/Upload"));
const DocumentListPage = React.lazy(() => import("../pages/Admin/Document/List"));
const DocumentReviewPage = React.lazy(() => import("../pages/Admin/Document/Review"));
const DocumentEditPage = React.lazy(() => import("../pages/Admin/Document/Edit"));
const NapCatPage = React.lazy(() => import("../pages/Admin/Bot/NapCat"));
const QQBotPage = React.lazy(() => import("../pages/Admin/Bot/QQBot"));
const WeChatBotPage = React.lazy(() => import("../pages/Admin/Bot/WeChatBot"));
const DingTalkBotPage = React.lazy(() => import("../pages/Admin/Bot/DingTalkBot"));
const NotFoundPage = React.lazy(() => import("../pages/NotFound"));

const LoadingFallback = () => (
  <div className="flex w-full h-screen items-center justify-center">
    <Spinner size="lg" color="primary" label="Loading..." />
  </div>
);

function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route element={<BasicLayout />}>
            <Route path={routes.home} element={<HomePage />} />
            <Route path={routes.allSearch} element={<AllSearchPage />} />
            <Route path={routes.resume} element={<ResumePage />} />
            <Route path={routes.craziness} element={<CrazinessPage />} />
            <Route path={routes.tools} element={<ToolsPage />} />
            <Route path={routes.about} element={<AboutPage />} />
            <Route path={routes.profile} element={<ProfilePage />} />
            <Route path={routes.videoDetail} element={<VideoDetail />} />
            <Route path={routes.docDetail} element={<DocDetail />} />
          </Route>
          <Route element={<AdminLayout />}>
            <Route path={routes.admin} element={<AdminPage />} />
            <Route path={`${routes.admin}/analysis`} element={<AnalysisPage />} />
            <Route path={`${routes.admin}/ops/apiDoc`} element={<ApiDocPage />} />
            <Route path={`${routes.admin}/ops/systemMonitor`} element={<SystemMonitorPage />} />
            <Route path={`${routes.admin}/ops/cacheMonitor`} element={<CacheMonitorPage />} />
            <Route path={`${routes.admin}/ops/cacheList`} element={<CacheListPage />} />
            <Route path={`${routes.admin}/ops/systemLog`} element={<SystemLogPage />} />
            <Route path={`${routes.admin}/ops/userBehavior`} element={<UserBehaviorPage />} />
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
            <Route path={`${routes.admin}/document/edit/:id`} element={<DocumentEditPage />} />
            <Route path={`${routes.admin}/bot/napcat`} element={<NapCatPage />} />
            <Route path={`${routes.admin}/bot/qq`} element={<QQBotPage />} />
            <Route path={`${routes.admin}/bot/wechat`} element={<WeChatBotPage />} />
            <Route path={`${routes.admin}/bot/dingtalk`} element={<DingTalkBotPage />} />
          </Route>
          <Route element={<BlankLayout />}>
            <Route path={routes.login} element={<LoginPage />} />
            <Route path={routes.register} element={<RegisterPage />} />
            <Route path={routes.forgotPassword} element={<ForgotPasswordPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRouter;
