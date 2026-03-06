'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Search, BookOpen, Upload, Edit, Trash2, Eye } from 'lucide-react';

const LESSONS = [
  { id: '1', title: 'Greetings & Introductions', language: 'English', level: 'Beginner', status: 'Published', students: 342 },
  { id: '2', title: 'Family & Relationships', language: 'English', level: 'Beginner', status: 'Published', students: 287 },
  { id: '3', title: 'Daily Routines', language: 'English', level: 'Intermediate', status: 'Draft', students: 0 },
  { id: '4', title: 'வணக்கம் - Tamil Greetings', language: 'Tamil', level: 'Beginner', status: 'Published', students: 156 },
  { id: '5', title: 'Numbers & Counting', language: 'English', level: 'Beginner', status: 'Published', students: 198 },
];

export default function AdminContent() {
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [newLesson, setNewLesson] = useState({ title: '', language: 'English', level: 'Beginner', description: '' });
  const filtered = LESSONS.filter(l => l.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <header className="border-b border-[#e8e5e0] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-[#6b6b6b] hover:text-[#2d2d2d]"><ArrowLeft className="w-5 h-5" /></Link>
            <h1 className="text-lg font-semibold text-[#2d2d2d]">Content Management</h1>
          </div>
          <button onClick={() => setShowUpload(!showUpload)} className="flex items-center gap-2 px-4 py-2 bg-[#7a9b7e] text-white text-sm font-medium rounded-xl hover:bg-[#6b8c6f]">
            <Upload className="w-4 h-4" /> Upload Lesson
          </button>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-6">
        {showUpload && (
          <div className="bg-white rounded-2xl border border-[#e8e5e0] p-6 mb-6">
            <h2 className="text-sm font-semibold text-[#2d2d2d] mb-4">Upload New Lesson</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input type="text" value={newLesson.title} onChange={e => setNewLesson(p => ({ ...p, title: e.target.value }))}
                placeholder="Lesson title" className="px-4 py-2.5 rounded-xl border border-[#e8e5e0] bg-[#faf9f7] text-sm outline-none focus:ring-2 focus:ring-[#7a9b7e]" />
              <select value={newLesson.language} onChange={e => setNewLesson(p => ({ ...p, language: e.target.value }))}
                className="px-4 py-2.5 rounded-xl border border-[#e8e5e0] bg-[#faf9f7] text-sm outline-none focus:ring-2 focus:ring-[#7a9b7e]">
                <option>English</option><option>Tamil</option>
              </select>
              <select value={newLesson.level} onChange={e => setNewLesson(p => ({ ...p, level: e.target.value }))}
                className="px-4 py-2.5 rounded-xl border border-[#e8e5e0] bg-[#faf9f7] text-sm outline-none focus:ring-2 focus:ring-[#7a9b7e]">
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
              <textarea value={newLesson.description} onChange={e => setNewLesson(p => ({ ...p, description: e.target.value }))}
                placeholder="Description" rows={2} className="px-4 py-2.5 rounded-xl border border-[#e8e5e0] bg-[#faf9f7] text-sm outline-none focus:ring-2 focus:ring-[#7a9b7e]" />
            </div>
            <button className="px-5 py-2.5 bg-[#7a9b7e] text-white text-sm font-medium rounded-xl hover:bg-[#6b8c6f] disabled:opacity-40" disabled={!newLesson.title.trim()}>
              Create Lesson
            </button>
          </div>
        )}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8a8a]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search lessons..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e8e5e0] bg-white text-sm outline-none focus:ring-2 focus:ring-[#7a9b7e]" />
        </div>
        <div className="space-y-3">
          {filtered.map(l => (
            <div key={l.id} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-[#e8e5e0]">
              <div className="w-10 h-10 rounded-xl bg-[#f0f4f0] flex items-center justify-center"><BookOpen className="w-5 h-5 text-[#7a9b7e]" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[#2d2d2d]">{l.title}</p>
                <p className="text-xs text-[#8a8a8a]">{l.language} · {l.level} · {l.students} students</p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${l.status === 'Published' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{l.status}</span>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg text-[#8a8a8a] hover:bg-[#f0ede8]"><Eye className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-lg text-[#8a8a8a] hover:bg-[#f0ede8]"><Edit className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-lg text-[#8a8a8a] hover:bg-red-50 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
