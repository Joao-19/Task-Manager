export default interface Task {
  uuid: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  assignees: string[]; // USERS UUID ?
}
