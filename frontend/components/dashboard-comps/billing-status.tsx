import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const BillingStatus = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing Status</CardTitle>
        <CardDescription>Current plan and usage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Business Plan</p>
            <p className="text-xs text-muted-foreground">$99/month</p>
          </div>
          <Badge
            variant="outline"
            className="bg-accent/10 border-accent/20"
          >
            Active
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Queries this month
            </span>
            <span className="font-medium">28.4M / 50M</span>
          </div>
          <div className="h-2 rounded-full bg-secondary">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: "56.8%" }}
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Zones</span>
            <span className="font-medium">24 / 100</span>
          </div>
          <div className="h-2 rounded-full bg-secondary">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: "24%" }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};