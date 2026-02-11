export interface Report {
    id: string;
    animal_id: string;
    reporter_user_id: string;
    reason: string;
    status: string;
    created_at: string;
    animal?: {
        name: string;
        type: string;
        image_url: string;
        user_id: string;
    };
    reporter?: {
        email: string;
        full_name: string | null;
    };
}

export interface StoryReport {
    id: string;
    story_id: string;
    reporter_user_id: string;
    reason: string;
    status: string;
    created_at: string;
    story?: {
        animal_name: string;
        story_text: string;
        story_image_url: string;
        adopter_user_id: string;
    };
    reporter?: {
        email: string;
        full_name: string | null;
    };
}

export interface CitizenReport {
    id: string;
    type: string;
    status: string;
    severity: string;
    description: string;
    location_lat: number;
    location_lng: number;
    images: string[];
    created_at: string;
}

export interface Organization {
    id: string;
    name: string;
    type: string;
    address: string;
    verified: boolean;
    email: string;
    phone: string;
    logo_url: string;
}

export interface AdminUser {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string;
    created_at: string;
    is_banned?: boolean;
}

export interface AdminLog {
    id: string;
    admin_id: string;
    action: string;
    target_id: string | null;
    target_table: string | null;
    details: any;
    created_at: string;
    admin?: {
        full_name: string | null;
        email: string;
    };
}
export interface OrganizationRequest {
    id: string;
    name: string;
    type: string;
    address: string;
    contact_info: string;
    location_lat: number;
    location_lng: number;
    status: string;
    created_at: string;
}
