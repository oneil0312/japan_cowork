import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cloud, 
  CloudUpload, 
  LogIn, 
  LogOut, 
  Lock, 
  Users, 
  UserPlus, 
  Trash2, 
  Check, 
  AlertCircle, 
  Loader2, 
  ShieldCheck,
  User as UserIcon,
  Plus
} from 'lucide-react';
import { User } from 'firebase/auth';
import { loginWithGoogle, logout } from '../firebase';
import { 
  saveTripToCloud, 
  getUserTrips, 
  deleteTripFromCloud 
} from '../services/tripService';
import { TripPlan } from '../types';

interface CloudTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrip: TripPlan;
  currentUser: User | null;
  onLoadTrip: (trip: TripPlan) => void;
  onTripSaved: () => void;
  onUpdateTripMembers: (memberEmails: string[]) => void;
}

export const CloudTripsModal: React.FC<CloudTripsModalProps> = ({
  isOpen,
  onClose,
  currentTrip,
  currentUser,
  onLoadTrip,
  onTripSaved,
  onUpdateTripMembers
}) => {
  const [tab, setTab] = useState<'save' | 'trips'>('save');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [userTrips, setUserTrips] = useState<TripPlan[]>([]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New member invite input
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [memberEmails, setMemberEmails] = useState<string[]>(currentTrip.memberEmails || []);

  useEffect(() => {
    setMemberEmails(currentTrip.memberEmails || []);
  }, [currentTrip]);

  // Fetch trips for current user
  const fetchTrips = async () => {
    if (!currentUser) return;
    setIsLoadingList(true);
    setErrorMsg(null);
    try {
      const trips = await getUserTrips(currentUser);
      setUserTrips(trips);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('讀取雲端行程失敗，請檢查網路或稍後重試。');
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchTrips();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Handle Google Login
  const handleLogin = async () => {
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      setStatusMsg('登入成功！');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('登入取消或失敗：' + (err.message || '請重試'));
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout();
      setUserTrips([]);
      setStatusMsg('已登出');
    } catch (err: any) {
      console.error(err);
    }
  };

  // Add a member by email
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const email = newMemberEmail.trim().toLowerCase();
    if (!email) return;

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('請輸入有效的 Email 地址');
      return;
    }

    if (memberEmails.includes(email)) {
      setErrorMsg('該 Email 已經在成員清單中');
      return;
    }

    const updated = [...memberEmails, email];
    setMemberEmails(updated);
    onUpdateTripMembers(updated);
    setNewMemberEmail('');
    setStatusMsg(`已新增成員「${email}」，請點擊「儲存至 Firestore」套用權限變更！`);
  };

  // Remove a member
  const handleRemoveMember = (emailToRemove: string) => {
    const updated = memberEmails.filter((em) => em !== emailToRemove);
    setMemberEmails(updated);
    onUpdateTripMembers(updated);
    setStatusMsg(`已移除成員「${emailToRemove}」，請儲存以套用變更。`);
  };

  // Save current trip to cloud
  const handleSaveToCloud = async () => {
    if (!currentUser) {
      handleLogin();
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    setStatusMsg(null);

    try {
      const tripWithMembers: TripPlan = {
        ...currentTrip,
        memberEmails
      };
      await saveTripToCloud(tripWithMembers, currentUser, false);
      setStatusMsg(`行程「${currentTrip.title}」已成功儲存至 Firestore！僅本行程成員可讀寫。`);
      onTripSaved();
      await fetchTrips();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('儲存至雲端失敗：' + (err.message || '請確認權限或網路'));
    } finally {
      setIsSaving(false);
    }
  };

  // Save as new trip
  const handleSaveAsNewTrip = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      const newTrip: TripPlan = {
        ...currentTrip,
        id: `trip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: `${currentTrip.title} (新存檔)`,
        ownerId: currentUser.uid,
        ownerEmail: currentUser.email || '',
        memberEmails: currentUser.email ? [currentUser.email.toLowerCase()] : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await saveTripToCloud(newTrip, currentUser, false);
      onLoadTrip(newTrip);
      setStatusMsg(`已另存新行程「${newTrip.title}」至雲端！`);
      await fetchTrips();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('另存新行程失敗：' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete trip
  const handleDeleteCloudTrip = async (tripId: string, title: string) => {
    if (!confirm(`確定要從雲端刪除「${title}」嗎？此操作無法復原。`)) return;
    try {
      await deleteTripFromCloud(tripId);
      setStatusMsg(`已刪除「${title}」`);
      setUserTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch (err: any) {
      console.error(err);
      setErrorMsg('刪除失敗：' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#fffdf8] border border-[#d9d3c8] shadow-2xl p-6 sm:p-7 relative max-h-[92vh] flex flex-col"
        style={{ color: '#242824' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="關閉視窗"
          className="absolute top-5 right-5 p-1.5 text-[#777a74] hover:text-[#bc553b] hover:bg-[#f5f1e8] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4 pr-8">
          <div className="flex items-center gap-2 text-[11px] tracking-widest text-[#777a74] font-serif-tc uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3c5a4f]" />
            <span>MEMBER-RESTRICTED FIRESTORE STORAGE</span>
          </div>
          <h3 className="text-xl font-serif-tc font-semibold tracking-wide mt-0.5">
            雲端行程庫與成員存取權限
          </h3>
          <p className="text-xs text-[#777a74] mt-1">
            已套用 Zero-Trust 安全規則：只有登入且在此行程成員名單中的旅人才能讀取或編輯。
          </p>
        </div>

        {/* User Account Bar */}
        <div className="bg-[#f5f1e8] border border-[#d9d3c8] p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs mb-4">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || '用戶頭像'}
                  className="w-8 h-8 rounded-full border border-[#d9d3c8]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#6c91a3] text-white flex items-center justify-center font-serif-tc font-bold">
                  {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-serif-tc font-semibold text-[#242824] flex items-center gap-2">
                  <span>{currentUser.displayName || '旅行探索者'}</span>
                  <span className="text-[10px] text-[#3c5a4f] bg-[#e8eee7] px-1.5 py-0.2">已驗證登入</span>
                </div>
                <div className="text-[11px] text-[#777a74] font-mono">
                  {currentUser.email}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#777a74]">
              <Lock className="w-4 h-4 text-[#bc553b]" />
              <span>尚未登入帳號。請先登入，系統將驗證您是否為成員以開放讀寫權限。</span>
            </div>
          )}

          <div>
            {currentUser ? (
              <button
                onClick={handleLogout}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#d9d3c8] bg-white hover:text-[#bc553b] text-xs font-serif-tc transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>登出</span>
              </button>
            ) : (
              <button
                onClick={handleLogin}
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#bc553b] hover:bg-[#a64730] text-white text-xs font-serif-tc shadow-xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>使用 Google 登入</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Controls: Current Trip & Members vs My Cloud Trips */}
        <div className="flex items-center border-b border-[#d9d3c8] mb-3 text-xs font-serif-tc">
          <button
            onClick={() => setTab('save')}
            className={`py-2 px-4 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
              tab === 'save'
                ? 'border-[#bc553b] text-[#bc553b]'
                : 'border-transparent text-[#777a74] hover:text-[#242824]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>目前行程與成員權限設定</span>
          </button>
          <button
            onClick={() => setTab('trips')}
            className={`py-2 px-4 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
              tab === 'trips'
                ? 'border-[#bc553b] text-[#bc553b]'
                : 'border-transparent text-[#777a74] hover:text-[#242824]'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-[#6c91a3]" />
            <span>我能存取的雲端行程庫 ({userTrips.length})</span>
          </button>
        </div>

        {/* Tab 1: Current Trip & Member Access Control */}
        {tab === 'save' ? (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs font-sans-tc">
            {/* Trip Info Header */}
            <div className="bg-[#fffdf8] border border-[#d9d3c8] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-serif-tc text-[#777a74]">目前正在編輯的手帳：</span>
                <h4 className="font-serif-tc text-base font-semibold text-[#242824]">
                  {currentTrip.title}
                </h4>
                <p className="text-[11px] text-[#777a74] mt-0.5">
                  {currentTrip.dateRange} · {currentTrip.days.length} 天日程 · 建立者：{currentTrip.ownerEmail || currentUser?.email || '當前帳號'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSaveToCloud}
                  disabled={isSaving}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#bc553b] hover:bg-[#a64730] disabled:opacity-50 text-white font-serif-tc transition-colors shadow-xs"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CloudUpload className="w-3.5 h-3.5" />
                  )}
                  <span>{currentUser ? '儲存權限與行程至 Firestore' : '登入並儲存'}</span>
                </button>

                {currentUser && (
                  <button
                    onClick={handleSaveAsNewTrip}
                    disabled={isSaving}
                    type="button"
                    className="inline-flex items-center gap-1 px-3 py-2 border border-[#d9d3c8] bg-white hover:text-[#bc553b] font-serif-tc transition-colors"
                    title="以此行程為模板另存一份新行程"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#6c91a3]" />
                    <span>另存新檔</span>
                  </button>
                )}
              </div>
            </div>

            {/* Member Invite & Access Control Section */}
            <div className="bg-[#fffdf8] border border-[#d9d3c8] p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-serif-tc font-semibold text-sm text-[#242824] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#3c5a4f]" />
                  <span>本行程成員名單（具備讀寫權限）</span>
                </h4>
                <span className="text-[11px] text-[#777a74] font-mono">
                  {memberEmails.length + (currentTrip.ownerEmail ? 1 : 0)} 位成員
                </span>
              </div>

              <p className="text-[#777a74] text-xs leading-relaxed mb-3">
                只有在此處列出 Email 的同行夥伴在登入後才能查看與編輯這趟旅行。
              </p>

              {/* Add Member Form */}
              <form onSubmit={handleAddMember} className="flex gap-2 mb-3">
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="輸入旅伴的 Google 帳號 Email (例如 companion@gmail.com)..."
                  className="flex-1 px-3 py-1.5 bg-[#f5f1e8] border border-[#d9d3c8] text-xs focus:border-[#bc553b] focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#3c5a4f] text-white font-serif-tc hover:bg-[#2d443b] transition-colors flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>新增成員</span>
                </button>
              </form>

              {/* Members List */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {/* Trip Creator / Owner */}
                <div className="p-2 bg-[#f5f1e8] border border-[#d9d3c8] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-serif-tc bg-[#bc553b] text-white px-1.5 py-0.2">
                      建立者 / 主辦人
                    </span>
                    <span className="font-mono text-xs text-[#242824]">
                      {currentTrip.ownerEmail || currentUser?.email || '當前登入者'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#777a74]">擁有完全權限</span>
                </div>

                {/* Invited Companion Emails */}
                {memberEmails.map((email) => (
                  <div
                    key={email}
                    className="p-2 bg-white border border-[#e8e3d8] flex items-center justify-between hover:border-[#6c91a3] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-serif-tc bg-[#e8eee7] text-[#3c5a4f] px-1.5 py-0.2">
                        旅伴成員
                      </span>
                      <span className="font-mono text-xs text-[#242824]">{email}</span>
                    </div>

                    <button
                      onClick={() => handleRemoveMember(email)}
                      className="p-1 text-[#777a74] hover:text-[#bc553b] transition-colors"
                      title="移除成員權限"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {memberEmails.length === 0 && (
                  <div className="text-center py-2 text-[#9aa099] text-[11px]">
                    目前尚未新增其他同行成員，僅建立者本人可存取。
                  </div>
                )}
              </div>
            </div>

            {/* Feedback messages */}
            {statusMsg && (
              <div className="p-2.5 bg-[#f1f5f3] border border-[#3c5a4f] text-[#3c5a4f] text-xs flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 shrink-0" />
                <span>{statusMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="p-2.5 bg-[#fbf0f0] border border-[#bc553b] text-[#bc553b] text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        ) : (
          /* Tab 2: All Trips Current User is a Member of */
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 text-xs">
            {isLoadingList ? (
              <div className="py-12 text-center text-[#777a74]">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#6c91a3] mb-2" />
                <span>檢查您具備成員權限的行程中...</span>
              </div>
            ) : !currentUser ? (
              <div className="py-10 text-center text-[#777a74] bg-[#fbf9f4] border border-[#d9d3c8] p-4">
                <Lock className="w-8 h-8 text-[#bc553b] mx-auto mb-2 opacity-60" />
                <p>請先登入帳號以查看您有權限存取的雲端行程列表。</p>
                <button
                  onClick={handleLogin}
                  className="mt-3 inline-flex items-center gap-1 px-4 py-1.5 bg-[#bc553b] text-white font-serif-tc shadow-xs hover:bg-[#a64730]"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>登入帳號</span>
                </button>
              </div>
            ) : userTrips.length === 0 ? (
              <div className="py-10 text-center text-[#777a74] bg-[#fbf9f4] border border-[#d9d3c8] p-4">
                <p>您目前尚未建立或受邀為任何雲端行程的成員。</p>
                <p className="text-[11px] mt-1 text-[#9aa099]">切換到「目前行程與成員權限設定」點擊儲存，即可建立您的第一筆受保護行程！</p>
              </div>
            ) : (
              userTrips.map((t) => {
                const isCurrent = t.id === currentTrip.id;
                const isOwner = t.ownerId === currentUser.uid;
                return (
                  <div
                    key={t.id}
                    className={`border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
                      isCurrent
                        ? 'border-[#6c91a3] bg-[#f5f7f8]'
                        : 'border-[#d9d3c8] bg-white hover:border-[#6c91a3]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-serif-tc font-semibold text-sm text-[#242824]">
                          {t.title}
                        </h5>
                        {isCurrent && (
                          <span className="text-[10px] font-serif-tc text-[#6c91a3] border border-[#6c91a3] px-1">
                            目前開啟
                          </span>
                        )}
                        <span className="text-[10px] text-[#3c5a4f] bg-[#e8eee7] px-1.5 py-0.2">
                          {isOwner ? '我是建立者' : '受邀成員'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#777a74] mt-0.5">
                        {t.dateRange} · {t.days.length} 天日程 · 成員數：{(t.memberEmails?.length || 0) + 1} 人
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          onLoadTrip(t);
                          setStatusMsg(`已成功載入「${t.title}」！`);
                          onClose();
                        }}
                        className="px-3 py-1 bg-white border border-[#d9d3c8] hover:border-[#bc553b] hover:text-[#bc553b] font-serif-tc"
                      >
                        載入行程
                      </button>
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteCloudTrip(t.id, t.title)}
                          className="p-1 text-[#777a74] hover:text-[#bc553b] border border-[#d9d3c8] bg-white"
                          title="從雲端刪除（僅建立者可刪除）"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[#d9d3c8] flex items-center justify-between text-xs text-[#777a74] font-serif-tc">
          <span className="flex items-center gap-1 text-[#3c5a4f]">
            <Lock className="w-3 h-3" />
            <span>已強制套用：僅登入之行程成員才能讀寫</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#f5f1e8] border border-[#d9d3c8] hover:text-[#242824]"
          >
            完成並關閉
          </button>
        </div>
      </div>
    </div>
  );
};
