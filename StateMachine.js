class StateMachine {
    constructor(config) {
         this.id = config.id;
         this.context = config.context;
         this.currentState = config.initialState;
         this.states = config.states;
         this.actions = config.actions;
    }

    transition(event, data) {
            const curState = this.states[this.currentState];
            const handledEvent = curState["on"][event];
            if (!handledEvent) {
                throw new Error("Event '" + event + "' for state '" + this.currentState + "' doesn't exists");
            }
            const service = handledEvent["service"];
            if (service) {
                service.machine = this;
            }
            return new Promise((resolve) =>
                resolve(this.callActions("onExit")))
                .then(() => {
                    if (service) {
                        service(data);
                    } else {
                        let targetState = curState["on"][event]["target"];
                        this.setState(targetState)
                    }
                    return this;
                })
    }

    setContext(newContext) {
        Object.assign(this.context, newContext);
    }

    setState(targetState) {
         this.currentState = targetState;
         this.callActions("onEntry");

    }

    callActions(actionName) {
        const actionsForCall = [];
        const action = this.states[this.currentState][actionName];
        if (typeof action == "string" ) {
            this.actions[action].machine = this;
            actionsForCall.push(this.actions[action])
        } else if(typeof action == "function") {
            actionsForCall.push(action)
        } else {
            for (let act of action) {
                if (typeof act == "function") {
                    actionsForCall.push(act)
                } else if (typeof act == "string") {
                    this.actions[act].machine = this;
                    actionsForCall.push(this.actions[act])
                }
            }
        }
        for (let func of actionsForCall) {
            func();
        }
    }
}

function machine(config) {
    return new StateMachine(config);
}

function useContext() {
    const service = useContext.caller;
    return [service.machine.context, (arg) => service.machine.setContext(arg)]
}

function useState() {
    const service = useState.caller;
    return [service.machine.currentState, (arg) => service.machine.setState(arg)]
}

module.exports = {machine, useContext, useState};