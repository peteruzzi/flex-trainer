import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">📧</div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            A sign in link has been sent to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>Click the link in your email to complete sign in.</p>
          <p className="mt-4">
            <Link href="/login" className="text-primary underline">
              Back to login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
