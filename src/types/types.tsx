export interface Student {
    university_id: string;
    name: string;
    email: string;
    status: 'active' | 'inactive' | 'completed';
    company?: string;
    offer_letter_status?: 'pending' | 'approved' | 'rejected';
    report_status?: 'pending_review' | 'approved' | 'rejected';
    report_type?: string;
    // Add other fields as needed


    export interface TelegramMessagePayload {
      message: string;
      student_ids?: string[] | null;
    }
  }