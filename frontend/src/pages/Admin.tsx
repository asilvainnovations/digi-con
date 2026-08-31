import { useQuery } from "@tanstack/react-query";
import { AdminBlogCms, AdminUsersTable } from "@/components/admin/AdminPanels";
import { ErrorState, LoadingState, MetricCard, SectionHeading } from "@/components/kit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiGet } from "@/lib/api";
import type { AdminStats } from "@/types";

export default function Admin() {
  const stats = useQuery({ queryKey: ["admin-stats"], queryFn: () => apiGet<AdminStats>("/admin/stats") });

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
          <MetricCard
            label="Articles"
            value={stats.data.posts}
            hint={`${stats.data.published_posts} published`}
            tone="gold"
            testId="admin-metric-posts"
          />
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
          <AdminUsersTable />
        </TabsContent>
        <TabsContent value="cms" className="pt-4">
          <AdminBlogCms />
        </TabsContent>
      </Tabs>
    </div>
  );
}
