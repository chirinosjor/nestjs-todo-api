import { Injectable } from '@nestjs/common';
import { Todo } from './todos.interface';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo as TodoEntity } from './todos.entity';

@Injectable()
export class TodosService {

  constructor(@InjectRepository(TodoEntity) private readonly todosRepository: Repository<Todo>) { }

  todos: Todo[] = [];

  getTodos(): Todo[] {
    this.todosRepository.find().then(todos => {
      this.todos = todos;
    });
    return this.todos;
  }

  getTodoById(id: number): Todo | undefined {
    if (this.todos.length === 0 || this.todos === undefined) {
      return undefined;
    }
    return this.todos.find(todo => todo.id === id);
  }

  createTodo(todo: Omit<Todo, 'id'>): Todo {
    const newTodo = { ...todo, id: this.todos.length + 1 };
    this.todos.push(newTodo);
    return newTodo;
  }

  updateTodo(id: number, payload: Todo): Todo | null {
    const selectedTodo = this.todos.find(todo => todo.id === id);
    const updated = { ...selectedTodo, ...payload };
    const findTodoIndex = this.todos.findIndex(todo => todo.id === id);

    if (!selectedTodo) {
      return null;
    }

    this.todos[findTodoIndex] = updated;
    return updated;
  }

  deleteTodo(id: number): Todo | null {
    const selectedTodo = this.todos.find(todo => todo.id === id);
    const findTodoIndex = this.todos.findIndex(todo => todo.id === id);
    if (!selectedTodo) {
      return null;
    }

    this.todos[findTodoIndex] = {
      ...selectedTodo,
      status: 'deleted'
    };

    return this.todos[findTodoIndex];
  }
}
