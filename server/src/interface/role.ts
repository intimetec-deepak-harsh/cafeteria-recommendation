import { RowDataPacket } from 'mysql2/promise';

export interface Role extends RowDataPacket {
    role: string;
}