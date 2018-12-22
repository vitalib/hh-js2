class MachineStack {
    constructor() {
        this.stack = [];
        this.length = 0;
    }

    push(value) {
        this.stack.push(value);
        this.length++;
    }

    pop() {
        if (this.isEmpty()) {
            throw new Error("Stack is empty");
        }
        this.length--;
        return this.stack.pop();
    }

    isEmpty() {
        return this.length === 0;
    }

    getTopElement() {
        if (this.isEmpty()) {
            throw new Error("Stack is empty");
        }
        return this.stack[this.length-1];
    }
}
module.exports  = {MachineStack};
