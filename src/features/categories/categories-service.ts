import { api } from "../../lib/api";
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "./types";

export async function getCategories() {
  const response = await api.get<Category[]>("/Categories");
  return response.data;
}

export async function createCategory(data: CreateCategoryRequest) {
  const response = await api.post<Category>("/Categories", data);
  return response.data;
}

export async function updateCategory(id: string, data: UpdateCategoryRequest) {
  const response = await api.put<Category>(`/Categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: string) {
  await api.delete(`/Categories/${id}`);
}
