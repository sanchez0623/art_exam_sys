// Auto-generated Supabase database types.
// Run `supabase gen types typescript --linked` to regenerate from a live project.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      periods: {
        Row: {
          id: string;
          name: string;
          start_year: number | null;
          end_year: number | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          start_year?: number | null;
          end_year?: number | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          start_year?: number | null;
          end_year?: number | null;
          description?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      artists: {
        Row: {
          id: string;
          name: string;
          birth_year: number | null;
          death_year: number | null;
          nationality: string | null;
          bio: string | null;
          period_id: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          birth_year?: number | null;
          death_year?: number | null;
          nationality?: string | null;
          bio?: string | null;
          period_id?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          birth_year?: number | null;
          death_year?: number | null;
          nationality?: string | null;
          bio?: string | null;
          period_id?: string | null;
          image_url?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'artists_period_id_fkey';
            columns: ['period_id'];
            isOneToOne: false;
            referencedRelation: 'periods';
            referencedColumns: ['id'];
          },
        ];
      };
      artworks: {
        Row: {
          id: string;
          title: string;
          artist_id: string | null;
          year: number | null;
          medium: string | null;
          dimensions: string | null;
          description: string | null;
          image_url: string | null;
          period_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          artist_id?: string | null;
          year?: number | null;
          medium?: string | null;
          dimensions?: string | null;
          description?: string | null;
          image_url?: string | null;
          period_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          artist_id?: string | null;
          year?: number | null;
          medium?: string | null;
          dimensions?: string | null;
          description?: string | null;
          image_url?: string | null;
          period_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'artworks_artist_id_fkey';
            columns: ['artist_id'];
            isOneToOne: false;
            referencedRelation: 'artists';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'artworks_period_id_fkey';
            columns: ['period_id'];
            isOneToOne: false;
            referencedRelation: 'periods';
            referencedColumns: ['id'];
          },
        ];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
        };
        Relationships: [];
      };
      artwork_tags: {
        Row: {
          artwork_id: string;
          tag_id: string;
        };
        Insert: {
          artwork_id: string;
          tag_id: string;
        };
        Update: {
          artwork_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'artwork_tags_artwork_id_fkey';
            columns: ['artwork_id'];
            isOneToOne: false;
            referencedRelation: 'artworks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'artwork_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
        ];
      };
      artist_tags: {
        Row: {
          artist_id: string;
          tag_id: string;
        };
        Insert: {
          artist_id: string;
          tag_id: string;
        };
        Update: {
          artist_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'artist_tags_artist_id_fkey';
            columns: ['artist_id'];
            isOneToOne: false;
            referencedRelation: 'artists';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'artist_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
        ];
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string | null;
          entity_type: string | null;
          entity_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          entity_type: string;
          entity_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entity_type: string;
          entity_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          entity_type?: string;
          entity_id?: string;
        };
        Relationships: [];
      };
      notion_articles: {
        Row: {
          id: string;
          notion_page_id: string;
          title: string;
          content: string | null;
          cover_url: string | null;
          tags: string[] | null;
          synced_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          notion_page_id: string;
          title: string;
          content?: string | null;
          cover_url?: string | null;
          tags?: string[] | null;
          synced_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          notion_page_id?: string;
          title?: string;
          content?: string | null;
          cover_url?: string | null;
          tags?: string[] | null;
          synced_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

