export interface ListingCreate {
  title: string;
  description?: string;
  category: string;
  quantity: number;
  pickup_time: string;
  image_url?: string;
  ai_shelf_life?: string;
  business_id?: number;
}
