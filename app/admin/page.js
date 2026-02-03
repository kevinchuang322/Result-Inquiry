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
  const [announcements, setAnnouncements] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // 登入處理
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '5246065') { // 已修改為指定密碼
      setIsLoggedIn(true);
      fetchAnnouncements();
    } else {
      alert('密碼錯誤！');
    }
  };

  // 登出處理
  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword(''); // 登出時清空密碼欄位
  };

  // 獲取公告
  async function fetchAnnouncements() {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    setAnnouncements(data || []);
  }

  // 新增公告
  async function handleAdd() {
    if (!newTitle || !newContent) return alert('請填寫標題與內容');
    const { error } = await supabase
      .from('announcements')
      .insert([{ title: newTitle, content: newContent }]);
    
    if (error) alert('新增失敗');
    else {
      setNewTitle('');
      setNewContent('');
      fetchAnnouncements();
    }
  }

  // 刪除公告
  async function handleDelete(id) {
    if (!confirm('確定要刪除嗎？')) return;
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) alert('刪除失敗');
    else fetchAnnouncements();
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-center">管理員登入</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full mb-4 rounded"
            placeholder="請輸入管理密碼"
          />
          <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700">
            登入
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">公告管理後台</h1>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            登出
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">新增公告</h2>
          <input
            type="text"
            placeholder="公告標題"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="border p-2 w-full mb-4 rounded"
          />
          <textarea
            placeholder="公告內容"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="border p-2 w-full mb-4 rounded h-32"
          />
          <button onClick={handleAdd} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
            發佈公告
          </button>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">現有公告列表</h2>
          {announcements.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded border flex justify-between items-center">
              <div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.content.substring(0, 50)}...</p>
              </div>
              <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline">
                刪除
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
