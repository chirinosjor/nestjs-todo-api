import { Injectable } from '@nestjs/common';
import { Todo } from './todos.interface';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo as TodoEntity } from './todos.entity';

@Injectable()
export class TodosService {

  constructor(@InjectRepository(TodoEntity) private readonly todosRepository: Repository<Todo>) { }

  todos: Todo[] = [];

  getTodos(): Promise<Todo[]> {
    return this.todosRepository.find({
      where: { status: Not('deleted') }
    });
  }

  getTodoById(id: number): Promise<Todo | null> {
    return this.todosRepository.findOneBy({ id });
  }

  createTodo(todo: Omit<Todo, 'id'>): Promise<Todo> {
    const todoPayload = this.todosRepository.create(todo);
    return this.todosRepository.save(todoPayload);
  }

  async updateTodo(id: number, payload: Todo): Promise<Todo | null> {
    const selectedTodo = await this.todosRepository.findOneBy({ id });
    const updated = { ...selectedTodo, ...payload };

    if (!selectedTodo) {
      return null;
    }

    const saved = await this.todosRepository.save(updated);
    return saved;
  }

  async deleteTodo(id: number): Promise<Todo | null> {
    const selectedTodo = await this.todosRepository.findOneBy({ id });

    if (!selectedTodo) {
      return null;
    }

    const deleted = { ...selectedTodo, status: 'deleted' as const };

    return await this.todosRepository.save(deleted);
  }
}
