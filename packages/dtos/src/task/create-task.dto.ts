import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsISO8601,
} from "class-validator";
import { TaskPriority } from "./enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateTaskDto {
  @ApiProperty({ example: "Implementar Auth" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: "Detalhes da implementação..." })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: TaskPriority, example: TaskPriority.MEDIUM })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: "2025-12-31" })
  @IsISO8601()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ example: ["uuid-1", "uuid-2"] })
  @IsString({ each: true })
  @IsOptional()
  assigneeIds?: string[];
}
