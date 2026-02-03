"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 建立 Supabase 連線 (這裡會直接讀取你設定在 Vercel 的環境變數)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function Home() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getAnnouncements() {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("讀取失敗:", error);
      } else {
        setAnnouncements(data || []);
      }
      setLoading(false);
    }
    getAnnouncements();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue-700 text-center">學生公告系統</h1>
        
        {loading ? (
          <p className="text-center text-gray-500">載入中...</p>
        ) : (
          <div className="space-y-4">
            {announcements.map((item) => (
              <div key={item.id} className="p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <h2 className="font-bold text-xl text-gray-900 mb-2">{item.title}</h2>
                <p className="text-gray-600 leading-relaxed">{item.content}</p>
                <p className="text-xs text-gray-400 mt-4">
                  發佈於：{new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
            {announcements.length === 0 && (
              <div className="text-center p-12 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-400">目前尚無公告內容</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
