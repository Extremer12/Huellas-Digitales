export interface OrganizationRequest {
    id?: string;
    created_at?: string;
    name: string;
    type: "veterinaria" | "refugio" | "ong"; // refined type based on select
    address: string;
    contact_info: string;
    location_lat: number;
    location_lng: number;
    status?: "pending" | "approved" | "rejected";
    user_id?: string;
}
