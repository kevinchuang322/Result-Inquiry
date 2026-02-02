// app/page.js
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-8">
          學生公告與成績查詢系統
        </h1>
        
        <div className="grid gap-6">
          {announcements?.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <h2 className="text-xl font-bold text-gray-800">{item.title}</h2>
              <p className="text-gray-600 mt-2">{item.content}</p>
              <p className="text-sm text-gray-400 mt-4">
                發佈時間：{new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
          {(!announcements || announcements.length === 0) && (
            <p className="text-center text-gray-500">目前尚無公告</p>
          )}
        </div>
      </div>
    </div>
  )
}
