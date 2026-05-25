import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCurrentLang } from "@/i18n";
import { usePageMeta } from "@/lib/usePageMeta";


const privacyText = {
  en: {
    intro: "My Music Notes Desktop respects your privacy and is designed to keep your data under your control.",
    dataCollectionTitle: "Data Collection",
    dataCollection: "We use Google Analytics (GA4) to collect basic, anonymous usage statistics, such as the number of visitors, pages viewed, and button interactions (for example, Download or Demo clicks). This information is used solely to understand how the app is used and to improve functionality and user experience.",
    dataStorageTitle: "Data Storage",
    dataStorage: "All songs, notes, and content created in My Music Notes Desktop are stored locally on your device. We do not upload, store, or access your song content on any external server.",
    audioRecordingsTitle: "Audio Recordings",
    audioRecordings: [
      "My Music Notes may allow you to record short audio notes. Audio recordings are stored locally on your device. We do not upload, store, or access your audio recordings on any external server.",
      "If you clear your browser/app cache, site data, or local storage, your recordings may be deleted. You are responsible for exporting JSON backups or downloading audio files if you want to keep a copy of your recordings.",
      "Exported JSON files may include your note content and audio recording data, depending on the export option used.",
    ],
    cookiesTitle: "Cookies and Analytics",
    cookies: "Google Analytics may use cookies or similar technologies to measure website usage. We do not use analytics data for advertising or marketing purposes.",
    thirdPartyTitle: "Third-Party Services",
    thirdParty: "Usage data collected through analytics is processed by Google Analytics in accordance with Google's privacy policies.",
    controlTitle: "Your Control",
    control: "You remain in full control of your data. You may clear your browser data at any time. If you do not agree with this policy, you may choose not to use the application.",
    contactTitle: "Contact",
    contact: "For privacy questions or data-related requests, please contact:",
  },
  th: {
    intro: "My Music Notes Desktop เคารพความเป็นส่วนตัวของคุณและออกแบบมาเพื่อให้ข้อมูลอยู่ภายใต้การควบคุมของคุณ",
    dataCollectionTitle: "การเก็บข้อมูล",
    dataCollection: "เราใช้ Google Analytics (GA4) เพื่อเก็บสถิติการใช้งานพื้นฐานแบบไม่ระบุตัวตน เช่น จำนวนผู้เข้าชม หน้าที่ดู และการโต้ตอบกับปุ่ม (เช่น ปุ่มดาวน์โหลดหรือเดโม) ข้อมูลนี้ใช้เพื่อทำความเข้าใจการใช้งานแอพและปรับปรุงฟังก์ชันกับประสบการณ์ผู้ใช้เท่านั้น",
    dataStorageTitle: "การจัดเก็บข้อมูล",
    dataStorage: "เพลง โน้ต และเนื้อหาทั้งหมดที่สร้างใน My Music Notes Desktop จะถูกเก็บไว้ในเครื่องของคุณ เราไม่อัปโหลด จัดเก็บ หรือเข้าถึงเนื้อหาเพลงของคุณบนเซิร์ฟเวอร์ภายนอก",
    audioRecordingsTitle: "การบันทึกเสียง",
    audioRecordings: [
      "My Music Notes อาจให้คุณบันทึกเสียงสั้น ๆ ภายในโน้ตได้ เสียงที่บันทึกจะถูกเก็บไว้ในเครื่องของคุณ เราไม่อัปโหลด ไม่จัดเก็บ และไม่เข้าถึงไฟล์เสียงของคุณบนเซิร์ฟเวอร์ภายนอก",
      "หากคุณล้างแคชของเบราว์เซอร์/แอพ ข้อมูลเว็บไซต์ หรือพื้นที่จัดเก็บในเครื่อง เสียงที่บันทึกไว้อาจถูกลบได้ คุณเป็นผู้รับผิดชอบในการส่งออกไฟล์ JSON สำรอง หรือดาวน์โหลดไฟล์เสียง หากต้องการเก็บสำเนาเสียงของคุณไว้",
      "ไฟล์ JSON ที่ส่งออกอาจรวมเนื้อหาโน้ตและข้อมูลเสียงที่บันทึกไว้ ขึ้นอยู่กับตัวเลือกการส่งออกที่ใช้",
    ],
    cookiesTitle: "คุกกี้และการวิเคราะห์",
    cookies: "Google Analytics อาจใช้คุกกี้หรือเทคโนโลยีที่คล้ายกันเพื่อวัดการใช้งานเว็บไซต์ เราไม่ใช้ข้อมูลการวิเคราะห์เพื่อการโฆษณาหรือการตลาด",
    thirdPartyTitle: "บริการของบุคคลที่สาม",
    thirdParty: "ข้อมูลการใช้งานที่เก็บผ่านการวิเคราะห์จะถูกประมวลผลโดย Google Analytics ตามนโยบายความเป็นส่วนตัวของ Google",
    controlTitle: "การควบคุมของคุณ",
    control: "คุณยังคงควบคุมข้อมูลของคุณได้อย่างเต็มที่ คุณสามารถล้างข้อมูลเบราว์เซอร์ได้ทุกเมื่อ หากคุณไม่เห็นด้วยกับนโยบายนี้ คุณอาจเลือกไม่ใช้แอปพลิเคชันนี้",
    contactTitle: "ติดต่อ",
    contact: "หากมีคำถามเกี่ยวกับความเป็นส่วนตัวหรือข้อมูลของคุณ กรุณาติดต่อ:",
  },
  sv: {
    intro: "My Music Notes Desktop respekterar din integritet och är utformad för att hålla dina data under din kontroll.",
    dataCollectionTitle: "Datainsamling",
    dataCollection: "Vi använder Google Analytics (GA4) för att samla in grundläggande, anonym användningsstatistik, till exempel antal besökare, visade sidor och knappinteraktioner (till exempel nedladdnings- eller demoklick). Informationen används enbart för att förstå hur appen används och för att förbättra funktionalitet och användarupplevelse.",
    dataStorageTitle: "Datalagring",
    dataStorage: "Alla låtar, anteckningar och allt innehåll som skapas i My Music Notes Desktop sparas lokalt på din enhet. Vi laddar inte upp, lagrar inte och har inte åtkomst till ditt låtinnehåll på någon extern server.",
    audioRecordingsTitle: "Ljudinspelningar",
    audioRecordings: [
      "My Music Notes kan låta dig spela in korta ljudanteckningar. Ljudinspelningar sparas lokalt på din enhet. Vi laddar inte upp, lagrar inte och har inte åtkomst till dina ljudinspelningar på någon extern server.",
      "Om du rensar webbläsarens/appens cache, webbplatsdata eller lokal lagring kan dina inspelningar raderas. Du ansvarar själv för att exportera JSON-säkerhetskopior eller ladda ner ljudfiler om du vill behålla en kopia av dina inspelningar.",
      "Exporterade JSON-filer kan innehålla ditt anteckningsinnehåll och ljudinspelningsdata, beroende på vilket exportalternativ som används.",
    ],
    cookiesTitle: "Cookies och analys",
    cookies: "Google Analytics kan använda cookies eller liknande tekniker för att mäta webbplatsanvändning. Vi använder inte analysdata för annonsering eller marknadsföring.",
    thirdPartyTitle: "Tredjepartstjänster",
    thirdParty: "Användningsdata som samlas in via analys behandlas av Google Analytics i enlighet med Googles integritetspolicyer.",
    controlTitle: "Din kontroll",
    control: "Du har fortsatt full kontroll över dina data. Du kan rensa dina webbläsardata när som helst. Om du inte godkänner denna policy kan du välja att inte använda applikationen.",
    contactTitle: "Kontakt",
    contact: "För frågor om integritet eller datarelaterade ärenden, kontakta:",
  },
};

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const lang = getCurrentLang();
  const copy = lang === "th" ? privacyText.th : lang === "sv" ? privacyText.sv : privacyText.en;
  usePageMeta(
    "Privacy Policy — My Music Notes",
    "How My Music Notes handles your data: local-first storage, audio recording behavior, and contact information."
  );


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="container max-w-xl mx-auto px-4 h-14 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Privacy Policy</h1>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-xl mx-auto px-4 py-6">
        <div className="prose prose-sm max-w-none text-foreground">
          <p className="text-base mb-6">
            {copy.intro}
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-3">{copy.dataCollectionTitle}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {copy.dataCollection}
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-3">{copy.dataStorageTitle}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {copy.dataStorage}
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-3">{copy.audioRecordingsTitle}</h2>
          {copy.audioRecordings.map((paragraph) => (
            <p key={paragraph} className="text-sm text-muted-foreground mb-4">
              {paragraph}
            </p>
          ))}

          <h2 className="text-lg font-semibold mt-6 mb-3">{copy.cookiesTitle}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {copy.cookies}
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-3">{copy.thirdPartyTitle}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {copy.thirdParty}
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-3">{copy.controlTitle}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {copy.control}
          </p>

          <h2 className="text-lg font-semibold mt-6 mb-3">{copy.contactTitle}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {copy.contact}<br />
            mmnotesapp@gmail.com
          </p>
        </div>
      </main>
    </div>
  );
}
