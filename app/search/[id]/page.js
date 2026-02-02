'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

export default function ResultPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const pwd = searchParams.get('pwd')
  const router = useRouter()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const subjectConfig = {
    "國文": { interval: 5.29000 }, "英文": { interval: 6.17067 },
    "數學A": { interval: 6.12667 }, "數學B": { interval: 6.29000 },
    "社會": { interval: 7.68933 }, "自然": { interval: 7.87467 }
  }

  useEffect(() => {
    const fetchData = async () => {
      const { data: scores } = await supabase
        .from('student_scores')
        .select('*')
        .eq('student_id', id)
        .eq('password', pwd) // 同時驗證密碼

      if (scores && scores.length > 0) {
        setData(scores)
      } else {
        setError(true)
      }
      setLoading(false)
    }
    if (id && pwd) fetchData()
    else { setLoading(false); setError(true); }
  }, [id, pwd])

  const calculateGrade = (score, subject) => {
    if (!score && score !== 0) return '--';
    const interval = subjectConfig[subject].interval;
    if (parseFloat(score) === 0) return 0;
    let grade = Math.ceil(parseFloat(score) / interval);
    return grade > 15 ? 15 : grade;
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xs tracking-widest text-slate-400">驗證中...</div>
  
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-slate-600 bg-slate-50 font-light">
      <div className="text-4xl mb-4">🔒</div>
      <p className="tracking-widest text-sm mb-6">學號或密碼錯誤，請重新確認</p>
      <button onClick={() => router.push('/search')} className="text-[10px] bg-slate-800 text-white px-6 py-2 rounded-full tracking-widest">返回</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 font-light text-slate-600">
      <div className="max-w-md mx-auto">
        <button onClick={() => router.back()} className="mb-8 text-[11px] text-slate-400 tracking-widest uppercase group">
           ← 返回查詢
        </button>
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="p-10 border-b border-slate-50 text-center">
            <h2 className="text-[10px] text-blue-600 font-bold tracking-[0.4em] mb-4 uppercase">Grade Report</h2>
            <h1 className="text-3xl font-normal text-slate-800 tracking-tight mb-2">{data[0]?.student_name}</h1>
            <p className="text-[11px] text-slate-400 font-mono tracking-widest underline decoration-blue-200 decoration-2 underline-offset-4">學號: {id}</p>
          </div>
          <div className="p-2 pb-8">
            <table className="w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[11px] text-slate-400 tracking-widest">
                  <th className="px-6 py-2 text-left font-normal">考試科目</th>
                  <th className="px-6 py-2 text-center font-normal">原始成績</th>
                  <th className="px-6 py-2 text-right font-normal text-blue-600">換算級分</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(subjectConfig).map(sub => {
                  const record = data.find(r => r.subject === sub)
                  const score = record ? record.score : null
                  return (
                    <tr key={sub}>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700 bg-slate-50/50 rounded-l-2xl">{sub}</td>
                      <td className="px-6 py-4 text-center text-sm font-light bg-slate-50/50">{score !== null ? score : '--'}</td>
                      <td className="px-6 py-4 text-right bg-slate-50/50 rounded-r-2xl">
                        <span className={`text-sm font-bold ${score !== null ? 'text-blue-600' : 'text-slate-200'}`}>{calculateGrade(score, sub)}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}