'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import NavbarWrapper from '../../components/NavbarWrapper';
import { questionAPI, categoryAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface Category { id: number; name: string; }

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
  const [loadingCategories, setLoadingCategories] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    categoryAPI.list()
      .then(({ data }) => {
        const cats = data.results ?? data;
        setCategories(cats);
      })
      .catch((err) => {
        setError('Failed to load categories. Please refresh the page.');
      })
      .finally(() => setLoadingCategories(false));
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <NavbarWrapper />
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <NavbarWrapper />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Ask a Question</h1>
          <p className="text-slate-500 text-sm mt-2">The more detail you give, the better your answers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-shadow">
                <label className="block text-sm font-bold text-slate-700 mb-3">Question Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. How do I reverse a linked list in Python?"
                  className="w-full text-slate-900 font-semibold text-lg placeholder-slate-300 focus:outline-none bg-transparent"
                  required
                  maxLength={200}
                />
                <p className="text-xs text-slate-400 mt-2">{formData.title.length}/200 characters</p>
              </div>

              {/* Content */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-shadow">
                <label className="block text-sm font-bold text-slate-700 mb-3">Question Details *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Describe your question in detail..."
                  rows={10}
                  className="w-full text-slate-800 text-sm leading-relaxed placeholder-slate-300 focus:outline-none bg-transparent resize-none"
                  required
                />
              </div>

              {/* Category & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
                  <label className="block text-sm font-bold text-slate-700 mb-3">Category *</label>
                  {loadingCategories ? (
                    <div className="flex items-center gap-2 text-slate-400">
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="text-sm text-red-600">No categories available</div>
                  ) : (
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full text-slate-900 font-semibold text-sm focus:outline-none bg-transparent cursor-pointer"
                      required
                    >
                      <option value="">Select a category…</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
                  <label className="block text-sm font-bold text-slate-700 mb-3">Tags (optional)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="python, django, api"
                    className="w-full text-slate-900 font-semibold text-sm placeholder-slate-300 focus:outline-none bg-transparent"
                  />
                  {parsedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {parsedTags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-shadow">
                <label className="block text-sm font-bold text-slate-700 mb-3">Attach Image (optional)</label>
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-52 object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(''); }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
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
                    className={`rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center py-10 gap-3 border-2 border-dashed ${
                      dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-transparent'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-700">Drop an image or click to upload</p>
                      <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 rounded-2xl px-5 py-4 bg-red-50 border border-red-200">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-red-700 font-semibold text-sm">{error}</p>
                </div>
              )}

              {/* Submit */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-5 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30"
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

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-lg p-5">
              <p className="text-xs font-bold uppercase tracking-widest mb-4 text-blue-400">Writing Tips</p>
              <ul className="space-y-3">
                {[
                  { icon: '🔍', text: 'Search first to avoid duplicates' },
                  { icon: '✏️', text: 'Use a clear, specific title' },
                  { icon: '🧪', text: "Include what you've already tried" },
                  { icon: '🏷️', text: 'Add tags for better discoverability' },
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-base flex-shrink-0 mt-0.5">{tip.icon}</span>
                    <span className="text-xs text-slate-300 leading-relaxed">{tip.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Community Rules</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Be kind, stay on-topic, and help others learn. Questions that show effort get better answers.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
