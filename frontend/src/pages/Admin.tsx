import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ErrorState, LoadingState, MetricCard, SectionHeading } from "@/components/kit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import type { AdminStats, AdminUserRow, BlogPost, BlogPostInput } from "@/types";

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

export default function Admin() {
  const qc = useQueryClient();
  const [post, setPost] = useState<BlogPostInput>(EMPTY_POST);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tagsText, setTagsText] = useState("");

  const stats = useQuery({ queryKey: ["admin-stats"], queryFn: () => apiGet<AdminStats>("/admin/stats") });
  const users = useQuery({ queryKey: ["admin-users"], queryFn: () => apiGet<AdminUserRow[]>("/admin/users") });
  const posts = useQuery({ queryKey: ["admin-posts"], queryFn: () => apiGet<BlogPost[]>("/admin/posts") });

  const changePlan = useMutation({
    mutationFn: ({ id, plan }: { id: string; plan: string }) => apiPatch<AdminUserRow>(`/admin/users/${id}/plan`, { plan }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Plan updated");
    },
    onError: () => toast.error("Couldn't change that plan."),
  });

  const payload = () => ({ ...post, tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean) });

  const savePost = useMutation({
    mutationFn: () =>
      editingId ? apiPut<BlogPost>(`/admin/posts/${editingId}`, payload()) : apiPost<BlogPost>("/admin/posts", payload()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      qc.invalidateQueries({ queryKey: ["posts"] });
      toast.success(editingId ? "Article updated" : "Article created");
      setPost(EMPTY_POST);
      setTagsText("");
      setEditingId(null);
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
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      qc.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Publication state updated");
    },
  });

  const removePost = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/posts/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      qc.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Article deleted");
    },
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
    <div className="mx-auto max-w-6xl space-y-5">
      <SectionHeading eyebrow="Super admin" title="Platform administration" testId="admin-heading" />

      {stats.isLoading && <LoadingState testId="admin-stats-loading" />}
      {stats.isError && <ErrorState testId="admin-stats-error" />}
      {stats.data && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="Users" value={stats.data.users} hint={`${stats.data.paid_users} on Pro`} testId="admin-metric-users" />
          <MetricCard label="Cards" value={stats.data.cards} tone="cyan" testId="admin-metric-cards" />
          <MetricCard label="Relationships" value={stats.data.relationships} tone="cyan" testId="admin-metric-relationships" />
          <MetricCard label="Articles" value={stats.data.posts} hint={`${stats.data.published_posts} published`} tone="gold" testId="admin-metric-posts" />
        </div>
      )}

      <Tabs defaultValue="users">
        <TabsList variant="line">
          <TabsTrigger value="users" data-testid="admin-tab-users">
            Users & plans
          </TabsTrigger>
          <TabsTrigger value="cms" data-testid="admin-tab-cms">
            Blog CMS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="pt-4">
          <section className="glass rounded-xl p-5">
            {users.isLoading && <LoadingState testId="admin-users-loading" />}
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
        </TabsContent>

        <TabsContent value="cms" className="space-y-4 pt-4">
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
              <div className="space-y-1.5">
                <Label htmlFor="bp-tags">Tags (comma separated)</Label>
                <Input id="bp-tags" value={tagsText} onChange={(e) => setTagsText(e.target.value)} data-testid="admin-post-tags" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bp-cover">Featured image URL</Label>
                <Input id="bp-cover" value={post.cover_url} onChange={(e) => setPost({ ...post, cover_url: e.target.value })} data-testid="admin-post-cover" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bp-seo-title">SEO title</Label>
                <Input id="bp-seo-title" value={post.seo_title} onChange={(e) => setPost({ ...post, seo_title: e.target.value })} data-testid="admin-post-seo-title" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bp-seo-desc">SEO description</Label>
                <Input id="bp-seo-desc" value={post.seo_description} onChange={(e) => setPost({ ...post, seo_description: e.target.value })} data-testid="admin-post-seo-description" />
              </div>
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
              <Button
                onClick={() => savePost.mutate()}
                disabled={post.title.trim().length < 3 || savePost.isPending}
                data-testid="admin-post-save"
              >
                {editingId ? <Save className="mr-2 h-4 w-4" aria-hidden /> : <Plus className="mr-2 h-4 w-4" aria-hidden />}
                {editingId ? "Save article" : "Create article"}
              </Button>
              {editingId && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null);
                    setPost(EMPTY_POST);
                    setTagsText("");
                  }}
                  data-testid="admin-post-cancel"
                >
                  Cancel
                </Button>
              )}
            </div>
          </section>

          <section className="glass rounded-xl p-5">
            <SectionHeading eyebrow="Library" title="All articles" />
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
