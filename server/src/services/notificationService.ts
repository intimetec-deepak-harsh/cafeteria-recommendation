import { db } from "../database/connection";
import { Notification } from "../interface/notification";
import DateService from "./DateService";

 class NotificationService {
  static async addNotificationOLD(notification: Notification): Promise<any> {
    try {
        await db.execute('INSERT INTO Notification SET ?', [notification]);
        console.log("Notification added successfully:", notification);
      } catch (error: any) {
        throw new Error("Error adding notification: " + error.message);
      }
  }

  static async addNotification(type: string, message: string, menuId: number) {
    const currentDate = DateService.getCurrentDate();
    console.log("addNotification", currentDate);

    const notification = {
      notification_type: type,
      message: message,
      notification_date: currentDate,
      menu_id: menuId,
    };
    try {
      const checkCurrentDate = new Date().toISOString().split('T')[0];
        const [rows] = await db.execute(
          'SELECT * FROM notification WHERE notification_date = ?',
          [checkCurrentDate]
      );

      if (Array.isArray(rows) && rows.length === 0) {
          await db.execute('TRUNCATE TABLE notification');
          console.log("Previous notifications truncated.");
      }

        await db.execute(
          'INSERT INTO notification (notification_type, message, notification_date, menu_id) VALUES (?, ?, ?, ?)',
          [type, message, currentDate, menuId]
      );
      console.log("Notification added successfully:", { type, message, currentDate, menuId });      } catch (error: any) {
        throw new Error("Error adding notification: " + error.message);
      }
  }

     async seeNotifications(): Promise<Notification[]> {
    const [rows] = await db.execute<Notification[]>(
       'SELECT * FROM notification WHERE notification_date ORDER BY notification_date DESC;',
      );
      return rows;
  }

   async seeEmployeeNotifications(): Promise<Notification[]> {
    const [rows] = await db.execute<Notification[]>(
        'SELECT * FROM notification WHERE DATE(notification_date) = CURDATE() ORDER BY notification_date DESC'
    );
    return rows.length > 0 ? rows : [];
}


}

export default NotificationService;