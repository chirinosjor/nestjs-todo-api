import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { TodosService } from './todos.service';
import type { Todo } from './todos.interface';

@Controller('/todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) { }

  @Get()
  getTodos() {
    return this.todosService.getTodos();
  }

  @Get(':id')
  getTodo(@Param('id') id: string) {
    const selectedTodo = this.todosService.getTodoById(Number(id));

    if (!selectedTodo) {
      throw new NotFoundException();
    }
    return selectedTodo;
  }

  @Post()
  createTodo(@Body() payload: Omit<Todo, 'id'>) {
    return this.todosService.createTodo(payload);
  }

  @Put(':id')
  updateTodo(@Param('id') id: string, @Body() payload: Todo) {
    const updatedTodo = this.todosService.updateTodo(Number(id), payload);

    if (!updatedTodo) {
      throw new NotFoundException();
    }

    return updatedTodo;
  }

  @Delete(':id')
  deleteTodo(@Param('id') id: string) {
    const deletedTodo = this.todosService.deleteTodo(Number(id));

    if (!deletedTodo) {
      throw new NotFoundException();
    }

    return deletedTodo;
  }
}
