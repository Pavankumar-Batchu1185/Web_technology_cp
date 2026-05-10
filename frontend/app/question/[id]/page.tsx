'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { questionAPI, answerAPI } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

interface User { username: string; }
interface Tag { id: number; name: string; }
interface Category { id: number; name: string; }
interface Answer { id: number; content: string; author: User; created_at: string; vote_score: number; upvote_count: number; downvote_count: number; is_best: boolean; time_since: string; }
interface Question { id: number; title: string; content: string; author: User; created_at: string; vote_score: number; upvote_count: number; downvote_count: number; category: Category; tags: Tag[]; time_since: string; image?: string; }

const CheckBadge = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const ChevronUp = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
  </svg>
);

const ChevronDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
  </svg>
);

function VoteWidget({
  upvotes,
  downvotes,
  onUp,
  onDown,
  disabled,
  size = 'md',
}: {
  upvotes: number;
  downvotes: number;
  onUp: () => void;
  onDown: () => void;
  disabled: boolean;
  size?: 'sm' | 'md';
}) {
  const btn = size === 'sm'
    ? 'w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-150 disabled:opacity-30'
    : 'w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150 disabled:opacity-30';

  return (
    <div className="flex flex-col items-center gap-0.5 select-none">
      <button
        onClick={onUp}
        disabled={disabled}
        className={`${btn} text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 active:scale-95`}
        aria-label="Upvote"
      >
        <ChevronUp />
      </button>
      <span className="text-xs font-bold tabular-nums text-emerald-600 leading-none py-0.5">{upvotes}</span>
      <button
        onClick={onDown}
        disabled={disabled}
        className={`${btn} text-slate-400 hover:text-rose-500 hover:bg-rose-50 active:scale-95`}
        aria-label="Downvote"
      >
        <ChevronDown />
      </button>
      <span className="text-xs font-bold tabular-nums text-rose-500 leading-none py-0.5">{downvotes}</span>
    </div>
  );
}

export default function QuestionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const fetchQuestion = async () => {
    try {
      const { data } = await questionAPI.get(id);
      setQuestion(data);
      setEditTitle(data.title);
      setEditContent(data.content);
    } catch {
      setError('Failed to load question');
    }
  };

  const fetchAnswers = async () => {
    try {
      const { data } = await answerAPI.list(id);
      setAnswers(Array.isArray(data) ? data : data.results || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { Promise.all([fetchQuestion(), fetchAnswers()]); }, [id]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSubmitting(true);
      await answerAPI.create({ question: parseInt(id), content: answerContent });
      setAnswerContent('');
      fetchAnswers();
    } catch { setError('Failed to post answer'); }
    finally { setSubmitting(false); }
  };

  const handleVoteQuestion = async (direction: 'up' | 'down') => {
    if (!user || !question) return;
    try {
      const { data } = await questionAPI[direction === 'up' ? 'upvote' : 'downvote'](parseInt(id));
      setQuestion({ ...question, vote_score: data.vote_score, upvote_count: data.upvote_count, downvote_count: data.downvote_count });
    } catch {}
  };

  const handleVoteAnswer = async (answerId: number, direction: 'up' | 'down') => {
    if (!user) return;
    try {
      const { data } = direction === 'up' ? await answerAPI.upvote(answerId) : await answerAPI.downvote(answerId);
      setAnswers(answers.map(a => a.id === answerId ? { ...a, vote_score: data.vote_score, upvote_count: data.upvote_count, downvote_count: data.downvote_count } : a));
    } catch {}
  };

  const handleMarkBest = async (answerId: number) => {
    if (!user) return;
    try { await answerAPI.markBest(answerId); fetchAnswers(); }
    catch { setError('Failed to mark best answer'); }
  };

  const handleEditQuestion = async () => {
    if (!question) return;
    try {
      await questionAPI.update(question.id, { title: editTitle, content: editContent });
      setQuestion({ ...question, title: editTitle, content: editContent });
      setEditing(false);
    } catch { alert('Failed to update question'); }
  };

  const handleDeleteQuestion = async () => {
    if (!question || !confirm('Delete this question?')) return;
    try {
      await questionAPI.delete(question.id);
      window.location.href = '/';
    } catch { alert('Failed to delete question'); }
  };

  
  const Skeleton = () => (
    <div className="animate-pulse space-y-4 pt-4">
      <div className="h-7 bg-slate-100 rounded-xl w-3/4" />
      <div className="h-4 bg-slate-100 rounded-lg w-full" />
      <div className="h-4 bg-slate-100 rounded-lg w-5/6" />
      <div className="h-4 bg-slate-100 rounded-lg w-2/3" />
      <div className="flex gap-2 pt-2">
        <div className="h-6 w-16 bg-slate-100 rounded-full" />
        <div className="h-6 w-20 bg-slate-100 rounded-full" />
      </div>
    </div>
  );

  if (!question && !loading) return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <p className="text-6xl mb-4">🔍</p>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Question not found</h1>
        <p className="text-slate-500 text-sm">It may have been deleted or the link is wrong.</p>
        <Link href="/" className="mt-6 inline-block text-sm font-semibold text-slate-600 hover:text-slate-900 underline underline-offset-4">
          ← Back to questions
        </Link>
      </div>
    </div>
  );

  const bestAnswers = answers.filter(a => a.is_best);
  const otherAnswers = answers.filter(a => !a.is_best);
  const sortedAnswers = [...bestAnswers, ...otherAnswers];

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F2', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');

        .question-title { font-family: 'DM Serif Display', Georgia, serif; }
        .fade-in { animation: fadeIn 0.35s ease both; }
        .answer-card { animation: slideUp 0.3s ease both; }
        .answer-card:nth-child(2) { animation-delay: 0.05s; }
        .answer-card:nth-child(3) { animation-delay: 0.1s; }
        .answer-card:nth-child(4) { animation-delay: 0.15s; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .vote-btn:hover svg { transform: scale(1.15); }
        .vote-btn svg { transition: transform 0.15s ease; }

        .prose-answer { line-height: 1.75; }

        textarea:focus { box-shadow: 0 0 0 3px rgba(15,23,42,0.08); }
        input:focus { box-shadow: 0 0 0 3px rgba(15,23,42,0.08); }
      `}</style>

      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-20">

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <Skeleton />
          </div>
        ) : question ? (
          <div className="fade-in space-y-5">

            <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 sm:p-7">
                <div className="flex gap-4 sm:gap-6">

                  <div className="shrink-0 pt-1">
                    <VoteWidget
                      upvotes={question.upvote_count || 0}
                      downvotes={question.downvote_count || 0}
                      onUp={() => handleVoteQuestion('up')}
                      onDown={() => handleVoteQuestion('down')}
                      disabled={!user}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {editing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          className="question-title w-full text-xl font-normal border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-slate-700 bg-slate-50 transition-all"
                        />
                        <textarea
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          rows={6}
                          className="w-full text-sm border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-slate-700 resize-none bg-slate-50 leading-relaxed transition-all"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleEditQuestion}
                            className="px-5 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 active:scale-[0.98] transition-all"
                          >
                            Save changes
                          </button>
                          <button
                            onClick={() => setEditing(false)}
                            className="px-5 py-2 bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-200 active:scale-[0.98] transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h1 className="question-title text-2xl sm:text-3xl text-slate-900 leading-tight mb-4">
                          {question.title}
                        </h1>
                        <p className="text-slate-600 text-[0.9375rem] leading-relaxed whitespace-pre-wrap mb-5">
                          {question.content}
                        </p>
                        {question.image && (
                          <div className="mb-5 rounded-xl overflow-hidden border border-slate-200">
                            <img
                              src={question.image}
                              alt={question.title}
                              className="w-full max-h-80 object-cover"
                            />
                          </div>
                        )}
                      </>
                    )}

            
                    {!editing && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {question.tags?.map(tag => (
                          <span
                            key={tag.id}
                            className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors cursor-default"
                          >
                            #{tag.name}
                          </span>
                        ))}
                        {question.category?.name && (
                          <span className="px-2.5 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded-lg border border-sky-200">
                            {question.category.name}
                          </span>
                        )}
                      </div>
                    )}

                    
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {question.author?.username?.[0]?.toUpperCase()}
                        </div>
                        <Link href={`/profile/${question.author?.username}`} className="font-semibold text-slate-800 hover:text-blue-600 transition-colors">
                          {question.author?.username}
                        </Link>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-400">{question.time_since || question.created_at}</span>
                      </div>

                      {user?.username === question.author?.username && !editing && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setEditing(true)}
                            className="text-xs font-semibold text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 border border-transparent hover:border-blue-200 px-3 py-1.5 rounded-lg transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={handleDeleteQuestion}
                            className="text-xs font-semibold text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-transparent hover:border-rose-200 px-3 py-1.5 rounded-lg transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>

            
            <section>
              
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.12em]">
                  {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
                </h2>
                {bestAnswers.length > 0 && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    <CheckBadge className="w-3.5 h-3.5" />
                    Solved
                  </span>
                )}
              </div>

            
              {answers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-slate-600 font-semibold mb-1 text-sm">No answers yet</p>
                  <p className="text-slate-400 text-xs">Be the first to share your knowledge</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedAnswers.map((answer, i) => (
                    <div
                      key={answer.id}
                      className={`answer-card bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                        answer.is_best
                          ? 'border-emerald-400 ring-1 ring-emerald-300 ring-offset-1'
                          : 'border-slate-200'
                      }`}
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      {answer.is_best && (
                        <div className="flex items-center gap-2 px-5 sm:px-6 py-2.5 bg-emerald-50 border-b border-emerald-200">
                          <CheckBadge className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Best Answer</span>
                        </div>
                      )}
                      <div className="p-5 sm:p-6">
                        <div className="flex gap-4 sm:gap-5">
                          <div className="shrink-0 pt-0.5">
                            <VoteWidget
                              upvotes={answer.upvote_count || 0}
                              downvotes={answer.downvote_count || 0}
                              onUp={() => handleVoteAnswer(answer.id, 'up')}
                              onDown={() => handleVoteAnswer(answer.id, 'down')}
                              disabled={!user}
                              size="sm"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="prose-answer text-slate-700 text-[0.9375rem] whitespace-pre-wrap mb-4">
                              {answer.content}
                            </p>
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                  {answer.author?.username?.[0]?.toUpperCase()}
                                </div>
                                <Link href={`/profile/${answer.author?.username}`} className="font-semibold text-slate-700 hover:text-blue-600 transition-colors">
                                  {answer.author?.username}
                                </Link>
                                <span className="text-slate-200">·</span>
                                <span className="text-slate-400">{answer.time_since || answer.created_at}</span>
                              </div>
                              {user?.username === question.author?.username && !answer.is_best && (
                                <button
                                  onClick={() => handleMarkBest(answer.id)}
                                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 border border-transparent hover:border-emerald-300 px-3 py-1.5 rounded-lg transition-all"
                                >
                                  <CheckBadge className="w-3.5 h-3.5" />
                                  Mark best
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

        
            {user ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">Your Answer</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white text-[10px] font-bold">
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-600">{user.username}</span>
                  </div>
                </div>
                <form onSubmit={handleSubmitAnswer}>
                  <textarea
                    value={answerContent}
                    onChange={e => setAnswerContent(e.target.value)}
                    placeholder="Write a clear, helpful answer. The more detail, the better."
                    rows={6}
                    className="w-full px-5 sm:px-6 py-4 text-slate-700 text-[0.9375rem] leading-relaxed placeholder-slate-300 focus:outline-none resize-none bg-transparent"
                    required
                  />
                  <div className="px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-xs text-slate-400">Be specific and cite sources where relevant.</p>
                    <button
                      type="submit"
                      disabled={submitting || !answerContent.trim()}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Posting…
                        </>
                      ) : 'Post Answer →'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-2xl p-8 text-center">
                <p className="text-slate-300 text-sm mb-1 font-medium">Have an answer?</p>
                <p className="text-slate-500 text-xs mb-5">Sign in to share your knowledge with the community</p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-white text-slate-900 px-7 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-100 active:scale-[0.98] transition-all"
                >
                  Log in to answer
                </Link>
              </div>
            )}

            
            {error && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-lg fade-in z-50 flex items-center gap-3">
                <span>{error}</span>
                <button onClick={() => setError('')} className="text-white/70 hover:text-white ml-1">✕</button>
              </div>
            )}

          </div>
        ) : null}
      </main>
    </div>
  );
}