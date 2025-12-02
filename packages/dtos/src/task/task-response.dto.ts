import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TaskPriority, TaskStatus } from "./enums";

export class TaskResponseDto {
  @ApiProperty({ example: "uuid-1234" })
  id: string;

  @ApiProperty({ example: "Implementar Auth" })
  title: string;

  @ApiPropertyOptional({ example: "Detalhes da implementação..." })
  description?: string;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.TODO })
  status: TaskStatus;

  @ApiProperty({ enum: TaskPriority, example: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @ApiPropertyOptional({ example: "2025-12-31T00:00:00.000Z" })
  dueDate?: Date;

  @ApiProperty({ example: "user-uuid-123" })
  userId: string;

  @ApiPropertyOptional({ example: ["user-uuid-456", "user-uuid-789"] })
  assigneeIds?: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
