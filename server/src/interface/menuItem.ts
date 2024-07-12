import { RowDataPacket } from "mysql2";

export interface MenuItem  extends RowDataPacket{
    item_Id: number;
    item_name: string;
    availability_status: boolean;
    meal_type: number;
    price: number;
    rating: number;
}

export interface MenuDetails {
     showMenu: MenuItem[];
 }

 export interface MealType extends RowDataPacket {
    id: number;
    meal_type_name: string;
 }