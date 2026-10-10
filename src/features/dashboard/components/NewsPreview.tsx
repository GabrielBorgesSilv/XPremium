import type { NewsResponse } from "../domain/types";
import { DataProvenance } from "./DataProvenance";
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
      <DataProvenance dataStatus={news.dataStatus} />
      <p className="xp-desc">
        Até três itens. Seleção demonstrativa por recência e relevância. Este bloco troca de fonte quando o módulo 5
        publicar o contrato.
      </p>
      {news.articles.length === 0 ? (
        <LoadingErrorEmpty state="empty" title="Nenhuma notícia de demonstração disponível." />
      ) : (
        <div className="xp-events">
          {news.articles.map((article) => (
            <article key={article.id} className="xp-event">
              <div>
                <h3>{article.title}</h3>
                {article.summary.generatedByAI ? (
                  <span className="xp-tag">marcado como gerado por IA</span>
                ) : (
                  <span className="xp-tag">demonstrativo</span>
                )}
                <p>
                  {article.source} · {formatTimestamp(article.publishedAt)}
                </p>
                {article.summary.text ? <p>{article.summary.text}</p> : null}
                {article.summary.whyItMatters ? <p>{article.summary.whyItMatters}</p> : null}
                {article.url ? (
                  <p>Endereço informado, não aberto nesta tela.</p>
                ) : (
                  <p>Sem link. Conteúdo demonstrativo, não clicável.</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
