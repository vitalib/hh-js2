class StateMachine {
    constructor(config) {
         this.id = config.id;
         this.context = config.context;
         this.currentState = config.initialState;
         this.states = config.states;
         this.actions = config.actions;
    }

    transition(event, data, machineArg) {
        const curState = this.states[this.currentState];
        const handledEvent = curState.on[event];
        if (!handledEvent) {
            throw new Error("Event '" + event + "' for state '" + this.currentState + "' doesn't exists");
        }
        const service = handledEvent["service"];
        this.callActions("onExit");
        if (service) {
            machinesStack.push(this);
            service(data);
            machinesStack.pop();
        } else {
            let targetState = this.getTargetState(handledEvent);
            this.setState(targetState);
        }
    }

    getTargetState(handledEvent) {
        if (handledEvent.hasOwnProperty("target")) {
            return handledEvent[target];
        } else {
            throw new Error("Target state for machine " + this.id + "is not specified.")
        }
    }


    setContext(newContext) {
        Object.assign(this.context, newContext);
    }

    setState(targetState) {
        if (!this.states.hasOwnProperty(targetState)) {
            throw new Error("Incorrect target state " + targetState);
        }
         this.currentState = targetState;
         this.callActions("onEntry");
    }

    callActions(actionName) {
        const actionsForCall = [];
        const action = this.states[this.currentState][actionName];
        if (typeof action == "string" ) {
            actionsForCall.push(this.actions[action])
        } else if(typeof action == "function") {
            actionsForCall.push(action)
        } else {
            for (let act of action) {
                if (typeof act == "function") {
                    actionsForCall.push(act)
                } else if (typeof act == "string") {
                    actionsForCall.push(this.actions[act])
                }
            }
        }
        for (let func of actionsForCall) {
            machinesStack.push(this);
            func();
            machinesStack.pop();
        }
    }
}

let machinesStack = [];

function getTopMachineFromStack() {
    let machineStackPosition = machinesStack.length - 1;
    if (machineStackPosition < 0) {
        throw new Error("No machines are available")
    }
    let machine = machinesStack[machineStackPosition];
    return machine;
}

function machine(config) {
    return new StateMachine(config);
}

function useContext() {
    let machine = getTopMachineFromStack();
    return [machine.context, arg => machine.setContext(arg)]
}

function useState() {
    let machine = getTopMachineFromStack();
    return [machine.currentState, (arg) => machine.setState(arg)]
}

module.exports = {machine, useContext, useState};