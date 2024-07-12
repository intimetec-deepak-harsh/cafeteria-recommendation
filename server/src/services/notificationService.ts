import { RowDataPacket } from "mysql2";
import { db } from "../database/connection";
import { defaultItemValues } from "../interface/constant";
import { Notification } from "../interface/notification";
import { User } from "../interface/user";
import userService from "../services/userService";
import DateService from "./DateService";
import LogService from "./LogService";

 class NotificationService {
public  static async addNotificationOLD(notification: Notification): Promise<any> {
    try {
        await db.execute('INSERT INTO Notification SET ?', [notification]);
        console.log("Notification added successfully:", notification);
      } catch (error: any) {
        throw new Error("Error adding notification: " + error.message);
      }
  }

 public static async addNotification(type: string, message: string, menuId: number) {
    const currentDate = DateService.getCurrentDate();
    console.log("addNotification", currentDate);

    const notification = {
      notification_type: type,
      message: message,
      notification_date: currentDate,
      menu_id: menuId,
    };
    try {
        await db.execute(
          'INSERT INTO notification (notification_type, message, notification_date, menu_id) VALUES (?, ?, ?, ?)',
          [type, message, currentDate, menuId]
      );
      console.log("Notification added successfully:", { type, message, currentDate, menuId });      } catch (error: any) {
        throw new Error("Error adding notification: " + error.message);
      }
  }

    public async seeNotifications(): Promise<Notification[]> {
    // const expiryDays = defaultItemValues.notification_expiry;
    // const expiryDate = DateService.getNthPreviousDate(expiryDays);
    // const formatedExpiryDate = expiryDate.split(" ")[0];
   
    const [rows] = await db.execute<Notification[]>(
        'SELECT * FROM notification WHERE notification_date ORDER BY notification_date DESC',
        // [formatedExpiryDate]
      );
      return rows;

  }
}

export default NotificationService;