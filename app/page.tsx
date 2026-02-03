"use client"; // 這行必須是第 1 行，上方不能有任何東西

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 直接在頁面內初始化 Supabase 避免路徑錯誤
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAnnouncements(data || []);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnouncements();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">學生公告系統</h1>
          <Link href="/search" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            成績查詢
          </Link>
        </header>

        {loading ? (
          <div className="text-center py-10">載入中...</div>
        ) : (
          <div className="grid gap-6">
            {announcements.map((item: any) => (
              <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h2>
                <p className="text-gray-600">{item.content}</p>
                <div className="mt-4 text-sm text-gray-400">
                  發佈於: {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="text-center text-gray-500 py-10">目前尚無公告</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
