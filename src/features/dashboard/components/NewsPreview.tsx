import type { NewsResponse } from "../domain/types";
import { LoadingErrorEmpty } from "./LoadingErrorEmpty";
import { formatTimestamp } from "./format";

/**
 * Slot do contrato de notícias. O módulo 5 é o owner da API.
 * Enquanto ela não existe, a página entrega a fixture local.
 */
export function NewsPreview({ news }: { news: NewsResponse }) {
  return (
    <section aria-labelledby="noticias-titulo" className="xp-card">
      <h2 id="noticias-titulo">Notícias</h2>
      <p className="xp-desc">Três notas para ler o painel com o cliente. As mais recentes aparecem primeiro.</p>
      {news.articles.length === 0 ? (
        <LoadingErrorEmpty state="empty" title="Nenhuma notícia de demonstração disponível." />
      ) : (
        <div className="xp-events">
          {news.articles.map((article) => (
            <article key={article.id} className="xp-event">
              <div>
                <h3>{article.title}</h3>
                {article.summary.generatedByAI ? <span className="xp-tag">marcado como gerado por IA</span> : null}
                <p>
                  {article.source} · {formatTimestamp(article.publishedAt)}
                </p>
                {article.summary.text ? <p>{article.summary.text}</p> : null}
                {article.summary.whyItMatters ? <p>{article.summary.whyItMatters}</p> : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
