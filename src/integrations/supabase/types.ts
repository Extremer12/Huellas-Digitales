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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      adoption_stories: {
        Row: {
          adopter_user_id: string
          animal_id: string | null
          animal_name: string | null
          created_at: string
          id: string
          story_image_url: string
          story_text: string
          updated_at: string
        }
        Insert: {
          adopter_user_id: string
          animal_id?: string | null
          animal_name?: string | null
          created_at?: string
          id?: string
          story_image_url: string
          story_text: string
          updated_at?: string
        }
        Update: {
          adopter_user_id?: string
          animal_id?: string | null
          animal_name?: string | null
          created_at?: string
          id?: string
          story_image_url?: string
          story_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "adoption_stories_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      animal_images: {
        Row: {
          animal_id: string
          created_at: string
          display_order: number
          id: string
          image_url: string
        }
        Insert: {
          animal_id: string
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
        }
        Update: {
          animal_id?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "animal_images_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      animals: {
        Row: {
          age: string
          created_at: string
          description: string
          health_info: string | null
          id: string
          image_url: string
          location: string
          name: string
          personality: string | null
          size: string
          status: string
          type: Database["public"]["Enums"]["animal_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          age: string
          created_at?: string
          description: string
          health_info?: string | null
          id?: string
          image_url: string
          location: string
          name: string
          personality?: string | null
          size: string
          status?: string
          type: Database["public"]["Enums"]["animal_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: string
          created_at?: string
          description?: string
          health_info?: string | null
          id?: string
          image_url?: string
          location?: string
          name?: string
          personality?: string | null
          size?: string
          status?: string
          type?: Database["public"]["Enums"]["animal_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      citizen_reports: {
        Row: {
          created_at: string
          description: string
          id: string
          images: string[] | null
          latitude: number | null
          location_name: string | null
          longitude: number | null
          reporter_id: string | null
          severity: Database["public"]["Enums"]["report_severity"]
          status: Database["public"]["Enums"]["report_status"]
          type: Database["public"]["Enums"]["report_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          images?: string[] | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          reporter_id?: string | null
          severity?: Database["public"]["Enums"]["report_severity"]
          status?: Database["public"]["Enums"]["report_status"]
          type: Database["public"]["Enums"]["report_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          images?: string[] | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          reporter_id?: string | null
          severity?: Database["public"]["Enums"]["report_severity"]
          status?: Database["public"]["Enums"]["report_status"]
          type?: Database["public"]["Enums"]["report_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "citizen_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          adopter_id: string
          animal_id: string
          created_at: string
          id: string
          publisher_id: string
          updated_at: string
        }
        Insert: {
          adopter_id: string
          animal_id: string
          created_at?: string
          id?: string
          publisher_id: string
          updated_at?: string
        }
        Update: {
          adopter_id?: string
          animal_id?: string
          created_at?: string
          id?: string
          publisher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      medical_records: {
        Row: {
          animal_id: string
          created_at: string
          date: string
          description: string | null
          id: string
          next_due_date: string | null
          type: Database["public"]["Enums"]["medical_record_type"]
          updated_at: string
        }
        Insert: {
          animal_id: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          next_due_date?: string | null
          type: Database["public"]["Enums"]["medical_record_type"]
          updated_at?: string
        }
        Update: {
          animal_id?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          next_due_date?: string | null
          type?: Database["public"]["Enums"]["medical_record_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          address: string
          created_at: string
          description: string | null
          email: string
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          type: Database["public"]["Enums"]["organization_type"]
          updated_at: string
          userId: string
          verified: boolean
          website_url: string | null
        }
        Insert: {
          address: string
          created_at?: string
          description?: string | null
          email: string
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          type: Database["public"]["Enums"]["organization_type"]
          updated_at?: string
          userId: string
          verified?: boolean
          website_url?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          type?: Database["public"]["Enums"]["organization_type"]
          updated_at?: string
          userId?: string
          verified?: boolean
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_banned: boolean | null
          province: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_banned?: boolean | null
          province?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_banned?: boolean | null
          province?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          animal_id: string
          created_at: string
          id: string
          reason: string
          reporter_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          animal_id: string
          created_at?: string
          id?: string
          reason: string
          reporter_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          animal_id?: string
          created_at?: string
          id?: string
          reason?: string
          reporter_user_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      story_reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_user_id: string
          status: string
          story_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_user_id: string
          status?: string
          story_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_user_id?: string
          status?: string
          story_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_reports_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "adoption_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_province: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      animal_type: "perro" | "gato" | "otro"
      app_role: "admin" | "moderator" | "user"
      medical_record_type:
      | "vaccine"
      | "sterilization"
      | "checkup"
      | "surgery"
      | "other"
      organization_type: "shelter" | "vet" | "municipality" | "ngo"
      report_severity: "low" | "medium" | "high" | "urgent"
      report_status: "pending" | "investigating" | "resolved" | "dismissed"
      report_type: "abuse" | "stray_sighting" | "lost_pet" | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      animal_type: ["perro", "gato", "otro"],
      app_role: ["admin", "moderator", "user"],
      medical_record_type: [
        "vaccine",
        "sterilization",
        "checkup",
        "surgery",
        "other",
      ],
      organization_type: ["shelter", "vet", "municipality", "ngo"],
      report_severity: ["low", "medium", "high", "urgent"],
      report_status: ["pending", "investigating", "resolved", "dismissed"],
      report_type: ["abuse", "stray_sighting", "lost_pet", "other"],
    },
  },
} as const
