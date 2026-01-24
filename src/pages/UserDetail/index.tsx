import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Avatar, 
  Button, 
  Chip, 
  Tabs, 
  Tab,
  Card,
  CardBody
} from "@heroui/react";
import { 
  FiUserPlus, 
  FiGrid, 
  FiHeart,
  FiPlayCircle,
  FiFileText,
  FiLock,
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
import { addToast } from "@heroui/react";
import Loading from "../../components/Loading";
import { mockUserProfile, mockUserWorks, mockUserFavorites } from "../../api/mock/front/userDetail";

function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useUserStore();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [works, setWorks] = useState<UserWorkItem[]>([]);
  const [favorites, setFavorites] = useState<UserWorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [worksLoading, setWorksLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  // Fetch User Profile
  useEffect(() => {
    if (id) {
      window.scrollTo(0, 0);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab("home");
      setLoading(true);
      fetchUserProfile(id)
        .then(res => {
          if (!res || !res.id) {
            setUser(mockUserProfile);
          } else {
            setUser(res);
          }
        })
        .catch(err => {
          console.error("Fetch profile failed, using mock:", err);
          setUser(mockUserProfile);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Fetch Works (for Home and Videos tab)
  useEffect(() => {
     if (id && (activeTab === "home" || activeTab === "videos")) {
       // eslint-disable-next-line react-hooks/set-state-in-effect
       setWorksLoading(true);
       fetchUserWorks(id, { page: 1, pageSize: 10 })
        .then(worksRes => {
          if (!worksRes || !worksRes.list || worksRes.list.length === 0) {
            setWorks(mockUserWorks);
          } else {
            setWorks(worksRes.list);
          }
        })
        .catch(err => {
          console.error("Fetch works failed, using mock:", err);
          setWorks(mockUserWorks);
        })
        .finally(() => setWorksLoading(false));
    }
  }, [id, activeTab]);

  // Fetch Favorites (for Favlist tab)
  useEffect(() => {
     if (id && activeTab === "favlist") {
       // eslint-disable-next-line react-hooks/set-state-in-effect
       setFavoritesLoading(true);
       fetchUserFavorites(id, { page: 1, pageSize: 10 })
        .then(favRes => {
          if (!favRes || !favRes.list || favRes.list.length === 0) {
            setFavorites(mockUserFavorites);
          } else {
            setFavorites(favRes.list);
          }
        })
        .catch(err => {
          console.error("Fetch favorites failed, using mock:", err);
          setFavorites(mockUserFavorites);
        })
        .finally(() => setFavoritesLoading(false));
    }
  }, [id, activeTab]);

  const checkLogin = () => {
    if (!token) {
      addToast({ title: "请先登录", color: "warning" });
      return false;
    }
    return true;
  };

  const handleFollow = async () => {
    if (!checkLogin() || !user) return;
    
    const newIsFollowing = !user.isFollowing;
    
    try {
      await toggleFollowUser(user.id);
      
      // Update UI after success
      setUser(prev => prev ? { 
        ...prev, 
        isFollowing: newIsFollowing,
        stats: {
          ...prev.stats,
          followers: prev.stats.followers + (newIsFollowing ? 1 : -1)
        }
      } : null);

      if (newIsFollowing) {
        addToast({ title: "关注成功", color: "success" });
      } else {
        addToast({ title: "已取消关注", color: "warning" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleWorkClick = (work: UserWorkItem) => {
    if (work.type === "video") {
      navigate(routes.videoDetail.replace(":id", work.id));
    } else {
      navigate(routes.docDetail.replace(":id", work.id));
    }
  };

  if (loading) {
    return (
      <Loading height="calc(100vh - 200px)" />
    );
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
      {/* User Info Section */}
      <div className="container mx-auto px-4 pt-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="shrink-0 flex justify-center md:justify-start">
            <div className="relative rounded-full p-1 bg-[var(--bg-color)]">
              <Avatar 
                src={user.avatar} 
                name={user.name.charAt(0)} 
                className="w-24 h-24 md:w-32 md:h-32 text-2xl md:text-4xl"
              />
            </div>
          </div>

          {/* Info & Actions */}
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
              
              {/* Stats */}
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

            {/* Tags & Actions */}
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

        {/* Navigation Tabs */}
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
            onSelectionChange={(key) => {
              const newTab = key as string;
              setActiveTab(newTab);
              if (newTab === "home" || newTab === "videos") {
                setWorksLoading(true);
              } else if (newTab === "favlist") {
                setFavoritesLoading(true);
              }
            }}
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

        {/* Content Area */}
        <div className="py-6">
          {activeTab === "home" && (
            <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
              {/* Left Column: Recent Works */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">最近投稿</h3>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="light" onClick={() => setActiveTab("videos")}>查看更多</Button>
                  </div>
                </div>
                
                {worksLoading ? (
                  <Loading height="200px" spinnerSize="md" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {works.slice(0, 4).map(work => {
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
                              loading="lazy"
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
                )}
              </div>

              {/* Right Column: User Sidebar (Announcements, etc.) */}
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
                
                {/* Removed Personal Achievements card as requested */}
              </div>
            </div>
          )}

          {activeTab === "videos" && (
            <div className="space-y-8">
              {/* Videos Section */}
              <section>
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-lg flex items-center gap-2">
                     <FiPlayCircle /> 视频投稿
                   </h3>
                 </div>
                 {worksLoading ? (
                   <Loading className="py-12" spinnerSize="md" height="auto" />
                 ) : works.filter(w => w.type === 'video').length > 0 ? (
                   <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                     {works.filter(w => w.type === 'video').map(work => (
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
                              src={work.coverUrl || "/DefaultImage/MyDefaultHomeVodie.png"}
                              alt={work.title}
                              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
                              loading="lazy"
                            />
                            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-2.5 pb-1.5 text-[10px] text-white">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-0.5 bg-black/60 px-1.5 py-0.5 rounded">
                                  <FiPlay className="w-3 h-3" />
                                  <span>{work.views}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <h3 className="line-clamp-2 text-xs font-semibold md:text-sm">
                              {work.title}
                            </h3>
                            <p className="line-clamp-1 text-[11px] text-[var(--text-color-secondary)]">
                              {work.createdAt}
                            </p>
                          </div>
                        </motion.article>
                     ))}
                   </div>
                  ) : (
                    <div className="text-center py-8 text-[var(--text-color-secondary)] text-sm italic">
                      暂无视频投稿
                    </div>
                  )}
               </section>

               {/* Documents Section */}
               <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <FiFileText /> 文档专栏
                    </h3>
                  </div>
                  {worksLoading ? (
                     <Loading className="py-12" spinnerSize="md" height="auto" />
                   ) : works.filter(w => w.type !== 'video').length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {works.filter(w => w.type !== 'video').map(work => (
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
                               src={work.coverUrl || "/DefaultImage/MyDefaultImage.jpg"}
                               alt={work.title}
                               className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
                               loading="lazy"
                             />
                             <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-2.5 pb-1.5 text-[10px] text-white">
                               <div className="flex items-center gap-2">
                                 <span className="inline-flex items-center gap-0.5 bg-black/60 px-1.5 py-0.5 rounded">
                                   <FiEye className="w-3 h-3" />
                                   <span>{work.views}</span>
                                 </span>
                               </div>
                             </div>
                           </div>
                           <div className="flex flex-col gap-1">
                             <h3 className="line-clamp-2 text-xs font-semibold md:text-sm">
                               {work.title}
                             </h3>
                             <p className="line-clamp-1 text-[11px] text-[var(--text-color-secondary)]">
                               {work.createdAt}
                             </p>
                           </div>
                         </motion.article>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-[var(--text-color-secondary)] text-sm italic">
                      暂无文档投稿
                    </div>
                  )}
               </section>
            </div>
          )}

          {activeTab === "favlist" && (
             <div className="space-y-4">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-lg flex items-center gap-2">
                   <FiHeart className="text-danger" /> 我的收藏
                 </h3>
               </div>
               {favoritesLoading ? (
                 <Loading height="300px" spinnerSize="md" />
               ) : favorites.length > 0 ? (
                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                   {favorites.map(item => {
                     const isVideo = item.type === "video";
                     const thumbnail = item.coverUrl || (isVideo ? "/DefaultImage/MyDefaultHomeVodie.png" : "/DefaultImage/MyDefaultImage.jpg");
                     
                     return (
                       <motion.article
                         key={item.id}
                         className="group flex flex-col gap-2 cursor-pointer"
                         onClick={() => handleWorkClick(item)}
                         whileHover={{ y: -4, scale: 1.02 }}
                         whileTap={{ scale: 0.98 }}
                         transition={{ type: "spring", stiffness: 420, damping: 32 }}
                       >
                         <div className="relative aspect-video overflow-hidden rounded-[var(--radius-base)] bg-black/40">
                           <img
                             src={thumbnail}
                             alt={item.title}
                             className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
                             loading="lazy"
                           />
                           <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-2.5 pb-1.5 text-[10px] text-white">
                             <div className="flex items-center gap-2">
                               <span className="inline-flex items-center gap-0.5 bg-black/60 px-1.5 py-0.5 rounded">
                                 {isVideo ? <FiPlay className="w-3 h-3" /> : <FiEye className="w-3 h-3" />}
                                 <span>{item.views}</span>
                               </span>
                             </div>
                             <span className="rounded bg-black/80 px-1.5 py-0.5">
                               {item.createdAt}
                             </span>
                           </div>
                         </div>
                         <div className="flex flex-col gap-1">
                           <h3 className="line-clamp-2 text-xs font-semibold md:text-sm">
                             {item.title}
                           </h3>
                         </div>
                       </motion.article>
                     );
                   })}
                 </div>
               ) : !favoritesLoading && (
                 <div className="flex flex-col items-center justify-center py-20 text-[var(--text-color-secondary)]">
                   <div className="text-4xl mb-4 opacity-20"><FiLock /></div>
                   <p>暂无收藏内容或列表已隐藏</p>
                 </div>
               )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDetail;
