'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function AnnouncementDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [item, setItem] = useState(null)

  useEffect(() => {
    const fetchDetail = async () => {
      const { data } = await supabase.from('campus_announcements').select('*').eq('id', id).single()
      setItem(data)
    }
    fetchDetail()
  }, [id])

  // --- 優化後的偵測網址函式 ---
  const renderContent = (content) => {
    if (!content) return null;
    
    // 改進的 Regex：捕捉 http/https 網址，但不包含末尾的標點符號 (如 . , ! ? 。 ，)
    const urlRegex = /(https?:\/\/[^\s]+?(?=[,.!?:;。，！？]?(?:\s|$)))/g;
    
    // 使用 split 同時保留分隔符（網址）
    const parts = content.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(/^https?:\/\//)) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:text-blue-800 underline underline-offset-4 font-medium break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  if (!item) return <div className="p-10 text-center text-xs text-slate-400">載入中...</div>

  return (
    <div className="min-h-screen bg-white p-8 md:p-20 font-light text-slate-600">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="mb-10 text-[10px] text-slate-400 font-bold tracking-widest uppercase hover:text-blue-600 transition-colors">← Back to list</button>
        
        <div className="mb-8">
          <span className="text-[10px] bg-blue-600 text-white px-3 py-1 rounded-full font-bold uppercase tracking-widest">{item.category}</span>
          <h1 className="text-3xl font-normal text-slate-800 mt-6 mb-4 leading-tight">{item.title}</h1>
          <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Published: {new Date(item.created_at).toLocaleString()}</p>
        </div>

        <div className="h-[1px] bg-slate-100 mb-10"></div>

        <div 
          className="text-slate-600 leading-relaxed text-sm md:text-base mb-16 min-h-[200px]"
          style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        >
          {renderContent(item.content)}
        </div>

        {item.file_url && (
          <div className="mt-12 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attachment</p>
                <p className="text-xs text-slate-700 font-bold mt-1">相關附件下載</p>
              </div>
            </div>
            <a href={item.file_url} target="_blank" rel="noreferrer" className="w-full md:w-auto text-center bg-slate-900 text-white px-8 py-3 rounded-xl text-[10px] font-bold tracking-widest hover:bg-blue-600 transition-all shadow-lg">DOWNLOAD</a>
          </div>
        )}
      </div>
    </div>
  )
}