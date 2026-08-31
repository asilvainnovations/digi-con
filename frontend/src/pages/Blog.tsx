import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { PublicLayout } from "@/components/layout/Layouts";
import { EmptyState, ErrorState, LoadingState, SectionHeading } from "@/components/kit";
import { Badge } from "@/components/ui/badge";
import { apiGet } from "@/lib/api";
import type { BlogPost } from "@/types";

export function Blog() {
  const posts = useQuery({ queryKey: ["posts"], queryFn: () => apiGet<BlogPost[]>("/posts"), retry: false });
  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <SectionHeading eyebrow="Resources" title="The DigiCon blog" testId="blog-heading" />
        {posts.isLoading && <LoadingState testId="blog-loading" />}
        {posts.isError && <ErrorState label="Articles aren't available right now." testId="blog-error" />}
        {posts.data?.length === 0 && (
          <EmptyState title="No articles yet" body="New writing on networking and relationship building is on the way." testId="blog-empty" />
        )}
        <ul className="space-y-4">
          {posts.data?.map((p) => (
            <li key={p.id}>
              <Link
                to={`/blog/${p.slug}`}
                className="glass block rounded-xl p-5 transition-transform duration-200 hover:-translate-y-0.5"
                data-testid={`blog-post-${p.slug}`}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="dense">
                    {p.category}
                  </Badge>
                  <span className="dense flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3" aria-hidden />
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="font-heading mt-2 text-lg font-bold">{p.title}</h2>
                <p className="dense mt-1.5 text-sm text-muted-foreground">{p.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </PublicLayout>
  );
}

export function BlogArticle() {
  const { slug = "" } = useParams<{ slug: string }>();
  const post = useQuery({
    queryKey: ["post", slug],
    queryFn: () => apiGet<BlogPost>(`/posts/${slug}`),
    retry: false,
  });

  return (
    <PublicLayout>
      <article className="mx-auto max-w-2xl px-4 py-12">
        <Link to="/blog" className="dense inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground" data-testid="article-back">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All articles
        </Link>
        {post.isLoading && <LoadingState testId="article-loading" />}
        {post.isError && <ErrorState label="That article isn't published." testId="article-error" />}
        {post.data && (
          <div className="mt-5">
            <Badge variant="secondary" className="dense">
              {post.data.category}
            </Badge>
            <h1 className="font-heading mt-3 text-3xl font-extrabold" data-testid="article-title">
              {post.data.title}
            </h1>
            <p className="dense mt-2 text-sm text-muted-foreground">
              {new Date(post.data.created_at).toLocaleDateString()}
            </p>
            <div className="dense mt-6 space-y-4 text-base leading-relaxed" data-testid="article-body">
              {post.data.body.split("\n\n").map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>
            {post.data.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {post.data.tags.map((t) => (
                  <Badge key={t} variant="outline" className="dense">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </article>
    </PublicLayout>
  );
}
