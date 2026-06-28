import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Alert } from "../../components/ui/Alert";
import { EmptyState } from "../../components/ui/EmptyState";
import { getApiErrorMessage } from "../../lib/api-error";
import { useLanguage } from "../../lib/i18n/useLanguage";
import type { CategoryFormData } from "./category-schemas";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "./categories-service";
import { CategoryCard } from "./components/CategoryCard";
import { CategoryForm } from "./components/CategoryForm";
import type { Category } from "./types";

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsFormOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCategory(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  function handleCreate(data: CategoryFormData) {
    createMutation.mutate(data);
  }

  function handleUpdate(data: CategoryFormData) {
    if (!editingCategory) {
      return;
    }

    updateMutation.mutate({
      id: editingCategory.id,
      data,
    });
  }

  function handleDelete(category: Category) {
    const confirmed = window.confirm(t.categories.confirmDelete(category.name));

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(category.id);
  }

  const categories = categoriesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            {t.categories.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t.categories.description}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingCategory(null);
            setIsFormOpen((current) => !current);
          }}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          {t.categories.newCategory}
        </button>
      </div>

      {isFormOpen && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-950">
            {t.categories.createCategory}
          </h2>

          {createMutation.isError && (
            <div className="mb-4">
              <Alert variant="error">
                {getApiErrorMessage(
                  createMutation.error,
                  t.categories.createError
                )}
              </Alert>
            </div>
          )}

          <CategoryForm
            submitLabel={t.categories.createCategory}
            isSubmitting={createMutation.isPending}
            onSubmit={handleCreate}
          />
        </section>
      )}

      {editingCategory && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-950">
            {t.categories.editCategory}
          </h2>

          {updateMutation.isError && (
            <div className="mb-4">
              <Alert variant="error">
                {getApiErrorMessage(
                  updateMutation.error,
                  t.categories.updateError
                )}
              </Alert>
            </div>
          )}

          <CategoryForm
            defaultValues={{
              name: editingCategory.name,
              type: editingCategory.type,
            }}
            submitLabel={t.common.saveChanges}
            isSubmitting={updateMutation.isPending}
            onSubmit={handleUpdate}
          />
        </section>
      )}

      {categoriesQuery.isLoading && (
        <p className="text-sm text-slate-500">{t.categories.loading}</p>
      )}

      {categoriesQuery.isError && (
        <Alert variant="error">
          {getApiErrorMessage(
            categoriesQuery.error,
            t.categories.loadError
          )}
        </Alert>
      )}

      {!categoriesQuery.isLoading &&
        !categoriesQuery.isError &&
        categories.length === 0 && (
          <EmptyState
            title={t.categories.emptyTitle}
            description={t.categories.emptyDescription}
          />
        )}

      {categories.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={(selectedCategory) => {
                setIsFormOpen(false);
                setEditingCategory(selectedCategory);
              }}
              onDelete={handleDelete}
            />
          ))}
        </section>
      )}
    </div>
  );
}
