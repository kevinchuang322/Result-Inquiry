"use client"; // 確保這行在第 1 行

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function Home() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnnouncements() {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      setAnnouncements(data || []);
      setLoading(false);
    }
    fetchAnnouncements();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-8">學生公告與查詢系統</h1>
        {loading ? <p>載入中...</p> : (
          <div className="grid gap-4 text-left">
            {announcements.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-lg shadow border">
                <h2 className="text-xl font-bold">{item.title}</h2>
                <p className="text-gray-600 mt-2">{item.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
