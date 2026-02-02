export const dynamic = 'force-dynamic'

'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SearchPage() {
  const router = useRouter()
  // --- A. 查詢表單狀態 (移除 student_name) ---
  const [formData, setFormData] = useState({ student_id: '', password: '' })
  
  // --- B. 公告狀態 ---
  const [announcements, setAnnouncements] = useState([])
  const [loadingAnnos, setLoadingAnnos] = useState(true)

  // 1. 初始化：載入公告列表
  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from('campus_announcements')
        .select('*')
        .order('created_at', { ascending: false })
      setAnnouncements(data || [])
      setLoadingAnnos(false)
    }
    fetchAnnouncements()
  }, [])

  // 2. 查詢提交邏輯
  const handleSearch = (e) => {
    e.preventDefault()
    if (!formData.student_id || !formData.password) return alert('請完整輸入學號與密碼')
    // 直接帶入參數跳轉
    router.push(`/search/${formData.student_id}?pwd=${formData.password}`)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-12 px-4 font-light text-slate-600">
      
      {/* --- 查詢登入區 --- */}
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 p-10 mb-16 border border-slate-50">
        <header className="text-center mb-10">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-[10px] font-bold text-blue-500 tracking-[0.4em] uppercase mb-2">Student Portal</h2>
          <h1 className="text-2xl font-normal text-slate-800 tracking-tight">成績查詢系統</h1>
        </header>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 ml-4 uppercase tracking-widest">Student ID</label>
            <input 
              type="text" 
              placeholder="請輸入學號" 
              className="w-full bg-slate-50 p-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 transition-all border border-transparent focus:border-blue-100"
              value={formData.student_id}
              onChange={(e) => setFormData({...formData, student_id: e.target.value})}
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 ml-4 uppercase tracking-widest">Password</label>
            <input 
              type="password" 
              placeholder="請輸入密碼" 
              className="w-full bg-slate-50 p-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 transition-all border border-transparent focus:border-blue-100"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-xs tracking-[0.2em] shadow-lg shadow-slate-200 hover:bg-blue-600 transition-all active:scale-[0.98] mt-6"
          >
            LOGIN / 進入查詢
          </button>
        </form>
      </div>

      {/* --- 校園公告區 --- */}
      <div className="w-full max-w-2xl px-2">
        <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
          <h2 className="text-sm font-bold text-slate-800 tracking-widest uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            Campus Announcements / 校園公告
          </h2>
          <span className="text-[10px] text-slate-400 font-mono tracking-tighter">Updated: {new Date().toLocaleDateString()}</span>
        </div>

        <div className="space-y-4">
          {loadingAnnos ? (
            <div className="text-center py-10 text-xs text-slate-400 animate-pulse tracking-widest uppercase">Loading announcements...</div>
          ) : announcements.length > 0 ? (
            announcements.map((item) => (
              <Link href={`/announcement/${item.id}`} key={item.id} className="block group">
                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all flex items-center gap-6">
                  {/* 日期區 */}
                  <div className="text-center min-w-[60px] border-r border-slate-100 pr-4">
                    <p className="text-[10px] text-slate-400 font-mono uppercase">
                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p className="text-lg font-bold text-slate-700 leading-none">
                      {new Date(item.created_at).getDate()}
                    </p>
                  </div>

                  {/* 內容區 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        item.category === '緊急' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                      }`}>
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <div className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="bg-white/50 p-12 rounded-[2rem] border border-dashed border-slate-200 text-center">
              <p className="text-xs text-slate-400 italic tracking-widest">目前尚無公告事項</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
