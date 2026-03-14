export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
  error?: string;
  message?: string;
  status?: number;
  totalRecord: number;
}
