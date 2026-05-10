'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import NavbarWrapper from '../components/NavbarWrapper';
import QuestionCard from '../components/QuestionCard';
import Filters from '../components/Filters';
import { questionAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

interface Question {
  id: number;
  title: string;
  content: string;
  slug: string;
  created_at: string;
  updated_at: string;
  vote_score: number;
  upvote_count: number;
  downvote_count: number;
  answer_count: number;
  category: {
    id: number;
    name: string;
  };
  tags: { id: number; name: string }[];
  author: {
    username: string;
  };
  time_since: string;
}

interface Filters {
  category: number | undefined;
  tag: number | undefined;
  sort: string | undefined;
}

export default function HomeClient() {
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Filters>({ category: undefined, tag: undefined, sort: undefined });
  const [initialLoad, setInitialLoad] = useState(true);
  const { user } = useAuth();

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {};
      if (filters.category) params.category = filters.category;
      if (filters.tag) params.tag = filters.tag;
      if (filters.sort) params.sort = filters.sort;
      
      const searchQuery = searchParams.get('search');
      if (searchQuery) params.search = searchQuery;

      const { data } = await questionAPI.list(params);
      setQuestions(data.results ?? data);
      setError('');
    } catch {
      setError('Failed to load questions');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [filters, searchParams]);

  const handleVote = async (id: number, direction: 'up' | 'down') => {
    if (!user) return;
    try {
      const endpoint = direction === 'up' ? 'upvote' : 'downvote';
      const { data } = await questionAPI[endpoint](id);
      setQuestions(questions.map(q =>
        q.id === id ? {
          ...q,
          vote_score: data.vote_score,
          upvote_count: data.upvote_count,
          downvote_count: data.downvote_count
        } : q
      ));
    } catch {
      // Handle vote error silently
    }
  };

  const handleFilterChange = (newFilters: { category?: number; tag?: number; sort?: string }) => {
    setFilters({ category: newFilters.category, tag: newFilters.tag, sort: newFilters.sort });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <NavbarWrapper />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-8 mb-8 text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-black mb-2 tracking-tight">Welcome to CampusQA</h1>
            <p className="text-blue-100 mb-6 text-lg">Ask questions, share knowledge, and learn together</p>
            {user && (
              <Link
                href="/ask"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ask a Question
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <Filters onFilterChange={handleFilterChange} />

        {/* Questions List */}
        {initialLoad && loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-sm">
            {error}
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">No questions yet</h3>
            <p className="text-slate-500 mb-6">Be the first to ask a question!</p>
            {user && (
              <Link
                href="/ask"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
              >
                Ask a Question
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {loading && (
              <div className="flex justify-center py-2">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            )}
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onVote={user ? handleVote : undefined}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
