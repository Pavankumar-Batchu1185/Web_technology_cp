'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { profileAPI, questionAPI, answerAPI } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

interface UserProfile {
  username: string;
  email: string;
  reputation: number;
  bio: string;
  date_joined: string;
  question_count: number;
  answer_count: number;
  banner_image?:string; 
}
interface Question { id: number; title: string; created_at: string; vote_score: number; answer_count: number; }
interface Answer { id: number; content: string; created_at: string; vote_score: number; question: { id: number; title: string }; }

function SkeletonProfile() {
  return (
    <div className="animate-pulse">
      <div className="h-44 rounded-2xl mb-0" style={{ background: '#E8E4DD' }} />
      <div className="px-6 pb-6 bg-white rounded-b-2xl" style={{ border: '1px solid #E8E4DD' }}>
        <div className="flex items-end gap-4 -mt-10 mb-5">
          <div className="w-20 h-20 rounded-2xl flex-shrink-0" style={{ background: '#D4CFC6' }} />
          <div className="flex-1 pb-1 space-y-2">
            <div className="h-6 w-36 rounded" style={{ background: '#E8E4DD' }} />
            <div className="h-4 w-24 rounded" style={{ background: '#EEEBE5' }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded" style={{ background: '#EEEBE5' }} />
          <div className="h-4 w-2/3 rounded" style={{ background: '#EEEBE5' }} />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'questions' | 'answers'>('questions');
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [bannerUploading, setBannerUploading] = useState(false);

  useEffect(() => {
    Promise.all([
      profileAPI.get(username)
        .then(({ data }) => { setProfile(data); setBioText(data.bio || ''); })
        .catch(() => setProfile(null)),
      questionAPI.list({ author: username })
        .then(({ data }) => setQuestions(data.results ?? data))
        .catch(() => {}),
      answerAPI.listByAuthor(username)
        .then(({ data }) => setAnswers(data.results ?? data))
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [username]);

  const handleSaveBio = async () => {
    try {
      await profileAPI.update({ bio: bioText });
      setProfile(profile ? { ...profile, bio: bioText } : null);
      setEditingBio(false);
    } catch {
      alert('Failed to update bio');
    }
  };

  const handleBannerUpload = async ( e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append('banner_image', file);

    try {
        setBannerUploading(true);

        const { data } = await profileAPI.update(formData);

        setProfile((prev) =>
        prev ? { ...prev, banner_image: data.banner_image } : prev
        );
    } catch {
        alert('Failed to upload banner');
    } finally {
        setBannerUploading(false);
    }
    };

  const isOwner = user?.username === username;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Mono:wght@400;500&display=swap');
        .profile-root { font-family: 'DM Mono', 'Courier New', monospace; }
        .serif { font-family: 'Playfair Display', Georgia, serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.45s ease both; }
        .fade-up-1 { animation-delay: 0.04s; }
        .fade-up-2 { animation-delay: 0.10s; }
        .fade-up-3 { animation-delay: 0.17s; }
        .fade-up-4 { animation-delay: 0.24s; }

        .tab-pill {
          position: relative;
          transition: color 0.2s;
        }
        .tab-pill.active { color: #111; }
        .tab-pill:not(.active) { color: #999; }
        .tab-pill.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0; right: 0;
          height: 2px;
          background: #D4A853;
          border-radius: 1px;
        }

        .q-card {
          transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;
          border: 1px solid #E8E4DD;
        }
        .q-card:hover {
          border-color: #D4A853;
          box-shadow: 0 4px 16px rgba(212,168,83,0.1);
          transform: translateY(-1px);
        }

        .banner-pattern {
          background-color: #273183;
          background-image:
            linear-gradient(rgba(212,168,83,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,168,83,0.07) 1px, transparent 1px);
          background-size: 32px 32px;
        }
      `}</style>

      <div className="profile-root min-h-screen" style={{ background: '#F7F5F0' }}>
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">

          {loading && <SkeletonProfile />}


          {!loading && !profile && (
            <div className="flex flex-col items-center py-24 text-center fade-up">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: '#EEEBE5' }}>
                <svg className="w-9 h-9" style={{ color: '#C4BDB4' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="serif text-3xl font-bold text-gray-900 mb-1">User not found</h1>
              <p className="text-sm" style={{ color: '#aaa' }}>This profile doesn't exist.</p>
            </div>
          )}


          {!loading && profile && (
            <>
              <div className="fade-up fade-up-1 rounded-2xl overflow-hidden bg-white"
                style={{ border: '1px solid #E8E4DD', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>

                            <div
                                className="
                                    h-40
                                    sm:h-48
                                    relative
                                    flex
                                    items-center
                                    justify-end
                                    px-8
                                    overflow-hidden
                                    group
                                "
                                style={{
                                    backgroundImage: profile.banner_image
                                    ? `url(${profile.banner_image})`
                                    : undefined,

                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundColor: '#4d4e56',
                                }}>

                                    <div
                                    className="absolute inset-0"
                                    style={{
                                        background:
                                        'linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0.15))',
                                    }} />

                             
                  
                 {!profile.banner_image && (
                    <span
                        className="serif absolute -bottom-6 left-4 select-none pointer-events-none leading-none font-black"
                        style={{
                        fontSize: 'clamp(100px,18vw,180px)',
                        color: 'rgba(212,168,83,0.08)'
                        }}
                    >
                        {profile.username.charAt(0).toUpperCase()}
                    </span>
                    )}

                  
                
                </div>

                
                <div className="px-5 sm:px-7 pb-6">
                  
                  <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-5">
                  
                    <div
                      className="serif w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-4xl flex-shrink-0 select-none z-10"
                      style={{
                        background: '#111',
                        boxShadow: '0 0 0 4px #F7F5F0, 0 4px 16px rgba(0,0,0,0.2)',
                        fontSize: 40,
                      }}
                    >
                      {profile.username.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex flex-1 flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:pb-1 pt-2 sm:pt-12">
                      <div>
                        <h1 className="serif text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                          {profile.username}
                        </h1>
                        <p className="text-xs tracking-widest mt-0.5" style={{ color: '#aaa' }}>
                          @{profile.username}
                        </p>
                      </div>

                             {isOwner && (
            <label
                className=" 
                absolute
                bottom-4
                right-4
                z-20
                cursor-pointer
                px-4
                py-2
                rounded-full
                text-xs
                font-bold
                tracking-widest
                
                transition-all
                hover:scale-105
                "
                style={{
                border: '1px solid #D4A853', color: '#D4A853', background: 'rgba(212,168,83,0.06)',
                backdropFilter: 'blur(10px)',
                }}
            >
                
                {bannerUploading ? 'Uploading...' : 'Edit Banner'}

                <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleBannerUpload}
                />
            </label>
            )}

                      {isOwner && !editingBio && (
                        <button
                          onClick={() => setEditingBio(true)}
                          className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
                          style={{ border: '1px solid #D4A853', color: '#D4A853', background: 'rgba(212,168,83,0.06)' }}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          {profile.bio ? 'Edit bio' : 'Add bio'}
                        </button>
                        
                      )}
                    </div>
                  </div>

                  {editingBio ? (
                    <div className="space-y-3 mb-5">
                      <textarea
                        value={bioText}
                        onChange={e => setBioText(e.target.value)}
                        rows={3}
                        autoFocus
                        className="w-full text-sm leading-relaxed focus:outline-none resize-none rounded-xl px-4 py-3"
                        placeholder="Tell the community about yourself…"
                        style={{
                          background: '#F7F5F0',
                          border: '1.5px solid #D4A853',
                          color: '#111',
                          caretColor: '#D4A853',
                          fontFamily: 'inherit',
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveBio}
                          className="text-xs font-black tracking-widest uppercase px-5 py-2 rounded-xl text-white transition-all hover:scale-[1.02] active:scale-95"
                          style={{ background: '#111' }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditingBio(false); setBioText(profile.bio || ''); }}
                          className="text-xs font-medium px-5 py-2 rounded-xl transition-colors"
                          style={{ background: '#EEEBE5', color: '#666' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : profile.bio ? (
                    <p className="text-sm leading-relaxed mb-5" style={{ color: '#555' }}>
                      {profile.bio}
                    </p>
                  ) : isOwner ? (
                    <p className="text-sm italic mb-5" style={{ color: '#bbb' }}>
                      No bio yet — add one to introduce yourself.
                    </p>
                  ) : null}

            
                  <div
                    className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-5"
                    style={{ borderTop: '1px solid #EEEBE5' }}
                  >
      
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#999' }}>
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Joined <span className="font-medium ml-1" style={{ color: '#555' }}>
                        {new Date(profile.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="hidden sm:block w-px h-5" style={{ background: '#E0DCD5' }} />

                    <div className="flex items-baseline gap-1.5">
                      <span className="serif font-black text-2xl text-gray-900">{questions.length}</span>
                      <span className="text-xs tracking-widest uppercase" style={{ color: '#aaa' }}>Questions</span>
                    </div>

                    <div className="w-px h-5" style={{ background: '#E0DCD5' }} />

                    <div className="flex items-baseline gap-1.5">
                      <span className="serif font-black text-2xl text-gray-900">{answers.length}</span>
                      <span className="text-xs tracking-widest uppercase" style={{ color: '#aaa' }}>Answers</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="fade-up fade-up-2 flex items-center gap-7 px-1 pb-1"
                style={{ borderBottom: '1px solid #E8E4DD' }}>
                {(['questions', 'answers'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`tab-pill pb-3 text-xs font-black tracking-widest uppercase flex items-center gap-2`}
                    style={activeTab === tab ? { color: '#111' } : { color: '#bbb' }}
                  >
                    {tab}
                    <span
                      className="text-xs rounded-full px-2 py-0.5 font-bold transition-colors"
                      style={activeTab === tab
                        ? { background: '#111', color: '#fff' }
                        : { background: '#EEEBE5', color: '#999' }}
                    >
                      {tab === 'questions' ? questions.length : answers.length}
                    </span>
                    {activeTab === tab && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded"
                        style={{ background: '#D4A853' }}
                      />
                    )}
                  </button>
                ))}
              </div>


              {activeTab === 'questions' && (
                <div className="fade-up fade-up-3 space-y-3">
                  {questions.length === 0 ? (
                    <div className="py-16 text-center rounded-2xl"
                      style={{ border: '2px dashed #E0DCD5', background: '#fff' }}>
                      <p className="serif text-xl font-bold text-gray-300 mb-1">No questions yet</p>
                      <p className="text-xs" style={{ color: '#ccc' }}>Questions asked by {username} will appear here.</p>
                    </div>
                  ) : questions.map((q, i) => (
                    <Link key={q.id} href={`/question/${q.id}`}>
                      <div
                        className="q-card bg-white rounded-2xl p-5 flex gap-4 items-start"
                        style={{ animationDelay: `${i * 0.04}s` }}
                      >
                        
                        <div
                          className="flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5"
                          style={{
                            background: q.vote_score > 0 ? 'rgba(34,197,94,0.08)' : q.vote_score < 0 ? 'rgba(239,68,68,0.08)' : '#F7F5F0',
                          }}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            style={{ color: q.vote_score > 0 ? '#16a34a' : q.vote_score < 0 ? '#dc2626' : '#ccc' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                          </svg>
                          <span className="text-xs font-black tabular-nums leading-none"
                            style={{ color: q.vote_score > 0 ? '#16a34a' : q.vote_score < 0 ? '#dc2626' : '#bbb' }}>
                            {q.vote_score}
                          </span>
                        </div>

                        
                        <div className="flex-1 min-w-0">
                          <h3 className="serif font-bold text-gray-900 text-base leading-snug mb-2 group-hover:text-amber-700 transition-colors">
                            {q.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: '#bbb' }}>
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              {q.answer_count} {q.answer_count === 1 ? 'answer' : 'answers'}
                            </span>
                            <span>
                              {new Date(q.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              
              {activeTab === 'answers' && (
                <div className="fade-up fade-up-3 space-y-3">
                  {answers.length === 0 ? (
                    <div className="py-16 text-center rounded-2xl"
                      style={{ border: '2px dashed #E0DCD5', background: '#fff' }}>
                      <p className="serif text-xl font-bold text-gray-300 mb-1">No answers yet</p>
                      <p className="text-xs" style={{ color: '#ccc' }}>Answers posted by {username} will appear here.</p>
                    </div>
                  ) : answers.map((a, i) => (
                    <div key={a.id} className="q-card bg-white rounded-2xl p-5"
                      style={{ animationDelay: `${i * 0.04}s` }}>
                      
                      <Link href={`/question/${a.question.id}`}
                        className="block mb-3 pb-3"
                        style={{ borderBottom: '1px solid #F0ECE5' }}>
                        <p className="text-xs tracking-widest uppercase mb-1.5" style={{ color: '#D4A853' }}>
                          In answer to
                        </p>
                        <h3 className="serif font-bold text-gray-900 text-base leading-snug hover:text-amber-700 transition-colors">
                          {a.question.title}
                        </h3>
                      </Link>

                      
                      <p className="text-sm leading-relaxed line-clamp-2 mb-4" style={{ color: '#666' }}>
                        {a.content}
                      </p>

                      
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center gap-1.5 text-xs font-bold"
                          style={{ color: a.vote_score > 0 ? '#16a34a' : a.vote_score < 0 ? '#dc2626' : '#bbb' }}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                          </svg>
                          {a.vote_score} votes
                        </div>
                        <span className="text-xs" style={{ color: '#bbb' }}>
                          {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}