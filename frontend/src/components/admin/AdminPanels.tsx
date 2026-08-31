import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ErrorState, LoadingState, SectionHeading } from "@/components/kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import type { AdminUserRow, BlogPost, BlogPostInput } from "@/types";

const EMPTY_POST: BlogPostInput = {
  title: "",
  excerpt: "",
  body: "",
  category: "Networking",
  tags: [],
  cover_url: "",
  seo_title: "",
  seo_description: "",
  published: false,
};

export function AdminUsersTable() {
  const qc = useQueryClient();
  const users = useQuery({ queryKey: ["admin-users"], queryFn: () => apiGet<AdminUserRow[]>("/admin/users") });

  const changePlan = useMutation({
    mutationFn: ({ id, plan }: { id: string; plan: string }) =>
      apiPatch<AdminUserRow>(`/admin/users/${id}/plan`, { plan }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Plan updated");
    },
    onError: () => toast.error("Couldn't change that plan."),
  });

  return (
    <section className="glass rounded-xl p-5">
      {users.isLoading && <LoadingState testId="admin-users-loading" />}
      {users.isError && <ErrorState testId="admin-users-error" />}
      {users.data && (
        <Table data-testid="admin-users-table">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Connections</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.data.map((u) => (
              <TableRow key={u.id} data-testid={`admin-user-${u.id}`}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="dense">{u.email}</TableCell>
                <TableCell className="dense">{u.role}</TableCell>
                <TableCell>
                  <Badge variant={u.plan === "free" ? "secondary" : "outline"} className="dense">
                    {u.plan}
                  </Badge>
                </TableCell>
                <TableCell className="dense">{u.connections}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => changePlan.mutate({ id: u.id, plan: u.plan === "free" ? "pro" : "free" })}
                    data-testid={`admin-toggle-plan-${u.id}`}
                  >
                    {u.plan === "free" ? "Grant Pro" : "Revoke Pro"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}

function PostForm({
  post,
  setPost,
  tagsText,
  setTagsText,
  editingId,
  onSave,
  onCancel,
  isSaving,
}: {
  post: BlogPostInput;
  setPost: (post: BlogPostInput) => void;
  tagsText: string;
  setTagsText: (value: string) => void;
  editingId: string | null;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const textFields = [
    { id: "bp-tags", label: "Tags (comma separated)", value: tagsText, onChange: setTagsText, testId: "admin-post-tags" },
    { id: "bp-cover", label: "Featured image URL", value: post.cover_url, onChange: (v: string) => setPost({ ...post, cover_url: v }), testId: "admin-post-cover" },
    { id: "bp-seo-title", label: "SEO title", value: post.seo_title, onChange: (v: string) => setPost({ ...post, seo_title: v }), testId: "admin-post-seo-title" },
    { id: "bp-seo-desc", label: "SEO description", value: post.seo_description, onChange: (v: string) => setPost({ ...post, seo_description: v }), testId: "admin-post-seo-description" },
  ];

  return (
    <section className="glass space-y-3 rounded-xl p-5">
      <SectionHeading eyebrow={editingId ? "Editing" : "New article"} title="Blog CMS" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="bp-title">Title</Label>
          <Input id="bp-title" value={post.title} onChange={(e) => setPost({ ...post, title: e.target.value })} data-testid="admin-post-title" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bp-category">Category</Label>
          <Input id="bp-category" value={post.category} onChange={(e) => setPost({ ...post, category: e.target.value })} data-testid="admin-post-category" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bp-excerpt">Excerpt</Label>
        <Input id="bp-excerpt" value={post.excerpt} onChange={(e) => setPost({ ...post, excerpt: e.target.value })} data-testid="admin-post-excerpt" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bp-body">Body</Label>
        <Textarea id="bp-body" rows={6} value={post.body} onChange={(e) => setPost({ ...post, body: e.target.value })} data-testid="admin-post-body" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {textFields.map((field) => (
          <div key={field.id} className="space-y-1.5">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              data-testid={field.testId}
            />
          </div>
        ))}
      </div>
      <label className="flex items-center gap-2.5 text-sm" htmlFor="bp-published">
        <Checkbox
          id="bp-published"
          checked={post.published}
          onCheckedChange={(v) => setPost({ ...post, published: v === true })}
          data-testid="admin-post-published"
        />
        Publish immediately
      </label>
      <div className="flex gap-2">
        <Button onClick={onSave} disabled={post.title.trim().length < 3 || isSaving} data-testid="admin-post-save">
          {editingId ? <Save className="mr-2 h-4 w-4" aria-hidden /> : <Plus className="mr-2 h-4 w-4" aria-hidden />}
          {editingId ? "Save article" : "Create article"}
        </Button>
        {editingId && (
          <Button variant="ghost" onClick={onCancel} data-testid="admin-post-cancel">
            Cancel
          </Button>
        )}
      </div>
    </section>
  );
}

export function AdminBlogCms() {
  const qc = useQueryClient();
  const [post, setPost] = useState<BlogPostInput>(EMPTY_POST);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tagsText, setTagsText] = useState("");

  const posts = useQuery({ queryKey: ["admin-posts"], queryFn: () => apiGet<BlogPost[]>("/admin/posts") });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
    qc.invalidateQueries({ queryKey: ["posts"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const payload = (): BlogPostInput => ({
    ...post,
    tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
  });

  const reset = () => {
    setEditingId(null);
    setPost(EMPTY_POST);
    setTagsText("");
  };

  const savePost = useMutation({
    mutationFn: () =>
      editingId
        ? apiPut<BlogPost>(`/admin/posts/${editingId}`, payload())
        : apiPost<BlogPost>("/admin/posts", payload()),
    onSuccess: () => {
      refresh();
      toast.success(editingId ? "Article updated" : "Article created");
      reset();
    },
    onError: () => toast.error("Couldn't save that article."),
  });

  const togglePublish = useMutation({
    mutationFn: (p: BlogPost) =>
      apiPut<BlogPost>(`/admin/posts/${p.id}`, {
        title: p.title,
        excerpt: p.excerpt,
        body: p.body,
        category: p.category,
        tags: p.tags,
        cover_url: p.cover_url,
        seo_title: p.seo_title,
        seo_description: p.seo_description,
        published: !p.published,
      }),
    onSuccess: () => {
      refresh();
      toast.success("Publication state updated");
    },
    onError: () => toast.error("Couldn't change publication state."),
  });

  const removePost = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/posts/${id}`),
    onSuccess: () => {
      refresh();
      toast.success("Article deleted");
    },
    onError: () => toast.error("Couldn't delete that article."),
  });

  const edit = (p: BlogPost) => {
    setEditingId(p.id);
    setTagsText(p.tags.join(", "));
    setPost({
      title: p.title,
      excerpt: p.excerpt,
      body: p.body,
      category: p.category,
      tags: p.tags,
      cover_url: p.cover_url,
      seo_title: p.seo_title,
      seo_description: p.seo_description,
      published: p.published,
    });
  };

  return (
    <div className="space-y-4">
      <PostForm
        post={post}
        setPost={setPost}
        tagsText={tagsText}
        setTagsText={setTagsText}
        editingId={editingId}
        onSave={() => savePost.mutate()}
        onCancel={reset}
        isSaving={savePost.isPending}
      />

      <section className="glass rounded-xl p-5">
        <SectionHeading eyebrow="Library" title="All articles" />
        {posts.isLoading && <LoadingState testId="admin-posts-loading" />}
        <ul className="space-y-2.5" data-testid="admin-posts-list">
          {posts.data?.map((p) => (
            <li key={p.id} className="glass-soft flex flex-wrap items-center gap-3 rounded-lg p-3" data-testid={`admin-post-${p.id}`}>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.title}</p>
                <p className="dense truncate text-xs text-muted-foreground">
                  {p.category} · /blog/{p.slug}
                </p>
              </div>
              <Badge variant={p.published ? "outline" : "secondary"} className="dense">
                {p.published ? "Published" : "Draft"}
              </Badge>
              <Button size="sm" variant="outline" onClick={() => edit(p)} data-testid={`admin-post-edit-${p.id}`}>
                Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => togglePublish.mutate(p)} data-testid={`admin-post-toggle-${p.id}`}>
                {p.published ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={`Delete ${p.title}`}
                onClick={() => removePost.mutate(p.id)}
                data-testid={`admin-post-delete-${p.id}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
