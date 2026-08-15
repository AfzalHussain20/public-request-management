export type RequestStatus =
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED'
  | 'DUPLICATE'

export type Role = 'ADMIN' | 'STAFF'

type Relationships = []

type MasterDataRow = {
  id: string
  code: string | null
  name_en: string
  name_ta: string
  active: boolean
  source: string | null
  source_version: string | null
  effective_from: string | null
  effective_to: string | null
  created_at: string
}

type MasterDataInsert = {
  id?: string
  code?: string | null
  name_en: string
  name_ta?: string
  active?: boolean
  source?: string | null
  source_version?: string | null
  effective_from?: string | null
  effective_to?: string | null
  created_at?: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string | null
          role: Role
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string
          email?: string | null
          role?: Role
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          email?: string | null
          role?: Role
          updated_at?: string
        }
        Relationships: Relationships
      }
      categories: {
        Row: {
          id: string
          name_en: string
          name_ta: string
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name_en: string
          name_ta?: string
          active?: boolean
          created_at?: string
        }
        Update: {
          name_en?: string
          name_ta?: string
          active?: boolean
        }
        Relationships: Relationships
      }
      districts: {
        Row: MasterDataRow
        Insert: MasterDataInsert
        Update: {
          name_en?: string
          name_ta?: string
          active?: boolean
        }
        Relationships: Relationships
      }
      taluks: {
        Row: MasterDataRow & { district_id: string }
        Insert: MasterDataInsert & { district_id: string }
        Update: {
          name_en?: string
          name_ta?: string
          active?: boolean
        }
        Relationships: Relationships
      }
      local_body_types: {
        Row: {
          id: string
          code: string | null
          name_en: string
          name_ta: string
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code?: string | null
          name_en: string
          name_ta?: string
          active?: boolean
          created_at?: string
        }
        Update: {
          name_en?: string
          name_ta?: string
          active?: boolean
        }
        Relationships: Relationships
      }
      local_bodies: {
        Row: MasterDataRow & {
          district_id: string
          local_body_type_id: string
          taluk_id: string | null
        }
        Insert: MasterDataInsert & {
          district_id: string
          local_body_type_id: string
          taluk_id?: string | null
        }
        Update: {
          name_en?: string
          name_ta?: string
          active?: boolean
        }
        Relationships: Relationships
      }
      wards: {
        Row: MasterDataRow & { local_body_id: string }
        Insert: MasterDataInsert & { local_body_id: string }
        Update: {
          name_en?: string
          name_ta?: string
          active?: boolean
        }
        Relationships: Relationships
      }
      assembly_constituencies: {
        Row: MasterDataRow
        Insert: MasterDataInsert
        Update: {
          name_en?: string
          name_ta?: string
          active?: boolean
        }
        Relationships: Relationships
      }
      parliament_constituencies: {
        Row: MasterDataRow
        Insert: MasterDataInsert
        Update: {
          name_en?: string
          name_ta?: string
          active?: boolean
        }
        Relationships: Relationships
      }
      assembly_parliament_mapping: {
        Row: {
          id: string
          assembly_constituency_id: string
          parliament_constituency_id: string
          effective_from: string | null
          effective_to: string | null
          source: string | null
          source_version: string | null
          created_at: string
        }
        Insert: {
          id?: string
          assembly_constituency_id: string
          parliament_constituency_id: string
          effective_from?: string | null
          effective_to?: string | null
          source?: string | null
          source_version?: string | null
          created_at?: string
        }
        Update: {
          parliament_constituency_id?: string
        }
        Relationships: Relationships
      }
      requests: {
        Row: {
          id: string
          request_number: string
          name: string
          initial: string
          mobile: string
          alternate_mobile: string | null
          district_id: string | null
          taluk_id: string | null
          local_body_id: string | null
          ward_id: string | null
          assembly_constituency_id: string | null
          parliament_constituency_id: string | null
          address: string
          category_id: string | null
          subject: string
          description: string
          status: RequestStatus
          assigned_to: string | null
          internal_notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          initial?: string
          mobile: string
          alternate_mobile?: string | null
          district_id?: string | null
          taluk_id?: string | null
          local_body_id?: string | null
          ward_id?: string | null
          assembly_constituency_id?: string | null
          parliament_constituency_id?: string | null
          address?: string
          category_id?: string | null
          subject: string
          description?: string
          status?: RequestStatus
          assigned_to?: string | null
          internal_notes?: string
        }
        Update: {
          name?: string
          initial?: string
          mobile?: string
          alternate_mobile?: string | null
          district_id?: string | null
          taluk_id?: string | null
          local_body_id?: string | null
          ward_id?: string | null
          assembly_constituency_id?: string | null
          parliament_constituency_id?: string | null
          address?: string
          category_id?: string | null
          subject?: string
          description?: string
          status?: RequestStatus
          assigned_to?: string | null
          internal_notes?: string
          updated_at?: string
        }
        Relationships: Relationships
      }
      attachments: {
        Row: {
          id: string
          request_id: string
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          file_name: string
          file_path: string
          file_type?: string
          file_size?: number
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: Relationships
      }
      request_counters: {
        Row: {
          year: number
          last_number: number
        }
        Insert: {
          year?: number
          last_number?: number
        }
        Update: {
          last_number?: number
        }
        Relationships: Relationships
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
