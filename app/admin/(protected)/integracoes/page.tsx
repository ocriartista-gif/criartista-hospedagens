const integrations=[
  ["Motor de reservas","Sistema Criartista, link externo, widget, embed ou pop-up"],
  ["Google Analytics 4","ID de medição + eventos de hotelaria"],
  ["Meta Ads / Pixel","Pixel + eventos; CAPI fica para etapa avançada"],
  ["Google Tag Manager","Container para integrações de marketing adicionais"],
  ["Google Sheets","Espelhamento de leads para operação comercial"],
  ["WhatsApp","Número e mensagens pré-preenchidas"],
  ["Redes sociais","Instagram, Facebook, TikTok, YouTube e LinkedIn"],
  ["Cookies e consentimento","Necessários, Analytics e publicidade"]
];
export default function IntegrationsPage(){return <><header className="admin-header"><div><span className="eyebrow">Ecossistema</span><h1>Integrações</h1><p>O cliente conecta ferramentas sem refazer o site.</p></div></header><div className="integration-grid">{integrations.map(([name,description])=><article className="admin-panel integration-card" key={name}><span className="integration-dot"/><h2>{name}</h2><p>{description}</p><button className="button button-secondary">Configurar</button></article>)}</div></>}
