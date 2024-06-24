import { RowDataPacket } from "mysql2";

export interface MenuItem  extends RowDataPacket{
    item_Id: number;
    item_name: string;
    availability_status: boolean;
    meal_type: string;
    price: number;
    rating: number;
}


export interface MenuDetails {
     showMenu: MenuItem[];
 }
