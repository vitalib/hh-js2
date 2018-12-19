const {machine, useContext, useState} = require("./StateMachine");

function test1() {
    let machine1 = machine({
        id: 1,
        context: {color: 'white'},
        initialState: "closed",
        states: {
            "closed": {
                onEntry() {
                    console.log("door closed")
                },
                on: {
                    "OPEN": {
                        service: (event) => {
                            const [context, setContext] = useContext();
                            const [state, setState] = useState();
                            Promise.resolve("Openning door")
                                .then((result) => {
                                    console.log("Async openening the door")
                                    setState("opened");
                                    setContext({opened: true});
                                })
                        }
                    }
                },
                onExit() {
                    console.log("door starts to open");
                }
            },
            "opened": {
                onEntry() {
                    console.log("door open")
                },
                on: {
                    "CLOSE": {
                        service: (event) => {
                            const [context, setContext] = useContext();
                            const [state, setState] = useState();
                            Promise.resolve("async closing door")
                                .then((result) => {
                                    console.log(result)
                                    setState("closed");
                                    setContext({opened: true})
                                })
                        },
                    }
                },
                onExit() {
                    console.log("door starts to close");
                },
            },
        }
    })
    new Promise((resolve) =>{
        console.log("---------Door is closed? ", "closed" == machine1.currentState)
        resolve()})
        .then(machine1.transition("OPEN", {opener: {name: "Vitali", age: 20}}))
        .then((result) => console.log("---------Door is opened? ", result == machine.currentState, result))
        .then(() => machine1.transition("CLOSE", {closer: {name: "Goga", age: 13}}))
        .then((result) => console.log("---------Door is closed", result == machine.currentState, result))


    setTimeout(() =>console.log(machine1), 2);
}

test1();
