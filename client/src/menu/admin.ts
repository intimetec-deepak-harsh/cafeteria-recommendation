import AdminService from "../service/adminService";

 
class AdminMenu {
 
  async showAdminMenu() {
    let continueLoop = true;
 
    while (continueLoop) {
      const choice: string = await AdminService.showAdminMenu();
 
      switch (choice) {
        case "1":
          await AdminService.showMenuItems();
          break;
        // case "2":
        //   await AdminService.showMenuItems();
        //   await AdminService.addMenuItem();
        //   break;
        // case "3":
        //   await AdminService.showMenuItems();
        //   await AdminService.updateMenuItem();
        //   break;
        // case "4":
        //   await AdminService.showMenuItems();
        //   await AdminService.deleteMenuItem();
        //   break;
        // case "5":
        //   await AdminService.showMenuItems();
        //   await AdminService.updateItemAvailability();
        //   break;
        // case "6":
        //   await AdminService.showMenuItems();
        //   await AdminService.viewFeedbacksofItem();
        // case "7":
        //   AdminService.viewFeedbackReport();
        //   break;
        case "0":
          continueLoop = false;
          break;
        default:
          console.log(
            "Invalid choice. Please select a valid option."
          );
      }
    }
  }
}
 
export const adminMenu = new AdminMenu();