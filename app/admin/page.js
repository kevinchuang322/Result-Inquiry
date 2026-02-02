'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [activeTab, setActiveTab] = useState('grades')

  // --- 1. 成績管理狀態 ---
  const [formData, setFormData] = useState({ student_id: '', student_name: '', subject: '國文', score: '', password: '' })
  const [scores, setScores] = useState([])
  const [status, setStatus] = useState('')
  const subjectMaxScores = { "國文": 100, "英文": 100, "數學A": 100, "數學B": 100, "自然": 128, "社會": 144 };

  // --- 2. 公告管理狀態 ---
  const [annoList, setAnnoList] = useState([])
  const [annoForm, setAnnoForm] = useState({ id: null, title: '', category: '行政', content: '', file_url: '' })
  const [annoStatus, setAnnoStatus] = useState('')

  // ==========================================
  // A. 成績管理 (保留原邏輯)
  // ==========================================
  useEffect(() => {
    const autoLookup = async () => {
      if (formData.student_id.length >= 1) {
        const { data: records } = await supabase.from('student_scores').select('student_name, password, subject, score').eq('student_id', formData.student_id);
        if (records && records.length > 0) {
          const info = records[0];
          const currentSubjectRecord = records.find(r => r.subject === formData.subject);
          setFormData(prev => ({ 
            ...prev, 
            student_name: info.student_name, 
            password: info.password,
            score: currentSubjectRecord ? currentSubjectRecord.score.toString() : '' 
          }));
          if (currentSubjectRecord) setStatus(`🔎 已顯示現有分數`);
          else setStatus(`✅ 學生：${info.student_name}`);
        } else {
          setFormData(prev => ({ ...prev, student_name: '', password: '', score: '' }));
          setStatus('❌ 找不到學號');
        }
      } else {
        setFormData(prev => ({ ...prev, student_name: '', password: '', score: '' }));
        setStatus('');
      }
    }
    autoLookup();
  }, [formData.student_id, formData.subject]);

  const fetchScores = async () => {
    const { data } = await supabase.from('student_scores').select('*').not('subject', 'eq', '學生名單').order('created_at', { ascending: false })
    setScores(data || [])
  }

  const getNextStudentId = (currentId) => {
    const match = currentId.match(/^(.*?)(\d+)$/);
    if (!match) return '';
    const prefix = match[1];
    const numberPart = match[2];
    const nextNumber = (parseInt(numberPart, 10) + 1).toString();
    return prefix + nextNumber.padStart(numberPart.length, '0');
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault()
    if (!formData.password) return alert('找不到學生資料！');
    const inputScore = parseFloat(formData.score);
    const maxAllowed = subjectMaxScores[formData.subject] || 100;
    if (inputScore < 0) return alert('錯誤：成績不能為負分！');
    if (inputScore > maxAllowed) return alert(`⚠️ 滿分上限為 ${maxAllowed} 分。`);
    const finalScore = Math.round(inputScore * 100) / 100;
    const { data: existingRecord } = await supabase.from('student_scores').select('id').eq('student_id', formData.student_id).eq('subject', formData.subject).not('subject', 'eq', '學生名單').maybeSingle()
    if (existingRecord) {
      const { error } = await supabase.from('student_scores').update({ score: finalScore }).eq('id', existingRecord.id);
      if (!error) handlePostGradeSubmit('✅ 成績已成功更新');
      return;
    }
    const { error } = await supabase.from('student_scores').insert([{ ...formData, score: finalScore }]);
    if (error) setStatus('錯誤: ' + error.message);
    else handlePostGradeSubmit('✅ 錄入成功，跳至下一位');
  }

  const handlePostGradeSubmit = (msg) => {
    const nextId = getNextStudentId(formData.student_id);
    setStatus(msg);
    setFormData(prev => ({ ...prev, student_id: nextId, score: '', student_name: '', password: '' }));
    fetchScores();
    document.getElementById('score-input')?.focus();
  };

  // ==========================================
  // B. 公告管理 (含換行修復與附件功能)
  // ==========================================
  const fetchAnnos = async () => {
    const { data } = await supabase.from('campus_announcements').select('*').order('created_at', { ascending: false })
    setAnnoList(data || [])
  }

  const handleAnnoSubmit = async (e) => {
    e.preventDefault();
    setAnnoStatus('處理中...');
    let finalFileUrl = annoForm.file_url;
    const fileInput = document.getElementById('anno-file');
    
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const fileName = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('announcements').upload(fileName, file);
      if (uploadError) return alert('上傳失敗: ' + uploadError.message);
      const { data: urlData } = supabase.storage.from('announcements').getPublicUrl(fileName);
      finalFileUrl = urlData.publicUrl;
    }

    const payload = {
      title: annoForm.title,
      category: annoForm.category,
      content: annoForm.content,
      file_url: finalFileUrl || null
    };

    if (annoForm.id) {
      await supabase.from('campus_announcements').update(payload).eq('id', annoForm.id);
      setAnnoStatus('✅ 公告已更新');
    } else {
      await supabase.from('campus_announcements').insert([payload]);
      setAnnoStatus('✅ 新公告已發佈');
    }

    setAnnoForm({ id: null, title: '', category: '行政', content: '', file_url: '' });
    fileInput.value = ''; 
    fetchAnnos();
  };

  const removeFile = async () => {
    if (!confirm('確定移除附件？')) return;
    if (annoForm.id) {
      await supabase.from('campus_announcements').update({ file_url: null }).eq('id', annoForm.id);
    }
    setAnnoForm({ ...annoForm, file_url: '' });
    setAnnoStatus('🗑️ 附件已移除');
    fetchAnnos();
  }

  useEffect(() => {
    if (isLoggedIn) { fetchScores(); fetchAnnos(); }
  }, [isLoggedIn])

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl w-full max-w-sm text-center border border-slate-50">
          <h2 className="text-[10px] font-bold tracking-[0.4em] mb-8 uppercase text-slate-400">Security Login</h2>
          <input type="password" placeholder="管理密碼" className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-center outline-none border border-transparent focus:border-blue-100 transition-all" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
          <button onClick={() => adminPassword === '1234' ? setIsLoggedIn(true) : alert('密碼錯誤')} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-200 uppercase tracking-widest">Login</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-light text-slate-600">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b pb-6 text-slate-800">
          <h1 className="text-lg font-bold tracking-tighter uppercase flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>Admin Panel</h1>
          <button onClick={() => setIsLoggedIn(false)} className="text-[10px] text-slate-400 font-bold uppercase hover:text-red-500 tracking-widest">Logout</button>
        </header>

        <div className="flex gap-2 mb-10 bg-slate-100 p-1.5 rounded-2xl w-fit">
          <button onClick={() => setActiveTab('grades')} className={`px-8 py-2.5 rounded-xl text-[11px] font-bold tracking-widest transition-all ${activeTab === 'grades' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>成績管理</button>
          <button onClick={() => setActiveTab('announcements')} className={`px-8 py-2.5 rounded-xl text-[11px] font-bold tracking-widest transition-all ${activeTab === 'announcements' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>公告管理</button>
        </div>

        {activeTab === 'grades' ? (
          /* 成績管理頁面 */
          <div className="grid lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit">
              <h2 className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest">Score Entry</h2>
              <form onSubmit={handleGradeSubmit} className="space-y-4">
                <input className="w-full bg-slate-50 p-3 rounded-xl text-xs outline-none" placeholder="學號" value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} required />
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-3 bg-slate-50 rounded-xl font-medium text-slate-500">姓名：{formData.student_name || '--'}</div>
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-700 font-bold text-center">密碼：{formData.password || '----'}</div>
                </div>
                <select className="w-full bg-slate-50 p-3 rounded-xl text-xs cursor-pointer" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                  {Object.keys(subjectMaxScores).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input id="score-input" type="number" step="0.01" className="w-full p-3 bg-slate-50 rounded-xl text-xs outline-none" placeholder="輸入分數" value={formData.score} onChange={e => setFormData({...formData, score: e.target.value})} required />
                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl text-[10px] font-bold tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">儲存成績並跳下一位</button>
              </form>
              {status && <p className="mt-4 text-[10px] text-center text-blue-500 font-bold animate-pulse">{status}</p>}
            </div>
            <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-[11px]">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50 text-slate-400 uppercase tracking-widest"><tr><th className="p-5 font-bold text-left">學生資訊</th><th className="p-5 text-center">科目</th><th className="p-5 text-center">成績</th><th className="p-5 text-right">管理</th></tr></thead>
                <tbody className="divide-y divide-slate-50">{scores.map(s => (<tr key={s.id} className="hover:bg-slate-50/50"><td className="p-5 font-bold text-slate-700">{s.student_name} <span className="text-slate-300 font-normal ml-2">{s.student_id}</span></td><td className="p-5 text-center text-slate-500">{s.subject}</td><td className="p-5 text-center text-blue-600 font-bold">{s.score}</td><td className="p-5 text-right"><button onClick={async () => { if(confirm('確定刪除？')) { await supabase.from('student_scores').delete().eq('id', s.id); fetchScores(); } }} className="text-slate-200 hover:text-red-400 font-bold uppercase tracking-tighter transition-colors">Remove</button></td></tr>))}</tbody>
              </table>
            </div>
          </div>
        ) : (
          /* 公告管理頁面 */
          <div className="grid lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-2 duration-500">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit">
              <h2 className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest">Announcement Editor</h2>
              <form onSubmit={handleAnnoSubmit} className="space-y-4">
                <input className="w-full bg-slate-50 p-3 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500" placeholder="公告主旨" value={annoForm.title} onChange={e => setAnnoForm({...annoForm, title: e.target.value})} required />
                <select className="w-full bg-slate-50 p-3 rounded-xl text-xs cursor-pointer" value={annoForm.category} onChange={e => setAnnoForm({...annoForm, category: e.target.value})}>{["行政", "教學", "活動", "緊急"].map(c => <option key={c} value={c}>{c}</option>)}</select>
                <textarea 
                  className="w-full bg-slate-50 p-4 rounded-2xl text-xs outline-none h-64 leading-relaxed transition-all border border-transparent focus:border-blue-100"
                  style={{ whiteSpace: 'pre-wrap' }}
                  placeholder="詳細公告內容 (支援 Enter 換行)..." 
                  value={annoForm.content} 
                  onChange={e => setAnnoForm({...annoForm, content: e.target.value})} 
                  required 
                />
                <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block ml-1">附件管理</label>
                  <input id="anno-file" type="file" className="w-full text-[10px]" />
                  {annoForm.file_url && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                      <span className="text-[9px] text-blue-500 font-bold">✓ 已有附件檔案</span>
                      <button type="button" onClick={removeFile} className="text-[9px] font-bold text-red-400 hover:text-red-600 uppercase tracking-tighter">[ 刪除附件 ]</button>
                    </div>
                  )}
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200">儲存公告</button>
                {annoForm.id && <button type="button" onClick={() => setAnnoForm({id:null, title:'', category:'行政', content:'', file_url:''})} className="w-full text-[10px] text-slate-400 font-bold uppercase">取消編輯</button>}
              </form>
              {annoStatus && <p className="mt-4 text-[10px] text-center text-blue-500 font-bold animate-pulse">{annoStatus}</p>}
            </div>
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-[11px]">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50 text-slate-400 uppercase tracking-widest"><tr><th className="p-5 text-left font-bold">類別</th><th className="p-5 text-left font-bold">主旨</th><th className="p-5 text-right font-bold">管理</th></tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {annoList.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/50">
                      <td className="p-5"><span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${a.category === '緊急' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>{a.category}</span></td>
                      <td className="p-5 font-medium text-slate-700">{a.title}</td>
                      <td className="p-5 text-right space-x-4">
                        <button onClick={() => {setAnnoForm(a); setAnnoStatus('正在編輯模式...');}} className="text-blue-500 font-bold hover:underline">EDIT</button>
                        <button onClick={async () => { if(confirm('確定刪除此公告？')) { await supabase.from('campus_announcements').delete().eq('id', a.id); fetchAnnos(); } }} className="text-slate-200 hover:text-red-400 font-bold uppercase tracking-tighter">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}