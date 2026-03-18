import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Users, MessageSquare, BarChart3, Activity, Ban, Trash2, ShieldOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useIsAdmin, useAdminStats, useAdminProfiles, useAdminFeedback, useAdminActivity, useAdminUserActions } from "@/hooks/useAdminData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  new: "bg-accent text-accent-foreground",
  reviewed: "bg-secondary text-secondary-foreground",
  resolved: "bg-primary/20 text-primary",
};

const AdminPage = () => {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: profiles, isLoading: profilesLoading } = useAdminProfiles();
  const { data: feedback, isLoading: feedbackLoading, updateStatus } = useAdminFeedback();
  const { data: activeUsers, isLoading: activityLoading } = useAdminActivity();

  useEffect(() => {
    if (!adminLoading && !isAdmin) navigate("/ideas", { replace: true });
  }, [adminLoading, isAdmin, navigate]);

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const signupsThisWeek = profiles?.filter(
    (p) => new Date(p.created_at) > new Date(Date.now() - 7 * 86400000)
  ).length ?? 0;

  const cycleStatus = (current: string) => {
    const order = ["new", "reviewed", "resolved"];
    const next = order[(order.indexOf(current) + 1) % order.length];
    return next;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Shield size={24} className="text-primary" />
        <h1 className="text-2xl font-heading font-bold">Admin Dashboard</h1>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-10 w-full" /></CardContent></Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-4 flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Users</span>
                <span className="text-3xl font-bold">{stats?.totalUsers}</span>
                <span className="text-xs text-muted-foreground mt-1">+{signupsThisWeek} this week</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Content</span>
                <span className="text-3xl font-bold">
                  {(stats?.totalPrompts ?? 0) + (stats?.totalResources ?? 0) + (stats?.totalIdeas ?? 0) + (stats?.totalBuilds ?? 0)}
                </span>
                <span className="text-xs text-muted-foreground mt-1">across all types</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Pending Feedback</span>
                <span className="text-3xl font-bold">{stats?.pendingFeedback}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Public Artifacts</span>
                <span className="text-3xl font-bold">{stats?.totalArtifacts}</span>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="feedback" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="feedback" className="gap-1.5"><MessageSquare size={14} />Feedback</TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5"><Users size={14} />Users</TabsTrigger>
          <TabsTrigger value="content" className="gap-1.5"><BarChart3 size={14} />Content</TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5"><Activity size={14} />Activity</TabsTrigger>
        </TabsList>

        {/* Feedback Tab */}
        <TabsContent value="feedback">
          <Card>
            <CardHeader><CardTitle className="text-lg">All Feedback</CardTitle></CardHeader>
            <CardContent>
              {feedbackLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : !feedback?.length ? (
                <p className="text-muted-foreground text-sm">No feedback yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedback.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="text-xs whitespace-nowrap">{format(new Date(f.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-xs">{f.email}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{f.type}</Badge></TableCell>
                        <TableCell className="max-w-xs truncate text-sm">{f.message}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{f.page_url}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2"
                            onClick={() => updateStatus.mutate({ id: f.id, status: cycleStatus(f.status) })}
                          >
                            <Badge className={`${statusColors[f.status] ?? ""} text-xs cursor-pointer`}>
                              {f.status}
                            </Badge>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle className="text-lg">All Users ({profiles?.length ?? 0})</CardTitle></CardHeader>
            <CardContent>
              {profilesLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Signed Up</TableHead>
                      <TableHead>Public</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles?.map((p) => (
                      <TableRow key={p.user_id}>
                        <TableCell className="text-sm font-medium">{p.display_name || "—"}</TableCell>
                        <TableCell className="text-sm">{p.email || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{format(new Date(p.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell>{p.is_public ? <Badge variant="outline" className="text-xs">Public</Badge> : null}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Prompts", value: stats?.totalPrompts },
              { label: "Resources", value: stats?.totalResources },
              { label: "Ideas", value: stats?.totalIdeas },
              { label: "Builds", value: stats?.totalBuilds },
              { label: "Public Artifacts", value: stats?.totalArtifacts },
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="p-4 text-center">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</span>
                  <p className="text-3xl font-bold mt-1">{statsLoading ? "—" : item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader><CardTitle className="text-lg">Most Active Users</CardTitle></CardHeader>
            <CardContent>
              {activityLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Content Items</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeUsers?.map((u, i) => (
                      <TableRow key={u.user_id}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-medium">{u.display_name || "—"}</TableCell>
                        <TableCell className="text-sm">{u.email || "—"}</TableCell>
                        <TableCell><Badge variant="secondary">{u.contentCount}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
