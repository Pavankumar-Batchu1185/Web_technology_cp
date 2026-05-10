'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../lib/api';

interface Suggestion {
  id: number;
  title: string;
}

export default function Navbar() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const user = auth?.user;
  const loading = auth?.loading;

  // Sync search input with URL on mount
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) setSearchQuery(urlSearch);
  }, [searchParams]);

  // Debounced instant search + suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = searchQuery.trim();

    // Update URL for instant refresh (debounced)
    debounceRef.current = setTimeout(() => {
      const currentSearch = searchParams.get('search') || '';
      if (trimmed !== currentSearch) {
        if (trimmed) {
          router.push(`/?search=${encodeURIComponent(trimmed)}`);
        } else {
          router.push('/');
        }
      }
    }, 300);

    // Fetch suggestions
    if (trimmed.length >= 2) {
      api.get('/questions/', { params: { search: trimmed } })
        .then(({ data }) => {
          const results = data.results ?? data;
          setSuggestions(results.slice(0, 5).map((q: any) => ({ id: q.id, title: q.title })));
          setShowSuggestions(true);
          setHighlightedIndex(-1);
        })
        .catch(() => {
          setSuggestions([]);
        });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, router, searchParams]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    auth?.logout();
    router.push('/');
    setShowUserMenu(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (id: number) => {
    setShowSuggestions(false);
    router.push(`/question/${id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        handleSuggestionClick(suggestions[highlightedIndex].id);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 gap-4">

          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all group-hover:scale-105">
                <span className="text-white font-black text-xl tracking-tight">Q</span>
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">CampusQA</span>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <Link href="/" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                Questions
              </Link>
              <Link href="/announcements" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
                Announcements
              </Link>
              <Link href="/achievements" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all">
                Achievements
              </Link>
              {!loading && user && (
                <Link href="/ask" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all">
                  Ask
                </Link>
              )}
            </div>
          </div>

          <div ref={searchContainerRef} className="flex-1 max-w-lg mx-4 hidden sm:flex items-center relative">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative w-full">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  placeholder="Search questions..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-2 border-transparent rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white hover:bg-white focus:border-blue-400 focus:shadow-lg focus:shadow-blue-500/20 transition-all"
                  autoComplete="off"
                />
              </div>
            </form>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl shadow-blue-500/20 border border-slate-200 overflow-hidden z-50">
                {suggestions.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => handleSuggestionClick(s.id)}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-all flex items-center gap-3 ${
                      i === highlightedIndex ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <svg className={`w-4 h-4 shrink-0 ${i === highlightedIndex ? 'text-white' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="truncate">{s.title}</span>
                  </button>
                ))}
                <div className={`px-4 py-2.5 text-xs border-t border-slate-100 ${highlightedIndex === suggestions.length ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'text-slate-400 bg-slate-50'}`}>
                  Press Enter to search all results
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!loading && !user ? (
              <>
                <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-4 py-2 hover:bg-blue-50 rounded-xl transition-all">
                  Log in
                </Link>
                <Link href="/signup" className="text-sm font-bold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-105">
                  Sign up
                </Link>
              </>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg shadow-blue-500/30 rounded-xl flex items-center justify-center text-white font-black text-sm">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-bold text-slate-900 hidden sm:block">{user?.username}</span>
                  <svg className="w-4 h-4 text-slate-600 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200 py-2 z-20 overflow-hidden">
                      <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 mb-2">
                        <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Signed in as</p>
                        <p className="text-sm font-bold text-white truncate">{user?.username}</p>
                      </div>
                      <Link
                        href={`/profile/${user?.username}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-all"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </Link>
                      <Link
                        href="/ask"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-green-50 hover:text-green-600 transition-all"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Ask a Question
                      </Link>
                      <div className="border-t border-slate-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Log out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
