import Link from 'next/link';

interface Tag { id: number; name: string; }
interface Category { id: number; name: string; }
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
  category: Category;
  tags: Tag[];
  author: { username: string };
  time_since: string;
}
interface QuestionCardProps {
  question: Question;
  onVote?: (id: number, direction: 'up' | 'down') => void;
}

export default function QuestionCard({ question, onVote }: QuestionCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 p-6 transition-all hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 group">
      <div className="flex gap-5">

        {/* Vote */}
        <div className="flex flex-col items-center gap-2 pt-1">
          <button
            onClick={() => onVote?.(question.id, 'up')}
            disabled={!onVote}
            className="p-2 hover:bg-green-50 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
          >
            <svg className="w-5 h-5 text-slate-400 hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <span className="text-sm font-black text-green-600 tabular-nums">
            {question.upvote_count || 0}
          </span>
          <button
            onClick={() => onVote?.(question.id, 'down')}
            disabled={!onVote}
            className="p-2 hover:bg-red-50 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
          >
            <svg className="w-5 h-5 text-slate-400 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <span className="text-sm font-black text-red-600 tabular-nums">
            {question.downvote_count || 0}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link href={`/question/${question.id}`}>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
              {question.title}
            </h3>
          </Link>

          <p className="text-slate-600 text-sm mt-2 line-clamp-2 leading-relaxed">
            {question.content}
          </p>

          {/* Tags */}
          {question.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {question.tags.slice(0, 4).map((tag) => (
                <span key={tag.id} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 hover:bg-slate-200 transition-colors">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 min-w-0">
              {question.category?.name && (
                <span className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 text-xs font-bold rounded-full border border-blue-200 shrink-0">
                  {question.category.name}
                </span>
              )}
              <Link href={`/profile/${question.author?.username}`} className="flex items-center gap-2 text-xs hover:text-blue-600 font-medium truncate transition-colors">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-[10px] shadow-sm">
                  {question.author?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="text-slate-700 font-semibold">{question.author?.username}</span>
              </Link>
              <span className="text-xs text-slate-400 shrink-0">• {question.time_since || question.created_at}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-3 px-3 py-1.5 bg-slate-50 rounded-full">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-xs font-bold text-slate-700 tabular-nums">{question.answer_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
