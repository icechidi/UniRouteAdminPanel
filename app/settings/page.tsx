
import SettingsForm from "@/components/settings-form"
import { isDatabaseConfigured, getSql } from "@/lib/db"
import DashboardLayout from "../dashboard-layout"

export default async function SettingsPage() {
  const dbConfigured = isDatabaseConfigured()
  let settingsMap: Record<string, string> = {}
  if (dbConfigured) {
    const sql = getSql()
    const result = await sql.query("SELECT * FROM settings ORDER BY key")
    settingsMap = result.rows.reduce((acc: Record<string, string>, setting: any) => {
      acc[setting.key] = setting.value
      return acc
    }, {})
  }

  // Scroll helpers (client-safe, but in server component, so use inline script)
  return (
    <DashboardLayout>
      <div className="relative h-[90vh] p-6">
        {/* Scrollable content */}
        <div id="settings-scrollable" className="overflow-y-auto h-full space-y-6 pr-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
              <p className="text-muted-foreground">Configure system settings</p>
            </div>
          </div>
          <SettingsForm initialSettings={settingsMap} dbConfigured={dbConfigured} />
        </div>
        {/* Scroll buttons (client-side) */}
        <script dangerouslySetInnerHTML={{__html:`
          window.addEventListener('DOMContentLoaded', function() {
            var scrollable = document.getElementById('settings-scrollable');
            var topBtn = document.getElementById('settings-scroll-top');
            var bottomBtn = document.getElementById('settings-scroll-bottom');
            if (topBtn && scrollable) topBtn.onclick = function() { scrollable.scrollTo({ top: 0, behavior: 'smooth' }); };
            if (bottomBtn && scrollable) bottomBtn.onclick = function() { scrollable.scrollTo({ top: scrollable.scrollHeight, behavior: 'smooth' }); };
          });
        `}} />
        <div className="fixed bottom-8 right-8 flex flex-col gap-2 z-50">
          <button id="settings-scroll-top" className="bg-secondary rounded-full p-2 shadow hover:bg-secondary/80" aria-label="Scroll to top">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg>
          </button>
          <button id="settings-scroll-bottom" className="bg-secondary rounded-full p-2 shadow hover:bg-secondary/80" aria-label="Scroll to bottom">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
          </button>
        </div>
      </div>
    </DashboardLayout>  
  )
}
