import { RowDataPacket } from 'mysql2/promise';

export interface User extends RowDataPacket {
    id: number;
    name: string;
    email: string;
    password: string;
    roleId: number; 
}