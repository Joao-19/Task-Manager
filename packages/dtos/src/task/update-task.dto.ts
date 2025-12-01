import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsISO8601, IsOptional, IsString } from "class-validator";
import { TaskPriority } from "./enums";

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: "Implementar Auth" })
  @IsString()
  @IsOptional()
  title?: string;

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
}
