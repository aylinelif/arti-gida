export interface FoodListing {
  id: number;
  businessId: number;
  establishmentName: string;
  title: string;
  description?: string;
  quantity: number;
  pickupTime: string;
  aiCategory: string;
  aiShelfLife: string;
  allergens?: string;
  carbonSaved?: number;
  latitude?: number;
  longitude?: number;
  imageUrl: string;
  isActive?: boolean;
}