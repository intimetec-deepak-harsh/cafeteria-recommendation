import promptSync from 'prompt-sync';

const prompt = promptSync();

export default class AdminService {
  static showAdminMenu(): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log(
        `Admin Menu:\n` +
          `1.W View Menu\n` +
          `2.W Add Menu Item\n` +
          `3.W Update Menu Item\n` +
          `4.W Delete Menu Item\n` +
          `5.W Update Item Availability\n` +
          `6.W View Feedbacks of Item\n` +
          `7.W inChef View Feedback Report\n` +
          `0. Logout`
      );
     
   
      const choice = prompt('Enter your choice: ');
      resolve(choice);
      console.log('choice is :',choice);
   
    //   const choice = '1'// take input
    //   resolve(choice);
    });
  }


  static  async  showMenuItems() {
    return new Promise((resolve, reject) => {
    //   socketService.emitEvent(
    //      "showMenuItems",
    //      { meal_type: "desc" },
    //    (response: any) => {
    //     console.log(response.message);
    //       resolve(response.message);
    //      }
    //   );

    console.log('this is show menu items')
    });
  }
}


