// ===== 1. 依赖导入区域 =====
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Avatar, 
  Button, 
  Chip, 
  Tabs, 
  Tab,
  Card,
  CardBody,
  addToast
} from "@heroui/react";
import { 
  FiUserPlus, 
  FiGrid, 
  FiHeart,
  FiPlayCircle,
  FiFileText,
  FiPlay,
  FiEye
} from "react-icons/fi";
import { useUserStore } from "../../store";
import { 
  fetchUserProfile, 
  fetchUserWorks, 
  fetchUserFavorites,
  toggleFollowUser,
  type UserProfile,
  type UserWorkItem
} from "../../api/front/user";
import { routes } from "../../router/routes";
import Loading from "../../components/Loading";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
function UserDetail() {
  /** 路由参数ID */
  const { id } = useParams();
  /** 路由跳转导航 */
  const navigate = useNavigate();
  /** 用户Token */
  const { token } = useUserStore();
  
  /** 用户基本资料 */
  const [user, setUser] = useState<UserProfile | null>(null);
  /** 用户作品列表 */
  const [works, setWorks] = useState<UserWorkItem[]>([]);
  /** 用户收藏列表 */
  const [favorites, setFavorites] = useState<UserWorkItem[]>([]);
  /** 页面整体加载状态 */
  const [isLoading, setIsLoading] = useState(true);
  /** 作品列表加载状态 */
  const [isWorksLoading, setIsWorksLoading] = useState(true);
  /** 收藏列表加载状态 */
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(false);
  /** 当前激活的标签页 */
  const [activeTab, setActiveTab] = useState("home");

  // ===== 4. 通用工具函数区域 =====
  /**
   * 检查用户是否登录
   * @returns 是否已登录
   */
  const handleCheckLogin = () => {
    if (!token) {
      addToast({ title: "请先登录", color: "warning" });
      return false;
    }
    return true;
  };


  // ===== 5. 注释代码函数区 =====

  // ===== 6. 错误处理函数区域 =====

  // ===== 7. 数据处理函数区域 =====
  /**
   * 获取用户资料详情
   */
  const handleFetchProfile = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await fetchUserProfile(id);
      setUser(res);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  /**
   * 获取用户作品列表
   */
  const handleFetchWorks = useCallback(async () => {
    if (!id) return;
    setIsWorksLoading(true);
    try {
      const res = await fetchUserWorks(id, { page: 1, pageSize: 10 });
      setWorks(res.list);
    } finally {
      setIsWorksLoading(false);
    }
  }, [id]);

  /**
   * 获取用户收藏列表
   */
  const handleFetchFavorites = useCallback(async () => {
    if (!id) return;
    setIsFavoritesLoading(true);
    try {
      const res = await fetchUserFavorites(id, { page: 1, pageSize: 10 });
      setFavorites(res.list);
    } finally {
      setIsFavoritesLoading(false);
    }
  }, [id]);

  /**
   * 处理作品点击跳转
   * @param work 作品项
   */
  const handleWorkClick = (work: UserWorkItem) => {
    if (work.type === "video") {
      navigate(routes.videoDetail.replace(":id", work.id));
    } else {
      navigate(routes.docDetail.replace(":id", work.id));
    }
  };

  /**
   * 处理关注/取消关注操作
   */
  const handleFollow = async () => {
    if (!handleCheckLogin() || !user) return;
    
    const newIsFollowing = !user.isFollowing;
      const res = await toggleFollowUser(user.id);
      
      if (res) {
        setUser(prev => prev ? { 
          ...prev, 
          isFollowing: newIsFollowing,
          stats: {
            ...prev.stats,
            followers: prev.stats.followers + (newIsFollowing ? 1 : -1)
          }
        } : null);

        addToast({ 
          title: newIsFollowing ? "关注成功" : "已取消关注", 
          color: newIsFollowing ? "success" : "warning" 
        });
      }

  };

  // ===== 8. UI渲染逻辑区域 =====
  /**
   * 渲染作品卡片列表
   * @param items 作品列表
   * @param type 过滤类型
   */
  const renderWorkList = (items: UserWorkItem[], type?: string) => {
    const filteredItems = type ? items.filter(w => w.type === type) : items;
    
    if (filteredItems.length === 0) {
      return (
        <div className="text-center py-8 text-[var(--text-color-secondary)] text-sm italic">
          暂无{type === 'video' ? '视频' : type === 'article' ? '文档' : ''}内容
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredItems.map(work => {
          const isVideo = work.type === "video";
          const thumbnail = work.coverUrl || (isVideo ? "/DefaultImage/MyDefaultHomeVodie.png" : "/DefaultImage/MyDefaultImage.jpg");
          
          return (
            <motion.article
              key={work.id}
              className="group flex flex-col gap-2 cursor-pointer"
              onClick={() => handleWorkClick(work)}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
            >
              <div className="relative aspect-video overflow-hidden rounded-[var(--radius-base)] bg-black/40">
                <img
                  src={thumbnail}
                  alt={work.title}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
                  onError={e => {
                    e.currentTarget.src = isVideo ? "/DefaultImage/MyDefaultHomeVodie.png" : "/DefaultImage/MyDefaultImage.jpg";
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-2.5 pb-1.5 text-[10px] text-white">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-0.5 bg-black/60 px-1.5 py-0.5 rounded">
                      {isVideo ? <FiPlay className="w-3 h-3" /> : <FiEye className="w-3 h-3" />}
                      <span>{work.views}</span>
                    </span>
                  </div>
                  <span className="rounded bg-black/80 px-1.5 py-0.5">
                    {work.createdAt}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="line-clamp-2 text-xs font-semibold md:text-sm">
                  {work.title}
                </h3>
              </div>
            </motion.article>
          );
        })}
      </div>
    );
  };

  // ===== 9. 页面初始化与事件绑定 =====
  useEffect(() => {
    if (id) {
      window.scrollTo(0, 0);
      setActiveTab("home");
      handleFetchProfile();
    }
  }, [id, handleFetchProfile]);

  useEffect(() => {
    if (id && (activeTab === "home" || activeTab === "videos")) {
      handleFetchWorks();
    }
  }, [id, activeTab, handleFetchWorks]);

  useEffect(() => {
    if (id && activeTab === "favlist") {
      handleFetchFavorites();
    }
  }, [id, activeTab, handleFetchFavorites]);

  if (isLoading) {
    return <Loading height="calc(100vh - 200px)" />;
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)] text-[var(--text-color-secondary)]">
        用户未找到
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      <div className="container mx-auto px-4 pt-10">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="shrink-0 flex justify-center md:justify-start">
            <div className="relative rounded-full p-1 bg-[var(--bg-color)]">
              <Avatar 
                src={user.avatar} 
                name={user.name.charAt(0)} 
                className="w-24 h-24 md:w-32 md:h-32 text-2xl md:text-4xl"
              />
            </div>
          </div>

          <div className="flex-1 pt-2 md:pt-4 text-center md:text-left space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
                  {user.name}
                </h1>
                <p className="text-sm text-[var(--text-color-secondary)] mt-1 max-w-2xl mx-auto md:mx-0">
                  {user.bio || "这个人很懒，什么都没有写~"}
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-6 md:gap-8">
                <div className="text-center cursor-pointer hover:text-[var(--primary-color)] transition-colors">
                  <div className="font-bold text-lg">{user.stats.followers}</div>
                  <div className="text-xs text-[var(--text-color-secondary)]">粉丝</div>
                </div>
                <div className="text-center cursor-pointer hover:text-[var(--primary-color)] transition-colors">
                  <div className="font-bold text-lg">{user.stats.following}</div>
                  <div className="text-xs text-[var(--text-color-secondary)]">关注</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{user.stats.likes}</div>
                  <div className="text-xs text-[var(--text-color-secondary)]">获赞</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {user.tags?.map(tag => (
                  <Chip key={tag} size="sm" variant="flat" color="primary" className="text-xs">
                    {tag}
                  </Chip>
                ))}
              </div>

              <div className="flex justify-center gap-3">
                <Button 
                  color="primary" 
                  variant={user.isFollowing ? "flat" : "solid"}
                  className={user.isFollowing ? "bg-[var(--bg-elevated)] text-[var(--text-color-secondary)] w-32" : "w-32"}
                  startContent={!user.isFollowing && <FiUserPlus />}
                  onClick={handleFollow}
                >
                  {user.isFollowing ? "已关注" : "关注"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-b border-[var(--border-color)]">
          <Tabs 
            variant="underlined" 
            aria-label="User Sections"
            classNames={{
              tabList: "gap-6 p-0",
              cursor: "w-full bg-[var(--primary-color)]",
              tab: "max-w-fit px-0 h-12",
              tabContent: "group-data-[selected=true]:text-[var(--primary-color)] font-medium text-base"
            }}
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
          >
            <Tab 
              key="home" 
              title={
                <div className="flex items-center gap-2">
                  <FiGrid />
                  <span>主页</span>
                </div>
              } 
            />
            <Tab 
              key="videos" 
              title={
                <div className="flex items-center gap-2">
                  <FiPlayCircle />
                  <span>投稿</span>
                  <span className="text-xs bg-[var(--bg-elevated)] px-1.5 rounded-full">{user.stats.works}</span>
                </div>
              } 
            />
            <Tab 
              key="favlist" 
              title={
                <div className="flex items-center gap-2">
                  <FiHeart />
                  <span>收藏</span>
                </div>
              } 
            />
          </Tabs>
        </div>

        <div className="py-6">
          {activeTab === "home" && (
            <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">最近投稿</h3>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="light" onClick={() => setActiveTab("videos")}>查看更多</Button>
                  </div>
                </div>
                
                {isWorksLoading ? (
                  <Loading height="200px" spinnerSize="md" />
                ) : renderWorkList(works.slice(0, 4))}
              </div>

              <div className="space-y-4">
                <Card shadow="sm" className="bg-[var(--bg-elevated)]">
                  <CardBody className="gap-3">
                    <h3 className="font-bold text-sm">公告</h3>
                    <p className="text-sm text-[var(--text-color-secondary)] leading-relaxed">
                      欢迎来到我的个人空间！这里会不定期更新前端技术分享和生活随笔。
                      <br /><br />
                      业务合作请私信。
                    </p>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "videos" && (
            <div className="space-y-8">
              <section>
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-lg flex items-center gap-2">
                     <FiPlayCircle /> 视频投稿
                   </h3>
                 </div>
                 {isWorksLoading ? (
                   <Loading className="py-12" spinnerSize="md" height="auto" />
                 ) : renderWorkList(works, 'video')}
               </section>

               <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <FiFileText /> 文档专栏
                    </h3>
                  </div>
                  {isWorksLoading ? (
                     <Loading className="py-12" spinnerSize="md" height="auto" />
                   ) : renderWorkList(works, 'document')}
               </section>
            </div>
          )}

          {activeTab === "favlist" && (
             <div className="space-y-4">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-lg flex items-center gap-2">
                   <FiHeart /> 收藏列表
                 </h3>
               </div>
               {isFavoritesLoading ? (
                 <Loading className="py-12" spinnerSize="md" height="auto" />
               ) : renderWorkList(favorites)}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
export default UserDetail;
