import { useState } from "react";
import { Check, ChevronDown, Download } from "lucide-react";

export default function InquiryForm({ zh, initialType = "3D & Game Art" }: { zh: boolean; initialType?: string }) {
  const t = (en: string, cn: string) => zh ? cn : en;
  const [downloaded, setDownloaded] = useState(false);
  function downloadInquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = `SKYRAY — Project inquiry\n\nContact: ${data.get("name")}\nEmail: ${data.get("email")}\nMobile: ${data.get("phone") || "—"}\nCompany: ${data.get("company") || "—"}\nInterest: ${data.get("type")}\n\n${data.get("message")}\n\nThis document was downloaded locally. It has not been sent to Skyray.\n`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = "skyray-project-inquiry.txt"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloaded(true);
  }
  return <form className="inquiry-form" onSubmit={downloadInquiry} onChange={() => setDownloaded(false)}>
    <div className="form-row">
      <label>{t("Contact name", "聯絡人")}<input name="name" autoComplete="name" required maxLength={100} placeholder={t("Your name", "怎麼稱呼你？")}/></label>
      <label>{t("Email", "電郵")}<input name="email" type="email" autoComplete="email" required maxLength={200} placeholder="you@company.com"/></label>
    </div>
    <div className="form-row">
      <label>{t("Mobile · optional", "手機・選填")}<input name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder={t("Your contact number", "方便聯絡的電話")}/></label>
      <label>{t("Company · optional", "公司名稱・選填")}<input name="company" autoComplete="organization" maxLength={150} placeholder={t("Company or brand", "公司或品牌名稱")}/></label>
    </div>
    <label>{t("Project type", "合作方向")}<span className="select-field"><select name="type" defaultValue={initialType}>
      <option value="Game Production">{t("Game production", "遊戲製作")}</option>
      <option value="System Development">{t("System development", "系統開發")}</option>
      <option value="3D & Game Art">3D &amp; Game Art</option><option value="Web & Digital">Web &amp; Digital</option>
      <option value="Brand & Packaging">Brand &amp; Packaging</option><option value="Illustration & Visual">Illustration &amp; Visual</option>
      <option value="Multidisciplinary">{t("A little of everything", "跨領域合作")}</option>
    </select><ChevronDown size={20} aria-hidden="true"/></span></label>
    <label>{t("Tell us about your project", "簡單說說你的需求")}<textarea name="message" rows={4} required maxLength={5000} placeholder={t("What would you like to create? Share your goals, timeline or ideas.", "想製作什麼？可以先說明目標、預計時程或目前的想法。")}/></label>
    <button className="solid-button" type="submit">{downloaded ? <Check size={18}/> : <Download size={18}/>} {t("Download inquiry", "下載詢問內容")}</button>
    {downloaded && <p className="form-status" role="status">{t("Your inquiry has been downloaded.", "詢問內容已下載。")}</p>}
  </form>;
}
