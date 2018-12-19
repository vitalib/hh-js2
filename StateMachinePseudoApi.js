// import { machine, useContext, useState } from './my-state-machine.js'
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
    // console.log("useState.caller = ", service);
    let machine = service.machine;
    return [machine.currentState, (arg) => machine.setState(arg)]
}

// machine — создает инстанс state machine (фабрика)
const vacancyMachine = machine({
    // У каждого может быть свой id
    id: 'vacancy',
    // начальное состояние
    initialState: 'notResponded',
    // дополнительный контекст (payload)
    context: {id: 123},
    // Граф состояний и переходов между ними
    states: {
        // Каждое поле — это возможное состоение
        responded: {
            // action, который нужно выполнить при входе в это состояние. Можно задавать массивом, строкой или функцией
            onEntry: ['onStateEntry', 'sayYa']
        },
        notResponded: {
            // action, который нужно выполнить при выходе из этого состояния. Можно задавать массивом, строкой или функцией
            onExit() {
                console.log('we are leaving notResponded state');
            },
            // Блок описания транзакций
            on: {
                // Транзакция
                RESPOND: {
                    // упрощенный сервис, вызываем при транзакции
                    service: (event) => {
                        // Позволяет получить текущий контекст и изменить его
                        const [context, setContext] = useContext()
                        // Позволяет получить текущий стейт и изменить его
                        const [state, setState] = useState();
                        // Поддерживаются асинхронные действия
                        // window.fetch({method: 'post', data: {resume: event.resume, vacancyId: context.id} }).then(() => {
                            Promise.resolve("result").then(() => {
                            // меняем состояние
                            //     console.log("In promise");
                            setState('responded');
                            // Мержим контекст
                            setContext({completed: true}); // {id: 123, comleted: true}
                        });
                    },
                    // Если не задан сервис, то просто переводим в заданный target, иначе выполняем сервис.
                    target: 'responded',
                }
            }
        },
    },
    // Раздел описание экшенов
    actions: {
        onStateEntry: function (event) {
            const [state] = useState();
            console.log("now state is " + state)
        },
        sayYa: function(event) {
            console.log("SayYa");
        }
},
/*makeResponse: (event) => {
    // both sync and async actions
    const [contex, setContext] = useContext()
    window.fetch({method: 'post', data: {resume: event.resume, vacancyId: context.id} })
}*/
})

// Пример использования StateMachine
// console.log(vacancyMachine);
vacancyMachine.transition('RESPOND', {resume: {name: 'Vasya', lastName: 'Pupkin'}});
// vacancyMachine.transition('RESPONDA', {resume: {name: 'Vasya', lastName: 'Pupkin'}});
setTimeout(() => console.log("Final vacancy machine: ", vacancyMachine), 0);
