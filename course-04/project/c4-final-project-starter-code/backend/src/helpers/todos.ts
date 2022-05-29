import { TodosAccess } from './todosAcess'
import FileStore from './attachmentUtils';
// import { TodoItem } from '../models/TodoItem'
// import * as createError from 'http-errors'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

// DONE: Implement businessLogic
const logger = createLogger('createTodo')

const bucketName = process.env.ATTACHMENT_S3_BUCKET

async function getTodosForUser(userId: string) {

    const todos = (new TodosAccess).getTodos(userId)
    return todos
}

async function createTodo(request: CreateTodoRequest, userId) {

    const itemId = uuid.v4()
    const now = new Date().toISOString()

    const newItem = {
        userId: userId,
        todoId: itemId,
        createdAt: now,
        name: request.name,
        dueDate: request.dueDate,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`,
        done: false,
    }

    const todo = await (new TodosAccess).createTodo(newItem)
    return todo
}


async function updateTodo(request: UpdateTodoRequest, todoId, userId) {

    await (new TodosAccess).updateTodo(request, todoId, userId)

    return ""
}

async function deleteTodo(todoId, userId) {

    await (new TodosAccess).deleteTodo(todoId, userId)

    return ""
}

async function createAttachmentPresignedUrl(todoId, userId) {

    const todo = await (new TodosAccess).getTodo(todoId)
    if (todo.userId !== userId) {
        throw new Error("User not authorized")
    }

    const uploadUrl = (new FileStore).getPresignedUrl(todoId)

    logger.info(`Pre-signed URL created: ${uploadUrl}`)

    return {
        "uploadUrl": uploadUrl
    };
}


export {
    getTodosForUser,
    createTodo,
    deleteTodo,
    updateTodo,
    createAttachmentPresignedUrl
}
