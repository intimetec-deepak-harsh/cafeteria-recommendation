import * as readline from 'readline';

class UserPrompt {
    constructor(private rl: readline.Interface) {}

    public async askQuestion(question: string): Promise<string> {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => resolve(answer));
        });
    }
}

export default UserPrompt;