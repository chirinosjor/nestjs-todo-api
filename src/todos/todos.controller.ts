import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { TodosService } from './todos.service';
import { Todo } from './todos.entity';
import { CreateTodoDto } from './dto/create-todo.dto';

@Controller('/todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) { }

  @Get()
  getTodos() {
    return this.todosService.getTodos();
  }

  @Get(':id')
  async getTodo(@Param('id') id: string) {
    const selectedTodo = await this.todosService.getTodoById(Number(id));

    if (!selectedTodo) {
      throw new NotFoundException();
    }
    return selectedTodo;
  }

  @Post()
  createTodo(@Body() payload: CreateTodoDto) {
    return this.todosService.createTodo(payload);
  }

  @Put(':id')
  async updateTodo(@Param('id') id: string, @Body() payload: CreateTodoDto) {
    const updatedTodo = await this.todosService.updateTodo(Number(id), payload);

    if (!updatedTodo) {
      throw new NotFoundException();
    }

    return updatedTodo;
  }

  @Delete(':id')
  async deleteTodo(@Param('id') id: string) {
    const deletedTodo = await this.todosService.deleteTodo(Number(id));

    if (!deletedTodo) {
      throw new NotFoundException();
    }

    return deletedTodo;
  }
}
