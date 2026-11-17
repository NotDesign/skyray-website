import { ArrowUpRight } from "lucide-react";
import InquiryForm from "./inquiry-form";

const mapQuery = encodeURIComponent("桃園市桃園區同德六街89號");

export default function CompanyContact({ zh }: { zh: boolean }) {
  const t = (en: string, cn: string) => zh ? cn : en;
  return <div className="company-contact">
    <section className="company-profile" aria-labelledby="company-title" data-reveal>
      <span className="mono">ART &amp; TECHNOLOGY / TAIWAN</span>
      <h3 className="company-name" id="company-title" aria-label="Skyray Limited"><img src={`${import.meta.env.BASE_URL}images/skyray-logo.svg`} width="240" height="32" alt="SKYRAY"/></h3>
      <p className="company-legal">香港商天宏軟體製作有限公司台灣分公司</p>
      <p className="company-description">{t("We connect creative design with software development. From games and custom systems to characters, websites and brand visuals, we help ideas take shape across different media.", "我們串連創意設計與軟體開發，從遊戲製作、客製系統，到角色、網站與品牌視覺，讓不同領域的想法逐步成形。")}</p>
      <p className="company-description">{t("Our Taiwan branch was established in 2022. Art and technology work together here, with equal attention to how a project looks and how it works.", "台灣分公司於 2022 年設立。我們讓美術與技術一起思考，兼顧作品的視覺表現與實際使用體驗。")}</p>
      <dl className="company-facts"><div><dt>{t("Taiwan branch", "台灣據點")}</dt><dd>{t("Established in 2022", "2022 年設立")}</dd></div><div><dt>{t("Office", "公司地址")}</dt><dd><address>桃園區同德六街89號4樓之A</address></dd></div></dl>
      <div className="company-map">
        <iframe title={t("Skyray Taiwan office on Google Maps", "Skyray 台灣辦公室 Google 地圖")} src={`https://www.google.com/maps?q=${mapQuery}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/>
      </div>
      <a className="line-link company-careers" href="https://www.104.com.tw/company/1a2x6bmmas" target="_blank" rel="noopener noreferrer">{t("Join our team", "加入團隊")}<ArrowUpRight size={16}/></a>
    </section>
    <section className="company-inquiry" aria-labelledby="inquiry-title" data-reveal>
      <span className="mono">LET’S MAKE IT HAPPEN</span><h3 id="inquiry-title">{t("Tell us what’s next.", "聊聊你的下一個專案。")}</h3>
      <p className="company-inquiry-intro">{t("A new game, a system, or a visual world — start with what you have in mind.", "一款遊戲、一套系統，或一個新的視覺世界，先從你目前的想法開始。")}</p>
      <InquiryForm zh={zh}/>
    </section>
  </div>;
}
