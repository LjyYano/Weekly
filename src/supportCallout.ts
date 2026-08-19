export const SUPPORT_CALLOUT = {
  zh: "更多文章：Yano Blog",
  en: "More writing: Yano Blog",
  link: { zh: "https://yano.blog", en: "https://yano.blog" },
};

export const renderSupportCalloutForRSS = (lang: "zh" | "en" = "zh") => {
  const cta = SUPPORT_CALLOUT[lang] ?? SUPPORT_CALLOUT.zh;
  const link = SUPPORT_CALLOUT.link[lang] ?? SUPPORT_CALLOUT.link.zh;
  return `
    <hr style="border:none;border-top:0.5px solid rgba(0,0,0,0.08);margin:26px 0 14px;" />
    <p style="text-align:left;margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <a
        href="${link}"
        style="
          display:inline-block;
          padding:6px 18px;
          border-radius:999px;
          background:#222;
          color:#fff;
          font-size:13px;
          text-decoration:none;
        "
        target="_blank"
        rel="noreferrer"
      >${cta}</a>
    </p>
  `.trim();
};
