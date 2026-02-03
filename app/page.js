"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- 防崩潰設定：即使環境變數暫時缺失，也提供預設值讓 Build 順利通過 ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAnnouncements() {
      // 如果還在 placeholder 狀態，先不執行抓取
      if (supabaseUrl.includes('placeholder')) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: supabaseError } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;
        setAnnouncements(data || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('無法載入公告，請檢查資料庫連線或環境變數設定。');
      } finally {
        setLoading(false);
      }
    }
    fetchAnnouncements();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">
            學生公告系統
          </h1>
          <div className="flex gap-3">
            <a 
              href="/search" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full transition-all shadow-md"
            >
              成績查詢
            </a>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-500">載入公告中...</span>
          </div>
        ) : (
          <div className="grid gap-6">
            {announcements.map((item) => (
              <article 
                key={item.id} 
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-bold text-gray-800">{item.title}</h2>
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">最新消息</span>
                </div>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {item.content}
                </p>
                <div className="mt-5 pt-4 border-t border-gray-50 text-sm text-gray-400">
                  發佈日期：{new Date(item.created_at).toLocaleDateString('zh-TW')}
                </div>
              </article>
            ))}

            {announcements.length === 0 && !error && (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 text-lg">目前尚無公告內容</p>
              </div>
            )}
          </div>
        )}
        
        <footer className="mt-12 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} 學生管理系統 
        </footer>
      </div>
    </div>
  );
}
