'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import NavbarWrapper from '../../components/NavbarWrapper';
import { questionAPI, categoryAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface Category { id: number; name: string; }

const TIPS = [
  { icon: '🔍', text: 'Search first to avoid duplicates' },
  { icon: '✏️', text: 'Use a clear, specific title' },
  { icon: '🧪', text: "Include what you've already tried" },
  { icon: '🏷️', text: 'Add tags for better discoverability' },
  { icon: '🤝', text: 'Be respectful and specific' },
];

function StepLabel({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
        style={{ background: '#111' }}
      >
        {n}
      </div>
      <label className="text-xs font-black uppercase tracking-widest text-gray-400"
        style={{ fontFamily: "'DM Mono', 'Courier New', monospace" }}>
        {label}
      </label>
    </div>
  );
}

export default function AskQuestionPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({ title: '', content: '', category: '', tags: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    categoryAPI.list().then(({ data }) => setCategories(data.results ?? data));
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login?redirect=/ask');
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSubmitting(true);
      setError('');
      const tagNames = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('category', formData.category);
      tagNames.forEach(tag => submitData.append('tags', tag));
      if (imageFile) submitData.append('image', imageFile);
      await questionAPI.create(submitData);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const processImageFile = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) processImageFile(file);
  };

  const parsedTags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

  if (authLoading || !user) return (
    <div className="min-h-screen" style={{ background: '#F7F5F0' }}>
      <NavbarWrapper />
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#F7F5F0' }}>
      <NavbarWrapper />
      <div style={{ background: '#fff', borderBottom: '1px solid #E8E4DD' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors mb-5"
            style={{ fontFamily: "'DM Mono', 'Courier New', monospace" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-1.5"
                style={{ color: '#C0954A', fontFamily: "'DM Mono', 'Courier New', monospace" }}>
                Community Forum
              </p>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-none"
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif", letterSpacing: '-0.02em' }}>
                Ask a Question
              </h1>
            </div>
            <p className="text-sm text-gray-400 hidden md:block max-w-xs text-right leading-relaxed">
              The more detail you give,<br />the better your answers.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">

              <div
                className="bg-white rounded-2xl overflow-hidden transition-all duration-200"
                style={{ border: '1.5px solid #E8E4DD', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              >
                <div className="p-6">
                  <StepLabel n={1} label="Your question title *" />
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. How do I reverse a linked list in Python?"
                    className="w-full text-gray-900 font-semibold text-lg placeholder-gray-300 focus:outline-none bg-transparent leading-snug"
                    style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                    required
                    maxLength={200}
                  />
                </div>
                <div
                  className="px-6 py-2.5 flex items-center justify-between"
                  style={{ background: '#FAFAF8', borderTop: '1px solid #EEEBE5' }}
                >
                  <span className="text-xs text-gray-400">Be specific — imagine you're asking an expert</span>
                  <span className="text-xs font-bold tabular-nums"
                    style={{ color: formData.title.length > 160 ? '#C0392B' : '#aaa' }}>
                    {formData.title.length}/200
                  </span>
                </div>
              </div>

            
              <div
                className="bg-white rounded-2xl overflow-hidden transition-all duration-200"
                style={{ border: '1.5px solid #E8E4DD', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              >
                <div className="p-6">
                  <StepLabel n={2} label="Question details *" />
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder={"Describe your question in detail.\n\n• What have you already tried?\n• What did you expect to happen?\n• What actually happened?"}
                    rows={10}
                    className="w-full text-gray-800 text-sm leading-relaxed placeholder-gray-300 focus:outline-none bg-transparent resize-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div
                  className="bg-white rounded-2xl p-6"
                  style={{ border: '1.5px solid #E8E4DD', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <StepLabel n={3} label="Category *" />
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full text-gray-900 font-semibold text-sm focus:outline-none bg-transparent cursor-pointer appearance-none pr-6"
                      required
                    >
                      <option value="">Select a category…</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div
                  className="bg-white rounded-2xl p-6"
                  style={{ border: '1.5px solid #E8E4DD', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <StepLabel n={4} label="Tags (optional)" />
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="python, django, api"
                    className="w-full text-gray-900 font-semibold text-sm placeholder-gray-300 focus:outline-none bg-transparent"
                  />
                  {parsedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {parsedTags.map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full"
                          style={{ background: '#F0ECE4', color: '#5a4a2a' }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {!parsedTags.length && (
                    <p className="text-xs text-gray-400 mt-2">Separate with commas</p>
                  )}
                </div>
              </div>

              <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ border: '1.5px solid #E8E4DD', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              >
                <div className="p-6">
                  <StepLabel n={5} label="Attach an image (optional)" />

                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden" style={{ border: '1.5px solid #E8E4DD' }}>
                      <img src={imagePreview} alt="Preview" className="w-full h-52 object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(''); }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                        title="Remove image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      className="rounded-xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center py-10 gap-3"
                      style={{
                        border: `2px dashed ${dragOver ? '#111' : '#D4CFC6'}`,
                        background: dragOver ? '#F7F5F0' : 'transparent',
                      }}
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: '#F0ECE4' }}>
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-700">Drop an image or click to upload</p>
                        <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-2xl px-5 py-4"
                  style={{ background: '#FEF2F2', border: '1.5px solid #FECACA' }}>
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-red-700 font-semibold text-sm">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-5 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-white rounded-xl transition-all duration-150"
                  style={{ border: '1.5px solid transparent' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2.5 px-8 py-3 rounded-xl font-black text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                  style={{
                    background: '#111',
                    color: '#fff',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
                    fontFamily: "'DM Mono', 'Courier New', monospace",
                    letterSpacing: '0.03em',
                  }}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Posting…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Post Question
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-6">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: '#111', border: '1.5px solid #222' }}
            >
              <div className="px-5 pt-5 pb-4">
                <p className="text-xs font-black uppercase tracking-widest mb-4"
                  style={{ color: '#C0954A', fontFamily: "'DM Mono', 'Courier New', monospace" }}>
                  Writing Tips
                </p>
                <ul className="space-y-3">
                  {TIPS.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-base flex-shrink-0 mt-0.5">{tip.icon}</span>
                      <span className="text-xs text-gray-400 leading-relaxed">{tip.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              className="rounded-2xl p-5 bg-white"
              style={{ border: '1.5px solid #E8E4DD' }}
            >
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3"
                style={{ fontFamily: "'DM Mono', 'Courier New', monospace" }}>
                Community Rules
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Be kind, stay on-topic, and help others learn. Questions that show effort get better answers.
              </p>
            </div>

            {(formData.title || formData.content || formData.category) && (
              <div
                className="rounded-2xl p-5 bg-white"
                style={{ border: '1.5px solid #E8E4DD' }}
              >
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3"
                  style={{ fontFamily: "'DM Mono', 'Courier New', monospace" }}>
                  Progress
                </p>
                <div className="space-y-2">
                  {[
                    { label: 'Title', done: formData.title.length > 0 },
                    { label: 'Details', done: formData.content.length > 20 },
                    { label: 'Category', done: !!formData.category },
                    { label: 'Tags', done: parsedTags.length > 0, optional: true },
                  ].map(({ label, done, optional }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                        style={{ background: done ? '#111' : '#F0ECE4' }}
                      >
                        {done && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs font-semibold ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                        {label}{optional ? ' (optional)' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}