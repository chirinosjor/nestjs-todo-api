import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodosModule } from './todos/todos.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './todos/todos.entity';

const DbModule = TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'todo_user',
  password: 'todo_password',
  database: 'todo_db',
  entities: [Todo],
  synchronize: true, // temporary — real migrations come later, per your own earlier call
});

@Module({
  imports: [TodosModule, DbModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
