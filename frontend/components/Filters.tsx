'use client';
import { useState, useEffect } from 'react';
import { categoryAPI } from '../lib/api';
import api from '../lib/api';

interface Category { id: number; name: string; }
interface Tag { id: number; name: string; }
interface FilterProps {
  onFilterChange?: (filters: { category?: number; tag?: number; sort?: string }) => void;
}

export default function Filters({ onFilterChange }: FilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    categoryAPI.list().then(({ data }) => setCategories(data.results ?? data));
    api.get('/tags/').then(({ data }) => setTags(data.results ?? data));
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    onFilterChange?.({
      category: e.target.value ? parseInt(e.target.value) : undefined,
      tag: selectedTag ? parseInt(selectedTag) : undefined,
      sort: sortBy
    });
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTag(e.target.value);
    onFilterChange?.({
      category: selectedCategory ? parseInt(selectedCategory) : undefined,
      tag: e.target.value ? parseInt(e.target.value) : undefined,
      sort: sortBy
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    onFilterChange?.({
      category: selectedCategory ? parseInt(selectedCategory) : undefined,
      tag: selectedTag ? parseInt(selectedTag) : undefined,
      sort: e.target.value
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 px-6 py-4 mb-6 shadow-sm">
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </span>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all cursor-pointer hover:bg-slate-100"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedTag}
            onChange={handleTagChange}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all cursor-pointer hover:bg-slate-100"
          >
            <option value="">All Tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>#{tag.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all cursor-pointer hover:bg-slate-100"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="answers">Most Answers</option>
            <option value="votes">Most Votes</option>
          </select>
        </div>
      </div>
    </div>
  );
}
