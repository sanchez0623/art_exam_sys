import type { Database } from './database';

// ─── Table row aliases ─────────────────────────────────────────────────────
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Period = Database['public']['Tables']['periods']['Row'];
export type Artist = Database['public']['Tables']['artists']['Row'];
export type Artwork = Database['public']['Tables']['artworks']['Row'];
export type Tag = Database['public']['Tables']['tags']['Row'];
export type ArtworkTag = Database['public']['Tables']['artwork_tags']['Row'];
export type ArtistTag = Database['public']['Tables']['artist_tags']['Row'];
export type Note = Database['public']['Tables']['notes']['Row'];
export type Favorite = Database['public']['Tables']['favorites']['Row'];
export type NotionArticle = Database['public']['Tables']['notion_articles']['Row'];

// ─── Extended/joined types used in the UI ─────────────────────────────────
export type ArtistWithPeriod = Artist & { periods: Period | null };
export type ArtworkWithRelations = Artwork & {
  artists: Artist | null;
  periods: Period | null;
  tags: Tag[];
};
export type NoteWithEntity = Note & {
  entity_label?: string;
};

// ─── Form input types ──────────────────────────────────────────────────────
export type ArtistInput = {
  name: string;
  birth_year?: number | null;
  death_year?: number | null;
  nationality?: string | null;
  bio?: string | null;
  period_id?: string | null;
  image_url?: string | null;
  tag_ids?: string[];
};

export type ArtworkInput = {
  title: string;
  artist_id?: string | null;
  year?: number | null;
  medium?: string | null;
  dimensions?: string | null;
  description?: string | null;
  image_url?: string | null;
  period_id?: string | null;
  tag_ids?: string[];
};

export type PeriodInput = {
  name: string;
  start_year?: number | null;
  end_year?: number | null;
  description?: string | null;
};

export type TagInput = {
  name: string;
  color?: string;
};

export type NoteInput = {
  title: string;
  content?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
};

// ─── Search ────────────────────────────────────────────────────────────────
export type SearchResult = {
  id: string;
  type: 'artist' | 'artwork' | 'period' | 'note' | 'notion_article';
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  href: string;
};

// ─── Pagination ────────────────────────────────────────────────────────────
export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};
