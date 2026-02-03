"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('announcement'); // 切換 公告/成績
  
  // 公告狀態
  const [announcements, setAnnouncements] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // 成績狀態
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [subject, setSubject] = useState('');
  const [score, setScore] = useState('');

  // 登入處理
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '5246065') {
      setIsLoggedIn(true);
      fetchAnnouncements();
    } else {
      alert('密碼錯誤！');
    }
  };

  // 登出處理
  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword(''); // 登出時清空密碼
  };

  // 獲取公告列表
  async function fetchAnnouncements() {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    setAnnouncements(data || []);
  }

  // 上傳公告
  async function handleAddAnnouncement() {
    if (!newTitle || !newContent) return alert('請填寫完整公告內容');
    const { error } = await supabase
      .from('announcements')
      .insert([{ title: newTitle, content: newContent }]);
    
    if (error) alert('新增失敗');
    else {
      alert('公告已發佈');
      setNewTitle('');
      setNewContent('');
      fetchAnnouncements();
    }
  }

  // 上傳成績
  async function handleAddScore() {
    if (!studentId || !studentName || !subject || !score) return alert('請填寫完整成績資料');
    const { error } = await supabase
      .from('scores')
      .insert([{ 
        student_id: studentId, 
        student_name: studentName, 
        subject: subject, 
        score: parseInt(score) 
      }]);
    
    if (error) {
      console.error(error);
      alert('成績上傳失敗，請檢查資料表欄位名稱');
    } else {
      alert('成績已成功上傳');
      setStudentId('');
      setStudentName('');
      setSubject('');
      setScore('');
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-black p-4">
        <form onSubmit={handleLogin} className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
          <h1 className="text-3xl font-bold mb-6 text-center text-white tracking-wider">系統管理員</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/10 border border-white/20 p-3 mb-6 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="請輸入管理密碼"
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg">
            登入後台系統
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* 導航欄 */}
      <nav className="bg-white border-b border-zinc-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-black text-zinc-900 tracking-tighter uppercase">Admin Panel</h1>
        <button onClick={handleLogout} className="text-sm font-medium text-zinc-500 hover:text-red-600 transition-colors">
          安全登出
        </button>
      </nav>

      <div className="max-w-5xl mx-auto p-6 md:p-10">
        {/* 功能切換按鈕 */}
        <div className="flex gap-2 mb-8 bg-zinc-200/50 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('announcement')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'announcement' ? 'bg-white text-blue-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            發佈公告
          </button>
          <button 
            onClick={() => setActiveTab('score')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'score' ? 'bg-white text-blue-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            上傳成績
          </button>
        </div>

        {activeTab === 'announcement' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* 上傳公告區塊 */}
            <section className="bg-white p-8 rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100">
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">發佈新公告</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="公告標題 (例如：112學年度第二次段考通知)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border-zinc-200 border p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <textarea
                  placeholder="公告內容詳細說明..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full border-zinc-200 border p-4 rounded-2xl h-40 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <button onClick={handleAddAnnouncement} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl transition-all">
                  確認發佈公告
                </button>
              </div>
            </section>

            {/* 公告列表管理 */}
            <section>
              <h3 className="text-lg font-bold text-zinc-900 mb-4 px-2">現有公告清單</h3>
              <div className="grid gap-4">
                {announcements.map((item) => (
                  <div key={item.id} className="bg-white p-5 rounded-2xl border border-zinc-100 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-zinc-800">{item.title}</h4>
                      <p className="text-zinc-400 text-xs mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {/* 上傳成績區塊 */}
            <section className="bg-white p-8 rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100">
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">學生積分上傳</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="學號 (如: 110001)"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="border-zinc-200 border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="學生姓名"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="border-zinc-200 border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="科目 (如: 數學)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="border-zinc-200 border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="分數"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="border-zinc-200 border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  onClick={handleAddScore} 
                  className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200"
                >
                  確認上傳成績
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
