import type { ComponentType } from "react";
import type { MDXComponents } from "mdx/types";
import sources from "virtual:lesson-sources";

export interface LessonMeta {
  slug: string;
  title: string;
  week: number;
  summary: string;
}

export interface Lesson extends LessonMeta {
  order: number;
  Component: ComponentType<{ components?: MDXComponents }>;
  /** Raw MDX source, used by global search. */
  source: string;
}

type LessonModule = { default: Lesson["Component"]; meta: LessonMeta };

const modules = import.meta.glob<LessonModule>("./*.mdx", { eager: true });

export const lessons: Lesson[] = Object.entries(modules)
  .map(([path, mod]) => ({
    ...mod.meta,
    order: Number(path.match(/\.\/(\d+)-/)?.[1] ?? 99),
    Component: mod.default,
    source: sources[path] ?? "",
  }))
  .sort((a, b) => a.order - b.order);

export const lessonBySlug = (slug: string) => lessons.find((lesson) => lesson.slug === slug);
