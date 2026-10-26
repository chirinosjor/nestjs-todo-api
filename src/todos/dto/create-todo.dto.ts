import { IsIn, IsNotEmpty, IsString } from "class-validator";

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsIn(['created', 'pending', 'completed', 'deleted'])
  status!: string;

}