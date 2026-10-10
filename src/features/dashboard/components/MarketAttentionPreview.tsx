import { formatTimestamp } from "./format";

type AttentionNews = {
  items: { id: string; titulo: string; url: string; resumo: string | null; descricao: string | null; ticker: string | null; fonte: string; publicadoEm: string | null; resumoGerado: boolean; origemAnalise: "openai" | "heuristica" | "nenhuma" }[];
  status: "fresh" | "stale" | "unavailable";
};

type AttentionAlerts = {
  items: { id: string; ticker: string; criticidade: "P1" | "P2" | "P3" | "informativo"; direcao: string; justificativa: string; evidencia: string; confianca: number; titulo: string; resumo: string; url: string; fonte: string; publicadoEm: string | null }[];
  status: "available" | "unavailable";
};

export function MarketAttentionPreview({ news, alerts }: { news: AttentionNews; alerts: AttentionAlerts }) {
  return (
    <section className="xp-card xp-market-attention" aria-labelledby="market-attention-title">
      <div className="xp-alert-heading"><div><div className="xp-kicker">RADAR DO ASSESSOR</div><h2 id="market-attention-title">Pontos de atenção</h2><p className="xp-desc">Triagem informacional para revisão humana. Não representa exposição confirmada de clientes.</p></div><span className="xp-tag">{alerts.status === "available" ? `${alerts.items.length} alertas` : "Alertas indisponíveis"}</span></div>
      {alerts.status === "unavailable" ? <p className="xp-empty-inline">Não foi possível consultar os alertas salvos.</p> : alerts.items.length === 0 ? <p className="xp-empty-inline">Nenhum alerta associado a instrumento monitorado.</p> : <div className="xp-alert-list">{alerts.items.map((alert) => <article className={`xp-alert xp-alert-${alert.criticidade.toLowerCase()}`} key={alert.id}>
        <div className="xp-alert-meta"><span className="xp-tag">{alert.criticidade} · {alert.ticker}</span><span className="xp-direction">{alert.direcao}</span><span className="xp-alert-confidence">Confiança {Math.round(alert.confianca * 100)}%</span></div>
        <h3><a href={alert.url} target="_blank" rel="noreferrer">{alert.titulo} ↗</a></h3><p>{alert.resumo}</p><p className="xp-alert-reason"><b>Por que apareceu:</b> {alert.justificativa} · evidência: “{alert.evidencia}”</p><small>{alert.fonte} · {formatTimestamp(alert.publicadoEm)}</small>
      </article>)}</div>}
      <div className="xp-market-news-list"><h3>Notícias recentes</h3>
        {news.status === "unavailable" ? <p className="xp-empty-inline">Notícias indisponíveis. Verifique a ingestão configurada.</p> : news.items.length === 0 ? <p className="xp-empty-inline">Nenhuma notícia real foi ingerida.</p> : news.items.map((article) => <article key={article.id}>{article.ticker ? <span className="xp-tag">{article.ticker}</span> : <span className="xp-tag">Sem ticker identificado</span>}
          <h4><a href={article.url} target="_blank" rel="noreferrer">{article.titulo} ↗</a></h4><p>{article.resumo ?? article.descricao ?? "Resumo indisponível."}</p><small>{article.fonte} · {formatTimestamp(article.publicadoEm)}{article.origemAnalise === "openai" ? " · analisado pela OpenAI" : article.origemAnalise === "heuristica" ? " · fallback local (nao IA)" : " · sem analise IA"}</small>
        </article>)}
      </div>
    </section>
  );
}
