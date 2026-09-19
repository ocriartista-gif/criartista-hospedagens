export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accommodation_images: {
        Row: {
          accommodation_id: string
          alt_text: string | null
          id: string
          is_cover: boolean
          sort_order: number
          storage_path: string
        }
        Insert: {
          accommodation_id: string
          alt_text?: string | null
          id?: string
          is_cover?: boolean
          sort_order?: number
          storage_path: string
        }
        Update: {
          accommodation_id?: string
          alt_text?: string | null
          id?: string
          is_cover?: boolean
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_images_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["id"]
          },
        ]
      }
      accommodations: {
        Row: {
          adults: number
          amenities: Json
          beds: string | null
          capacity: number
          children: number
          created_at: string
          description: string | null
          id: string
          name: string
          property_id: string
          published: boolean
          short_description: string | null
          size_m2: number | null
          slug: string
          sort_order: number
        }
        Insert: {
          adults?: number
          amenities?: Json
          beds?: string | null
          capacity?: number
          children?: number
          created_at?: string
          description?: string | null
          id?: string
          name: string
          property_id: string
          published?: boolean
          short_description?: string | null
          size_m2?: number | null
          slug: string
          sort_order?: number
        }
        Update: {
          adults?: number
          amenities?: Json
          beds?: string | null
          capacity?: number
          children?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          property_id?: string
          published?: boolean
          short_description?: string | null
          size_m2?: number | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "accommodations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      content_sections: {
        Row: {
          description: string | null
          enabled: boolean
          extra: Json
          eyebrow: string | null
          id: string
          property_id: string
          section_key: string
          title: string | null
        }
        Insert: {
          description?: string | null
          enabled?: boolean
          extra?: Json
          eyebrow?: string | null
          id?: string
          property_id: string
          section_key: string
          title?: string | null
        }
        Update: {
          description?: string | null
          enabled?: boolean
          extra?: Json
          eyebrow?: string | null
          id?: string
          property_id?: string
          section_key?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_sections_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          config: Json
          enabled: boolean
          id: string
          integration_key: string
          property_id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          enabled?: boolean
          id?: string
          integration_key: string
          property_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          enabled?: boolean
          id?: string
          integration_key?: string
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          activity_type: string
          actor_user_id: string | null
          created_at: string
          description: string | null
          id: string
          lead_id: string
          metadata: Json
          property_id: string
          title: string
        }
        Insert: {
          activity_type: string
          actor_user_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lead_id: string
          metadata?: Json
          property_id: string
          title: string
        }
        Update: {
          activity_type?: string
          actor_user_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string
          metadata?: Json
          property_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_priority_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          accommodation_id: string | null
          adults: number
          assigned_to: string | null
          campaign: string | null
          check_in: string | null
          check_out: string | null
          children: number
          created_at: string
          do_not_contact: boolean
          email: string | null
          id: string
          last_contact: string | null
          lost_reason: string | null
          medium: string | null
          name: string
          next_follow_up: string | null
          nights: number | null
          notes: string | null
          priority_override: number | null
          property_id: string
          quoted_value: number | null
          scheduled_contact_at: string | null
          scheduled_contact_note: string | null
          source: string | null
          status: string
          whatsapp: string
        }
        Insert: {
          accommodation_id?: string | null
          adults?: number
          assigned_to?: string | null
          campaign?: string | null
          check_in?: string | null
          check_out?: string | null
          children?: number
          created_at?: string
          do_not_contact?: boolean
          email?: string | null
          id?: string
          last_contact?: string | null
          lost_reason?: string | null
          medium?: string | null
          name: string
          next_follow_up?: string | null
          nights?: number | null
          notes?: string | null
          priority_override?: number | null
          property_id: string
          quoted_value?: number | null
          scheduled_contact_at?: string | null
          scheduled_contact_note?: string | null
          source?: string | null
          status?: string
          whatsapp: string
        }
        Update: {
          accommodation_id?: string | null
          adults?: number
          assigned_to?: string | null
          campaign?: string | null
          check_in?: string | null
          check_out?: string | null
          children?: number
          created_at?: string
          do_not_contact?: boolean
          email?: string | null
          id?: string
          last_contact?: string | null
          lost_reason?: string | null
          medium?: string | null
          name?: string
          next_follow_up?: string | null
          nights?: number | null
          notes?: string | null
          priority_override?: number | null
          property_id?: string
          quoted_value?: number | null
          scheduled_contact_at?: string | null
          scheduled_contact_note?: string | null
          source?: string | null
          status?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          slug: string
          status: string
          tagline: string | null
          timezone: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          slug: string
          status?: string
          tagline?: string | null
          timezone?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          slug?: string
          status?: string
          tagline?: string | null
          timezone?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      property_members: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          property_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          property_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          property_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_members_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_themes: {
        Row: {
          accent_color: string
          background_color: string
          body_font: string
          eyebrow_font: string
          eyebrow_spacing: string
          eyebrow_transform: string
          eyebrow_weight: string
          heading_font: string
          primary_color: string
          property_id: string
          secondary_color: string
          text_color: string
          updated_at: string
        }
        Insert: {
          accent_color?: string
          background_color?: string
          body_font?: string
          eyebrow_font?: string
          eyebrow_spacing?: string
          eyebrow_transform?: string
          eyebrow_weight?: string
          heading_font?: string
          primary_color?: string
          property_id: string
          secondary_color?: string
          text_color?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string
          background_color?: string
          body_font?: string
          eyebrow_font?: string
          eyebrow_spacing?: string
          eyebrow_transform?: string
          eyebrow_weight?: string
          heading_font?: string
          primary_color?: string
          property_id?: string
          secondary_color?: string
          text_color?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_themes_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          featured: boolean
          guest_name: string
          id: string
          photo_path: string | null
          property_id: string
          published: boolean
          rating: number
          review_date: string | null
          review_text: string
          source: string | null
          source_url: string | null
        }
        Insert: {
          created_at?: string
          featured?: boolean
          guest_name: string
          id?: string
          photo_path?: string | null
          property_id: string
          published?: boolean
          rating: number
          review_date?: string | null
          review_text: string
          source?: string | null
          source_url?: string | null
        }
        Update: {
          created_at?: string
          featured?: boolean
          guest_name?: string
          id?: string
          photo_path?: string | null
          property_id?: string
          published?: boolean
          rating?: number
          review_date?: string | null
          review_text?: string
          source?: string | null
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      social_links: {
        Row: {
          facebook: string | null
          instagram: string | null
          linkedin: string | null
          property_id: string
          tiktok: string | null
          updated_at: string
          youtube: string | null
        }
        Insert: {
          facebook?: string | null
          instagram?: string | null
          linkedin?: string | null
          property_id: string
          tiktok?: string | null
          updated_at?: string
          youtube?: string | null
        }
        Update: {
          facebook?: string | null
          instagram?: string | null
          linkedin?: string | null
          property_id?: string
          tiktok?: string | null
          updated_at?: string
          youtube?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_links_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      lead_priority_queue: {
        Row: {
          accommodation_id: string | null
          adults: number | null
          assigned_to: string | null
          campaign: string | null
          check_in: string | null
          check_out: string | null
          children: number | null
          created_at: string | null
          do_not_contact: boolean | null
          email: string | null
          id: string | null
          last_contact: string | null
          local_today: string | null
          lost_reason: string | null
          medium: string | null
          name: string | null
          next_follow_up: string | null
          next_seasonal_date: string | null
          nights: number | null
          notes: string | null
          priority_level: string | null
          priority_override: number | null
          priority_reasons: string[] | null
          priority_score: number | null
          property_id: string | null
          property_timezone: string | null
          queue_type: string | null
          quoted_value: number | null
          scheduled_contact_at: string | null
          scheduled_contact_note: string | null
          source: string | null
          status: string | null
          whatsapp: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
