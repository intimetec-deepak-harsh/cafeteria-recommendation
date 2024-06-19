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

      return new Promise((resolve) => {
          setTimeout(() => {
              resolve("0"); 
          }, 1000);
      });
  }
  
}

export default AdminService;



