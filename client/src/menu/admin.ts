import AdminService from "../service/adminService";

class AdminMenu {
    async showAdminMenu() {
        let continueLoop = true;

        while (continueLoop) {
            const choice: string = await AdminService.showAdminMenu();

            switch (choice) {
                case "1":
                    // Handle view menu items logic
                    break;
                // Add cases for other admin functionalities
                case "0":
                    continueLoop = false;
                    break;
                default:
                    console.log("Invalid choice. Please select a valid option.");
            }
        }
    }
}

export const adminMenu = new AdminMenu();
