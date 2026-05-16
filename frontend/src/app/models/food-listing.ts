export interface FoodListing {
  id: number;
  establishmentName: string;
  title: string;
  description?: string;
  quantity: number;
  pickupTime: string;
  aiCategory: string;
  aiShelfLife: string;
  imageUrl: string;
  isActive?: boolean;
}