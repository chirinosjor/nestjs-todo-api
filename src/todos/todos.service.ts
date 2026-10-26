import { Injectable } from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from './todos.entity';
import { CreateTodoDto } from './dto/create-todo.dto';

@Injectable()
export class TodosService {

  constructor(@InjectRepository(Todo) private readonly todosRepository: Repository<Todo>) { }

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

  async updateTodo(id: number, payload: CreateTodoDto): Promise<Todo | null> {
    const selectedTodo = await this.todosRepository.findOneBy({ id });

    if (!selectedTodo) {
      return null;
    }

    const updated = { ...selectedTodo, ...payload, id };
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
