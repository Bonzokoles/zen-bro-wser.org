/**
 * Mock database for iframe sites
 * W produkcji: zamień na Supabase/MongoDB/PostgreSQL
 */

import type { IframeSite } from '../../../types/iframe/core.types';

// Simulated database storage
let sitesDb: IframeSite[] = [
  {
    id: '1',
    name: 'CodePen Embed',
    url: 'https://codepen.io/team/codepen/embed/preview/PNaGbb',
    category: 'Playgrounds',
    sandbox: 'allow-scripts allow-same-origin',
    height: '450px',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['code', 'playground', 'frontend'],
  },
  {
    id: '2',
    name: 'JSFiddle Embed',
    url: 'https://jsfiddle.net/boilerplate/javascript/embed/result/',
    category: 'Playgrounds',
    sandbox: 'allow-scripts allow-same-origin',
    height: '450px',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['code', 'playground', 'javascript'],
  },
  {
    id: '3',
    name: 'Wikipedia Main',
    url: 'https://en.wikipedia.org/wiki/Main_Page',
    category: 'Education',
    sandbox: 'allow-scripts allow-same-origin',
    height: '600px',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['education', 'wiki', 'reference'],
  },
  {
    id: '4',
    name: 'HTTPBin',
    url: 'https://httpbin.org',
    category: 'APIs',
    sandbox: 'allow-scripts allow-same-origin',
    height: '500px',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['api', 'testing', 'http'],
  },
  {
    id: '5',
    name: 'YouTube Video',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Media',
    sandbox: 'allow-scripts allow-same-origin allow-presentation',
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
    height: '450px',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['video', 'media', 'youtube'],
  },
];

export const mockDatabase = {
  sites: {
    findAll: async (): Promise<IframeSite[]> => {
      return [...sitesDb];
    },

    findById: async (id: string): Promise<IframeSite | null> => {
      return sitesDb.find((site) => site.id === id) || null;
    },

    findByCategory: async (category: string): Promise<IframeSite[]> => {
      return sitesDb.filter((site) => site.category === category);
    },

    create: async (site: Omit<IframeSite, 'id' | 'createdAt' | 'updatedAt'>): Promise<IframeSite> => {
      const newSite: IframeSite = {
        ...site,
        id: `site_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      sitesDb.push(newSite);
      return newSite;
    },

    update: async (id: string, updates: Partial<IframeSite>): Promise<IframeSite | null> => {
      const index = sitesDb.findIndex((site) => site.id === id);
      if (index === -1) return null;

      sitesDb[index] = {
        ...sitesDb[index],
        ...updates,
        id: sitesDb[index].id, // Don't allow ID change
        updatedAt: new Date().toISOString(),
      };
      return sitesDb[index];
    },

    delete: async (id: string): Promise<boolean> => {
      const initialLength = sitesDb.length;
      sitesDb = sitesDb.filter((site) => site.id !== id);
      return sitesDb.length < initialLength;
    },

    search: async (query: string): Promise<IframeSite[]> => {
      const lowerQuery = query.toLowerCase();
      return sitesDb.filter(
        (site) =>
          site.name.toLowerCase().includes(lowerQuery) ||
          site.url.toLowerCase().includes(lowerQuery) ||
          site.category.toLowerCase().includes(lowerQuery) ||
          site.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    },
  },
};
