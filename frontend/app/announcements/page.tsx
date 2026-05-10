'use client';
import { useState, useEffect } from 'react';
import NavbarWrapper from '../../components/NavbarWrapper';
import { announcementAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface Announcement {
  id: number;
  title: string;
  content: string;
  tag: string;
  tag_display: string;
  author: { username: string };
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

const TAG_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  general: { bg: 'bg-blue-500/10', text: 'text-blue-600', glow: 'shadow-blue-500/20' },
  academic: { bg: 'bg-purple-500/10', text: 'text-purple-600', glow: 'shadow-purple-500/20' },
  event: { bg: 'bg-pink-500/10', text: 'text-pink-600', glow: 'shadow-pink-500/20' },
  urgent: { bg: 'bg-red-500/10', text: 'text-red-600', glow: 'shadow-red-500/20' },
  placement: { bg: 'bg-green-500/10', text: 'text-green-600', glow: 'shadow-green-500/20' },
  exam: { bg: 'bg-orange-500/10', text: 'text-orange-600', glow: 'shadow-orange-500/20' },
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedTag]);

  const fetchAnnouncements = async () => {
    try {
      const params = selectedTag ? { tag: selectedTag } : undefined;
      const { data } = await announcementAPI.list(params);
      setAnnouncements(data.results ?? data);
    } catch (err) {
      console.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const getTagStyle = (tag: string) => TAG_COLORS[tag] || TAG_COLORS.general;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <NavbarWrapper />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Announcements</h1>
              <p className="text-slate-500 text-sm mt-1">Stay updated with campus news</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            <button
              onClick={() => setSelectedTag('')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedTag === ''
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All
            </button>
            {Object.keys(TAG_COLORS).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all capitalize ${
                  selectedTag === tag
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No announcements yet</h3>
            <p className="text-slate-500">Check back later for updates</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => {
              const tagStyle = getTagStyle(announcement.tag);
              return (
                <article
                  key={announcement.id}
                  className={`bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 ${
                    announcement.is_pinned ? 'ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/20' : 'shadow-sm'
                  }`}
                >
                  {announcement.is_pinned && (
                    <div className="flex items-center gap-2 mb-3 text-blue-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78.409 1.574 1.195 1.574H6.75a1 1 0 01.894.553l.448.894a1 1 0 001.788 0l.448-.894A1 1 0 0111.25 15h1.373c.786 0 1.445-.794 1.195-1.574L13 10.274V6a1 1 0 00-1-1H6a1 1 0 00-1 1v4.274z" />
                      </svg>
                      <span className="text-xs font-bold uppercase tracking-wider">Pinned</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight flex-1">
                      {announcement.title}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${tagStyle.bg} ${tagStyle.text} shadow-sm ${tagStyle.glow}`}
                    >
                      {announcement.tag_display}
                    </span>
                  </div>

                  <p className="text-slate-600 leading-relaxed mb-4 whitespace-pre-wrap">
                    {announcement.content}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                        {announcement.author.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-700">{announcement.author.username}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs">
                        {new Date(announcement.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
