import _delay from 'lodash/delay'

/* Mock Server / Database logic */

const rawTodoList = [
    {
        id: Math.random(),
        text: 'Finish UTH series',
        completed: false
    },
    {
        id: Math.random(),
        text: 'Play basketball',
        completed: false
    },
    {
        id: Math.random(),
        text: 'Challenge friend to a race',
        completed: true
    },
]

const promiseTimer = () => {
    return new Promise((resolve) => _delay(resolve, 1500))
}

const getTodosFromDatabase = async () => {
    try {
        let data
        await promiseTimer()
        const todos = localStorage.getItem('todosRecord')

        if (todos) {
            data = { status: '200', todos: JSON.parse(todos) }
        } else {
            data = { status: '200', todos: rawTodoList }
            localStorage.setItem('todosRecord', JSON.stringify(rawTodoList))
        }

        return data.status === '200' && Promise.resolve({ status: '200', data: data.todos })
    } catch (err) {
        return Promise.reject({ status: '500', data: err })
    }
}

const updateTodosDatabase = async (todos) => {
    try {
        const successfulUpdate = await _delay((updatedTodos) => {
            localStorage.setItem('todosRecord', JSON.stringify(updatedTodos))
            return true;
        }, 1500, todos)

        return successfulUpdate && Promise.resolve({ status: '200', data: todos})
    } catch (err) {
        return Promise.reject({ status: '500', data: err })
    }
}

// Mock Route Handlers

class ApiHandler {
    constructor(route) {
        this.route = route
    }

    async executeRoute(res, req) {
        switch (this.route) {
            case '/getTodos':
                return await getTodosFromDatabase()
            case '/updateTodos':
                return await updateTodosDatabase(req.body.todos)
            default:
                return Promise.reject({ status: '400', data: 'Not a route handler' })
        }
    }
}

const getTodosRoute = new ApiHandler('/getTodos')
const updateTodosRoute = new ApiHandler('/updateTodos')

const apiHandlerStrategy = {
    'localhost:3000/getTodos': getTodosRoute,
    'localhost:3000/updateTodos': updateTodosRoute
};


// Mock Client Fetch

export async function mockFetch(url, body) {
    if (!url) {
        return Promise.reject({ status: '400', data: 'Route must be specified' })
    }

    return await apiHandlerStrategy[url].executeRoute(null, { body })
}
