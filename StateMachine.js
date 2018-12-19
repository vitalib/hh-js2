function machine(config) {
    let aMachine = {
        context: config.context,
        currentState: config.initialState,
        states: config.states,
        actions: config.actions,
        transition(event, data) {
            let curState = this.states[this.currentState];
            let service;
            try {
                service = curState["on"][event]["service"];
            } catch (e) {
                throw new Error("Event '" + event + "' for state '" + this.currentState + "' doesn't exists");
            }
            if (service) {
                service.machine = this;
                service(data);
            } else {
                let target = curState["on"][event]["target"];
                this.setState(target)
            }
        },
        setContext(newContext) {
            Object.assign(this.context, newContext);
        },
        setState(newState) {
            this.callActions("onExit"),
                this.currentState = newState;
            this.callActions("onEntry")
        },
        callActions(actionName) {
            let actionsForCall = [];
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
        },
    }
    return aMachine;
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