import { db } from '../database/connection';
import { MenuItem } from '../interface/menuItem';
import { FeedbackData } from '../interface/feedback';
import sentimentAnalysisService from './sentimentService';
import { RowDataPacket } from 'mysql2/promise';

class MenuService {
  public static sortMenuItemsByRatingSentiment(data: any) {
      throw new Error('Method not implemented.');
  }

  public async getAllFeedbacks(): Promise<FeedbackData[]> {
    const [rows] = await db.execute<FeedbackData[]>('SELECT * FROM Feedback');
    return rows;
  }

  public async sortMenuItemsByRatingSentiment(
    menuFeedbackMap: { [key: number]: { totalRating: number; count: number; totalSentiment: number } },
    limit: number,
    mealType: string
  ): Promise<number[]> {
    const menuEntries = Object.entries(menuFeedbackMap).map(([menuId, stats]) => ({
      menuId: Number(menuId),
      avgRating: stats.totalRating / stats.count,
      avgSentiment: stats.totalSentiment / stats.count,
    }));

    menuEntries.sort((a, b) => b.avgRating + b.avgSentiment - (a.avgRating + a.avgSentiment));

    const filteredEntries = await Promise.all(
      menuEntries.map(async (entry) => {
        const type = await this.getMealType(entry.menuId);
        return type === mealType ? entry : null;
      })
    );

    const validEntries = filteredEntries.filter((entry) => entry !== null) as { menuId: number }[];
    return validEntries.slice(0, limit).map((entry) => entry.menuId);
  }

  public async getMealType(menuId: number): Promise<string> {
    const [rows] = await db.execute<(RowDataPacket & { meal_type: string })[]>(
      'SELECT meal_type FROM MenuItem WHERE menu_Id = ?',
      [menuId]
    );
    return rows.length ? rows[0].meal_type : '';
  }

  public async getMenuItems(mealType: string, menuIds: number[]): Promise<MenuItem[]> {
    if (menuIds.length === 0) return [];

    const placeholders = menuIds.map(() => '?').join(',');
    const [rows] = await db.execute<MenuItem[]>(
      `SELECT * FROM MenuItem WHERE meal_type = ? AND menu_Id IN (${placeholders})`,
      [mealType, ...menuIds]
    );
    return rows;
  }
}

export default MenuService;
