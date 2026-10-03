/** Renderizador mínimo e seguro (sem HTML) para parágrafos, ## títulos e listas "- ". */
export function Markdown({ texto }: { texto: string }) {
  const blocos = texto.split(/\n{2,}/);
  return (
    <div className="prose-artigo">
      {blocos.map((b, i) => {
        const t = b.trim();
        if (t.startsWith("## ")) return <h2 key={i}>{t.slice(3)}</h2>;
        const linhas = t.split("\n");
        if (linhas.every((l) => l.trim().startsWith("- ")))
          return (
            <ul key={i}>
              {linhas.map((l, j) => (
                <li key={j}>{l.trim().slice(2)}</li>
              ))}
            </ul>
          );
        return <p key={i}>{t}</p>;
      })}
    </div>
  );
}
