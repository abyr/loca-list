import DbCoordinator from './DbCoordinator';
import { Setting } from '../models/Setting';

export class SettingsDAO {
  private db = new DbCoordinator();

  async initDB(): Promise<void> {
    await this.db.getAllSettings();
  }

  async getAllSettings(): Promise<Setting[]> {
    return this.db.getAllSettings();
  }

  async saveSetting(setting: Setting): Promise<void> {
    return this.db.saveSetting(setting);
  }
}

const settingsDAO = new SettingsDAO();
export default settingsDAO;
