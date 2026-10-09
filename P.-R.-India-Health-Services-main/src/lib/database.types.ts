export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      service_requests: {
        Row: {
          id: string;
          created_at: string;
          reference_id: string;
          patient_name: string;
          patient_age: number;
          contact_number: string;
          alternate_contact_number: string | null;
          address: string;
          city: string;
          pincode: string;
          service_required: string;
          equipment_required: string[];
          preferred_date: string | null;
          preferred_time: string | null;
          expected_duration: string | null;
          urgency: string;
          additional_requirements: string | null;
          status: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          reference_id: string;
          patient_name: string;
          patient_age: number;
          contact_number: string;
          alternate_contact_number?: string | null;
          address: string;
          city: string;
          pincode: string;
          service_required: string;
          equipment_required?: string[];
          preferred_date?: string | null;
          preferred_time?: string | null;
          expected_duration?: string | null;
          urgency?: string;
          additional_requirements?: string | null;
          status?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          reference_id?: string;
          patient_name?: string;
          patient_age?: number;
          contact_number?: string;
          alternate_contact_number?: string | null;
          address?: string;
          city?: string;
          pincode?: string;
          service_required?: string;
          equipment_required?: string[];
          preferred_date?: string | null;
          preferred_time?: string | null;
          expected_duration?: string | null;
          urgency?: string;
          additional_requirements?: string | null;
          status?: string;
        };
      };
      team_registrations: {
        Row: {
          id: string;
          created_at: string;
          application_id: string;
          full_name: string;
          phone: string;
          email: string;
          city: string;
          areas_served: string;
          profession: string;
          qualification: string;
          experience: string;
          license_number: string | null;
          services_provided: string[];
          availability: string;
          additional_info: string | null;
          verification_status: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          application_id: string;
          full_name: string;
          phone: string;
          email: string;
          city: string;
          areas_served: string;
          profession: string;
          qualification: string;
          experience: string;
          license_number?: string | null;
          services_provided?: string[];
          availability: string;
          additional_info?: string | null;
          verification_status?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          application_id?: string;
          full_name?: string;
          phone?: string;
          email?: string;
          city?: string;
          areas_served?: string;
          profession?: string;
          qualification?: string;
          experience?: string;
          license_number?: string | null;
          services_provided?: string[];
          availability?: string;
          additional_info?: string | null;
          verification_status?: string;
        };
      };
      contact_messages: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          phone: string;
          email: string;
          subject: string;
          message: string;
          status: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          phone: string;
          email: string;
          subject: string;
          message: string;
          status?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          phone?: string;
          email?: string;
          subject?: string;
          message?: string;
          status?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          role: "admin" | "coordinator";
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          role: "admin" | "coordinator";
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          role?: "admin" | "coordinator";
        };
      };
      equipment_types: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          category: string;
          description: string | null;
          active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          category: string;
          description?: string | null;
          active?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          category?: string;
          description?: string | null;
          active?: boolean;
        };
      };
      equipment_assets: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          equipment_type_id: string;
          asset_code: string;
          serial_number: string | null;
          status: "available" | "assigned" | "maintenance" | "unavailable";
          notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          equipment_type_id: string;
          asset_code: string;
          serial_number?: string | null;
          status?: "available" | "assigned" | "maintenance" | "unavailable";
          notes?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          equipment_type_id?: string;
          asset_code?: string;
          serial_number?: string | null;
          status?: "available" | "assigned" | "maintenance" | "unavailable";
          notes?: string | null;
        };
      };
      service_request_assignments: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          service_request_id: string;
          assignment_type: "professional" | "equipment";
          professional_id: string | null;
          equipment_asset_id: string | null;
          status: "active" | "released";
          assigned_at: string;
          released_at: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          service_request_id: string;
          assignment_type: "professional" | "equipment";
          professional_id?: string | null;
          equipment_asset_id?: string | null;
          status?: "active" | "released";
          assigned_at?: string;
          released_at?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          service_request_id?: string;
          assignment_type?: "professional" | "equipment";
          professional_id?: string | null;
          equipment_asset_id?: string | null;
          status?: "active" | "released";
          assigned_at?: string;
          released_at?: string | null;
          notes?: string | null;
        };
      };
      service_request_activity: {
        Row: {
          id: string;
          created_at: string;
          service_request_id: string;
          event_type:
            | "request_created"
            | "status_changed"
            | "professional_assigned"
            | "professional_released"
            | "equipment_assigned"
            | "equipment_released";
          actor_user_id: string | null;
          description: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          service_request_id: string;
          event_type:
            | "request_created"
            | "status_changed"
            | "professional_assigned"
            | "professional_released"
            | "equipment_assigned"
            | "equipment_released";
          actor_user_id?: string | null;
          description: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          service_request_id?: string;
          event_type?:
            | "request_created"
            | "status_changed"
            | "professional_assigned"
            | "professional_released"
            | "equipment_assigned"
            | "equipment_released";
          actor_user_id?: string | null;
          description?: string;
          metadata?: Json;
        };
      };
      notifications: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          service_request_id: string | null;
          activity_id: string | null;
          recipient_type: "patient" | "professional" | "admin";
          recipient_name: string | null;
          recipient_email: string | null;
          recipient_phone: string | null;
          channel: "email" | "whatsapp" | "sms";
          event_type:
            | "request_received"
            | "request_under_review"
            | "request_contacted"
            | "request_scheduled"
            | "professional_assigned"
            | "professional_released"
            | "new_service_request"
            | "new_team_registration"
            | "new_contact_message";
          subject: string | null;
          message: string;
          status: "queued" | "processing" | "sent" | "delivered" | "failed" | "cancelled";
          provider: string | null;
          provider_message_id: string | null;
          attempt_count: number;
          last_attempt_at: string | null;
          next_retry_at: string | null;
          sent_at: string | null;
          delivered_at: string | null;
          failed_at: string | null;
          error_message: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          service_request_id?: string | null;
          activity_id?: string | null;
          recipient_type: "patient" | "professional" | "admin";
          recipient_name?: string | null;
          recipient_email?: string | null;
          recipient_phone?: string | null;
          channel: "email" | "whatsapp" | "sms";
          event_type:
            | "request_received"
            | "request_under_review"
            | "request_contacted"
            | "request_scheduled"
            | "professional_assigned"
            | "professional_released"
            | "new_service_request"
            | "new_team_registration"
            | "new_contact_message";
          subject?: string | null;
          message: string;
          status?: "queued" | "processing" | "sent" | "delivered" | "failed" | "cancelled";
          provider?: string | null;
          provider_message_id?: string | null;
          attempt_count?: number;
          last_attempt_at?: string | null;
          next_retry_at?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          failed_at?: string | null;
          error_message?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          service_request_id?: string | null;
          activity_id?: string | null;
          recipient_type?: "patient" | "professional" | "admin";
          recipient_name?: string | null;
          recipient_email?: string | null;
          recipient_phone?: string | null;
          channel?: "email" | "whatsapp" | "sms";
          event_type?:
            | "request_received"
            | "request_under_review"
            | "request_contacted"
            | "request_scheduled"
            | "professional_assigned"
            | "professional_released"
            | "new_service_request"
            | "new_team_registration"
            | "new_contact_message";
          subject?: string | null;
          message?: string;
          status?: "queued" | "processing" | "sent" | "delivered" | "failed" | "cancelled";
          provider?: string | null;
          provider_message_id?: string | null;
          attempt_count?: number;
          last_attempt_at?: string | null;
          next_retry_at?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          failed_at?: string | null;
          error_message?: string | null;
          metadata?: Json;
        };
      };
      notification_preferences: {
        Row: {
          id: string;
          event_type:
            | "request_received"
            | "request_under_review"
            | "request_contacted"
            | "request_scheduled"
            | "professional_assigned"
            | "professional_released"
            | "new_service_request"
            | "new_team_registration"
            | "new_contact_message";
          email_enabled: boolean;
          whatsapp_enabled: boolean;
          sms_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_type:
            | "request_received"
            | "request_under_review"
            | "request_contacted"
            | "request_scheduled"
            | "professional_assigned"
            | "professional_released"
            | "new_service_request"
            | "new_team_registration"
            | "new_contact_message";
          email_enabled?: boolean;
          whatsapp_enabled?: boolean;
          sms_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_type?:
            | "request_received"
            | "request_under_review"
            | "request_contacted"
            | "request_scheduled"
            | "professional_assigned"
            | "professional_released"
            | "new_service_request"
            | "new_team_registration"
            | "new_contact_message";
          email_enabled?: boolean;
          whatsapp_enabled?: boolean;
          sms_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      assign_professional_to_request: {
        Args: {
          p_request_id: string;
          p_professional_id: string;
          p_notes?: string | null;
        };
        Returns: string;
      };
      assign_equipment_to_request: {
        Args: {
          p_request_id: string;
          p_asset_id: string;
          p_notes?: string | null;
        };
        Returns: string;
      };
      release_professional_assignment: {
        Args: {
          p_assignment_id: string;
        };
        Returns: boolean;
      };
      release_equipment_assignment: {
        Args: {
          p_assignment_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
