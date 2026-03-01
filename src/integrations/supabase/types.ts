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
      build_notes: {
        Row: {
          build_id: string
          created_at: string
          id: string
          text: string
        }
        Insert: {
          build_id: string
          created_at?: string
          id?: string
          text: string
        }
        Update: {
          build_id?: string
          created_at?: string
          id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "build_notes_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "builds"
            referencedColumns: ["id"]
          },
        ]
      }
      builds: {
        Row: {
          created_at: string
          description: string | null
          id: string
          lovable_url: string | null
          name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          lovable_url?: string | null
          name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          lovable_url?: string | null
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      decisions: {
        Row: {
          build_id: string
          context: string | null
          created_at: string
          id: string
          outcome: string | null
          title: string
        }
        Insert: {
          build_id: string
          context?: string | null
          created_at?: string
          id?: string
          outcome?: string | null
          title: string
        }
        Update: {
          build_id?: string
          context?: string | null
          created_at?: string
          id?: string
          outcome?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "decisions_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "builds"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_requests: {
        Row: {
          created_at: string
          id: string
          requester_id: string
          status: string
          target_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          target_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          target_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      ideas: {
        Row: {
          created_at: string
          id: string
          links: string[]
          note: string | null
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          links?: string[]
          note?: string | null
          tags?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          links?: string[]
          note?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          is_public: boolean
          trial_started_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_public?: boolean
          trial_started_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_public?: boolean
          trial_started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_missions: {
        Row: {
          build_id: string
          created_at: string
          id: string
          is_active: boolean
          next_step: string
          priority: string
          time_estimate: string | null
          updated_at: string
        }
        Insert: {
          build_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          next_step?: string
          priority?: string
          time_estimate?: string | null
          updated_at?: string
        }
        Update: {
          build_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          next_step?: string
          priority?: string
          time_estimate?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_missions_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "builds"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          bucket: string
          build_id: string
          created_at: string
          id: string
          is_done: boolean
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          bucket?: string
          build_id: string
          created_at?: string
          id?: string
          is_done?: boolean
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          bucket?: string
          build_id?: string
          created_at?: string
          id?: string
          is_done?: boolean
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "builds"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_sections: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
          position: number
          prompt_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
          prompt_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
          prompt_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_sections_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          content: string
          created_at: string
          id: string
          summary: string | null
          tags: string[]
          title: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          summary?: string | null
          tags?: string[]
          title: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          summary?: string | null
          tags?: string[]
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      public_artifacts: {
        Row: {
          artifact_type: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          prompt_content: string | null
          prompt_context: string | null
          prompt_use_case: string | null
          recommended_model: string | null
          resource_category: string | null
          resource_note: string | null
          resource_url: string | null
          resource_when_to_use: string | null
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artifact_type: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          prompt_content?: string | null
          prompt_context?: string | null
          prompt_use_case?: string | null
          recommended_model?: string | null
          resource_category?: string | null
          resource_note?: string | null
          resource_url?: string | null
          resource_when_to_use?: string | null
          tags?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artifact_type?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          prompt_content?: string | null
          prompt_context?: string | null
          prompt_use_case?: string | null
          recommended_model?: string | null
          resource_category?: string | null
          resource_note?: string | null
          resource_url?: string | null
          resource_when_to_use?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          domain: string | null
          favicon_url: string | null
          file_name: string | null
          file_type: string | null
          file_url: string | null
          id: string
          og_title: string | null
          tags: string[]
          title: string
          url: string
          user_id: string
        }
        Insert: {
          category?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          domain?: string | null
          favicon_url?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          og_title?: string | null
          tags?: string[]
          title: string
          url: string
          user_id: string
        }
        Update: {
          category?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          domain?: string | null
          favicon_url?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          og_title?: string | null
          tags?: string[]
          title?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_artifacts: {
        Row: {
          artifact_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          artifact_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          artifact_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_artifacts_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "public_artifacts"
            referencedColumns: ["id"]
          },
        ]
      }
      session_debriefs: {
        Row: {
          blockers: string | null
          build_id: string
          created_at: string
          id: string
          mood: string | null
          next_session_plan: string | null
          what_learned: string | null
          what_shipped: string | null
        }
        Insert: {
          blockers?: string | null
          build_id: string
          created_at?: string
          id?: string
          mood?: string | null
          next_session_plan?: string | null
          what_learned?: string | null
          what_shipped?: string | null
        }
        Update: {
          blockers?: string | null
          build_id?: string
          created_at?: string
          id?: string
          mood?: string | null
          next_session_plan?: string | null
          what_learned?: string | null
          what_shipped?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_debriefs_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "builds"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_log: {
        Row: {
          build_id: string
          created_at: string
          description: string | null
          entry_type: string
          id: string
          title: string
        }
        Insert: {
          build_id: string
          created_at?: string
          description?: string | null
          entry_type?: string
          id?: string
          title: string
        }
        Update: {
          build_id?: string
          created_at?: string
          description?: string | null
          entry_type?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_log_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "builds"
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
