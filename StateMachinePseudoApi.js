const {machine, useContext, useState} = require("./StateMachine");

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
