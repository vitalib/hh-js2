class StateMachine {
    constructor(config) {
         this.id = config.id;
         this.context = config.context;
         this.currentState = config.initialState;
         this.states = config.states;
         this.actions = config.actions;
    }

    transition(event, data) {
         new Promise((resolve) => {
            let curState = this.states[this.currentState];
            let handledEvent = curState["on"][event];
            if (!handledEvent) {
                throw new Error("Event '" + event + "' for state '" + this.currentState + "' doesn't exists");
            }
            let service = handledEvent["service"];
            if (service) {
                service.machine = this;
                service(data);
            } else {
                let target = curState["on"][event]["target"];
                this.setState(target)
            }
            resolve(this.currentState);
        })
    }

    setContext(newContext) {
        Object.assign(this.context, newContext);
    }

    setState(newState) {
        new Promise((resolve, reject) => {
            try {
                resolve(this.callActions("onExit"));
            } catch (e) {
                throw e;
            }})
                .then(() => this.currentState = newState)
                .then(() => this.callActions("onEntry"))
                .catch((reason) => console.log("Error: ", reason))

    }

    callActions(actionName) {
        let actionsForCall = [];
        // console.log("actionName", actionName, " ", this.currentState)
        let action = this.states[this.currentState][actionName];
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
    let service = useContext.caller;
    let machine = service.machine;
    return [machine.context, (arg) => machine.setContext(arg)]
}

function useState() {
    let service = useState.caller;
    let machine = service.machine;
    return [machine.currentState, (arg) => machine.setState(arg)]
}

module.exports = {machine, useContext, useState};