import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="container max-w-xl mx-auto px-4 h-14 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Privacy Policy</h1>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-xl mx-auto px-4 py-6">
        <div className="prose prose-sm max-w-none text-foreground">
          <p className="text-base mb-6">
            My Music Notes Desktop respects your privacy and is designed to keep your data under your control.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-3">Data Collection</h2>
          <p className="text-sm text-muted-foreground mb-4">
            We use Google Analytics (GA4) to collect basic, anonymous usage statistics, such as the number of visitors, pages viewed, and button interactions (for example, Download or Demo clicks). This information is used solely to understand how the app is used and to improve functionality and user experience.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-3">Data Storage</h2>
          <p className="text-sm text-muted-foreground mb-4">
            All songs, notes, and content created in My Music Notes Desktop are stored locally on your device. We do not upload, store, or access your song content on any external server.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-3">Cookies and Analytics</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Google Analytics may use cookies or similar technologies to measure website usage. We do not use analytics data for advertising or marketing purposes.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-3">Third-Party Services</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Usage data collected through analytics is processed by Google Analytics in accordance with Google's privacy policies.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-3">Your Control</h2>
          <p className="text-sm text-muted-foreground mb-4">
            You remain in full control of your data. You may clear your browser data at any time. If you do not agree with this policy, you may choose not to use the application.
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-3">Contact</h2>
          <p className="text-sm text-muted-foreground mb-4">
            For questions regarding privacy, please contact the project owner via GitHub.
          </p>
        </div>
      </main>
    </div>
  );
}
