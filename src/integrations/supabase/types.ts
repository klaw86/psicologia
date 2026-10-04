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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          created_at: string
          duracao_min: number
          email: string
          id: string
          inicio: string
          mensagem: string | null
          modalidade: string
          nome: string
          notas: string | null
          paciente_id: string | null
          status: Database["public"]["Enums"]["status_agendamento"]
          telefone: string
        }
        Insert: {
          created_at?: string
          duracao_min?: number
          email: string
          id?: string
          inicio: string
          mensagem?: string | null
          modalidade: string
          nome: string
          notas?: string | null
          paciente_id?: string | null
          status?: Database["public"]["Enums"]["status_agendamento"]
          telefone: string
        }
        Update: {
          created_at?: string
          duracao_min?: number
          email?: string
          id?: string
          inicio?: string
          mensagem?: string | null
          modalidade?: string
          nome?: string
          notas?: string | null
          paciente_id?: string | null
          status?: Database["public"]["Enums"]["status_agendamento"]
          telefone?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      artigos: {
        Row: {
          categoria: string
          conteudo: string
          created_at: string
          id: string
          publicado: boolean
          publicado_em: string | null
          resumo: string
          slug: string
          titulo: string
          updated_at: string
        }
        Insert: {
          categoria?: string
          conteudo?: string
          created_at?: string
          id?: string
          publicado?: boolean
          publicado_em?: string | null
          resumo?: string
          slug: string
          titulo: string
          updated_at?: string
        }
        Update: {
          categoria?: string
          conteudo?: string
          created_at?: string
          id?: string
          publicado?: boolean
          publicado_em?: string | null
          resumo?: string
          slug?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      depoimentos: {
        Row: {
          aprovado: boolean
          autor: string
          created_at: string
          id: string
          texto: string
        }
        Insert: {
          aprovado?: boolean
          autor: string
          created_at?: string
          id?: string
          texto: string
        }
        Update: {
          aprovado?: boolean
          autor?: string
          created_at?: string
          id?: string
          texto?: string
        }
        Relationships: []
      }
      disponibilidade: {
        Row: {
          ativo: boolean
          dia_semana: number
          hora_fim: string
          hora_inicio: string
          id: string
        }
        Insert: {
          ativo?: boolean
          dia_semana: number
          hora_fim: string
          hora_inicio: string
          id?: string
        }
        Update: {
          ativo?: boolean
          dia_semana?: number
          hora_fim?: string
          hora_inicio?: string
          id?: string
        }
        Relationships: []
      }
      mensagens_contato: {
        Row: {
          created_at: string
          email: string
          id: string
          lida: boolean
          mensagem: string
          nome: string
          telefone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          lida?: boolean
          mensagem: string
          nome: string
          telefone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          lida?: boolean
          mensagem?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      pacientes: {
        Row: {
          ativo: boolean
          created_at: string
          data_nascimento: string | null
          email: string | null
          id: string
          modalidade_preferida: string
          nome: string
          observacoes: string | null
          telefone: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          id?: string
          modalidade_preferida?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          id?: string
          modalidade_preferida?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          secao: string
          chave: string
          valor: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          secao: string
          chave: string
          valor: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          secao?: string
          chave?: string
          valor?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_blocks: {
        Row: {
          id: string
          pagina: string
          secao: string
          chave: string
          tipo: string
          valor: Json
          ordem: number
          visivel: boolean
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pagina: string
          secao: string
          chave: string
          tipo?: string
          valor: Json
          ordem?: number
          visivel?: boolean
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pagina?: string
          secao?: string
          chave?: string
          tipo?: string
          valor?: Json
          ordem?: number
          visivel?: boolean
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          id: string
          url: string
          alt: string | null
          tamanho: number | null
          tipo: string | null
          criado_em: string
          created_at: string
        }
        Insert: {
          id?: string
          url: string
          alt?: string | null
          tamanho?: number | null
          tipo?: string | null
          criado_em?: string
          created_at?: string
        }
        Update: {
          id?: string
          url?: string
          alt?: string | null
          tamanho?: number | null
          tipo?: string | null
          criado_em?: string
          created_at?: string
        }
        Relationships: []
      }
      content_versions: {
        Row: {
          id: string
          content_block_id: string
          valor: Json
          status: string
          alterado_por: string | null
          created_at: string
        }
        Insert: {
          id?: string
          content_block_id: string
          valor: Json
          status?: string
          alterado_por?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          content_block_id?: string
          valor?: Json
          status?: string
          alterado_por?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_versions_content_block_id_fkey"
            columns: ["content_block_id"]
            isOneToOne: false
            referencedRelation: "content_blocks"
            referencedColumns: ["id"]
          }
        ]
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
      horarios_ocupados: {
        Args: { _ate: string; _de: string }
        Returns: string[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      status_agendamento:
        | "solicitado"
        | "confirmado"
        | "realizado"
        | "cancelado"
        | "faltou"
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
    Enums: {
      app_role: ["admin", "user"],
      status_agendamento: [
        "solicitado",
        "confirmado",
        "realizado",
        "cancelado",
        "faltou",
      ],
    },
  },
} as const
