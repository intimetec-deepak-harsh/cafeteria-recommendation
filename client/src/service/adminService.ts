import promptSync from 'prompt-sync';

const prompt = promptSync();

class AdminService {
  public static async showAdminMenu(menuItems: any[]): Promise<string> {
      console.log("Admin Menu Items:");
      menuItems.forEach((item, index) => {
          console.log(`${index + 1}. ${item.itemName} - ${item.rating}`);
      });
      
      // Display options to the admin
      console.log("1. View Menu Items");
      // Add other menu options here
      console.log("0. Exit");

      // For simplicity, return a mock choice, in real scenarios use a prompt to get user choice
      return new Promise((resolve) => {
          setTimeout(() => {
              resolve("0"); // Mock choice, for real implementation use a prompt library
          }, 1000);
      });
  }
  
  // Implement other methods like addMenuItem, updateMenuItem etc.
}

export default AdminService;



