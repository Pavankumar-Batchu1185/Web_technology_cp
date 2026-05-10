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
    <nav className="bg-white shadow-lg  sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 gap-4">

          <div className="flex items-center gap-8">
            <Link href="/" className=" flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-lg tracking-tight">Q</span>
              </div>
              <span className="rounded-full text-xl link-glow font-primary text-black px-3 py-1.5 tracking-tight">CampusQA</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link href="/" className="link-glow px-3 py-1.5 text-sm font text-gray-900 hover:text-gray-900 hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow transition-300 rounded-full transition-colors">
                Questions
              </Link>
              <Link href="/achievements" className="link-glow px-3 py-1.5 text-sm font text-gray-900 hover:text-gray-900 hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow transition-300 rounded-full transition-colors">
                Achievements
              </Link>
              {!loading && user && (
                <Link href="/ask" className="link-glow px-3 py-1.5 text-sm font text-gray-900 hover:text-gray-900 hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow transition-300 rounded-full transition-colors">
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
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-2 border-transparent rounded-full text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white hover:shadow-md hover:bg-white focus:border-blue-400  focus:shadow-lg transition-all"
                  autoComplete="off"
                />
              </div>
            </form>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border-2 border-gray-900 overflow-hidden z-50">
                {suggestions.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => handleSuggestionClick(s.id)}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-3 ${
                      i === highlightedIndex ? 'bg-gray-900 text-white' : 'text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <svg className={`w-4 h-4 shrink-0 ${i === highlightedIndex ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="truncate">{s.title}</span>
                  </button>
                ))}
                <div className={`px-4 py-2 text-xs border-t border-gray-100 ${highlightedIndex === suggestions.length ? 'bg-gray-900 text-white' : 'text-gray-400 bg-gray-50'}`}>
                  Press Enter to search all results
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!loading && !user ? (
              <>
                <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors">
                  Log in
                </Link>
                <Link href="/signup" className="text-sm font-bold bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Sign up
                </Link>
              </>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-gray-100 rounded-full transition-colors border-2 border-transparent hover:border-gray-200"
                >
                  <div className="w-8 h-8 bg-blue-400 shadow-xl rounded-full flex items-center justify-center text-white font-black text-sm">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-bold text-gray-900 hidden sm:block">{user?.username}</span>
                  <svg className="w-3.5 h-3.5 text-gray-600 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl  border-gray-900 py-1 z-20 overflow-hidden">
                      <div className="px-4 py-3 bg-gray-500 mb-1">
                        <p className="text-xs font-semibold text-white-400 uppercase tracking-wider">Signed in as</p>
                        <p className="text-sm font-bold text-black truncate">{user?.username}</p>
                      </div>
                      <Link
                        href={`/profile/${user?.username}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </Link>
                      <Link
                        href="/ask"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Ask a Question
                      </Link>
                      <div className="border-t-2 border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
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
