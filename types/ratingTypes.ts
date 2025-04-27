export interface RatingData {
  id_rating: number;
  user_id: number;
  prod_id: number;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string | null;
  created_at: string;
}
