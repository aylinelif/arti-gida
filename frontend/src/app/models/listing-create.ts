export interface ListingCreate {
  title: string;
  description?: string;
  category: string;
  quantity: number;
  pickup_time: string;
  image_url?: string;
  ai_shelf_life?: string;
  allergens?: string;
  carbon_saved?: number;
  latitude?: number;
  longitude?: number;
  business_id?: number;
}
