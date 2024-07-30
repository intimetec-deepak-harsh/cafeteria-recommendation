import { RowDataPacket } from "mysql2";

export interface MenuItem  extends RowDataPacket{
    item_Id: number;
    item_name: string;
    availability_status: boolean;
    meal_type: number;
    price: number;
    rating: number;
    dietary_type: "vegetarian" | "non-vegetarian" | "eggetarian";
    spice_type: "high" | "medium" | "low";
    cuisine_type: "north-indian" | "south-indian" | "other";
    sweet_tooth_type: boolean;
    is_discard: boolean | null;
}

export type DietaryType = "vegetarian" | "non-vegetarian" | "eggetarian";
export type SpiceType = "high" | "medium" | "low";
export type CuisineType = "north-indian" | "south-indian" | "other";

export interface MenuDetails {
     showMenu: MenuItem[];
 }

 export interface MealType extends RowDataPacket {
    id: number;
    meal_type_name: string;
 }

 export const allowedDietaryTypes: DietaryType[] = [
    "vegetarian",
    "non-vegetarian",
    "eggetarian",
  ];

export const allowedSpicyTypes: SpiceType[] = ["high", "medium", "low"];

export const allowedCuisineTypes: CuisineType[] = [
  "north-indian",
  "south-indian",
  "other",
];