import { visit } from 'unist-util-visit';
import path from 'node:path';

// Ordered phrase -> target slug map used to auto-link the first mention of a
// topic to the article that covers it in depth. Only the first occurrence of
// each phrase (and at most MAX_LINKS per post) is linkified, so this never
// litters the running text with repeated links.
const PHRASE_MAP = [
  ['distratores eficientes', 'como-criar-distratores-eficientes-em-questoes-de-multipla-escolha'],
  ['gabarito de provas organizado', 'como-criar-um-gabarito-de-provas-organizado-e-sem-erros'],
  ['prova objetiva equilibrada', 'como-montar-uma-prova-objetiva-equilibrada-e-confiavel'],
  ['ambiguidades na elaboração', 'como-evitar-ambiguidades-na-elaboracao-de-questoes-objetivas'],
  ['erros comuns na elaboração de provas', 'erros-comuns-na-elaboracao-de-provas'],
  ['questões de múltipla escolha', 'como-elaborar-boas-questoes-de-multipla-escolha'],
  ['leitor de gabarito', 'leitor-de-gabarito-o-que-e-como-funciona'],
  ['scanner de gabarito', 'scanner-de-gabarito-como-funciona'],
  ['corrigir provas pelo celular', 'como-corrigir-provas-pelo-celular'],
  ['correção automática de provas melhora a aprendizagem', 'como-a-correcao-automatica-de-provas-melhora-a-aprendizagem'],
  ['correção automática de provas', 'correcao-automatica-de-provas-vantagens-limitacoes'],
  ['calcular notas automaticamente', 'como-calcular-notas-automaticamente'],
  ['avaliação formativa e avaliação somativa', 'avaliacao-formativa-e-avaliacao-somativa-qual-a-diferenca'],
  ['avaliação formativa', 'avaliacao-formativa-como-acompanhar-a-aprendizagem'],
  ['avaliação diagnóstica', 'avaliacao-diagnostica-quando-aplicar-e-como-interpretar-os-resultados'],
  ['devolver feedback aos alunos', 'como-devolver-feedback-aos-alunos-usando-os-resultados-das-avaliacoes'],
  ['devolver as provas rapidamente', 'por-que-devolver-as-provas-rapidamente-melhora-o-aprendizado'],
  ['analisar o desempenho da turma', 'como-analisar-o-desempenho-da-turma-a-partir-dos-resultados-das-provas'],
  ['identificar dificuldades de aprendizagem', 'como-identificar-dificuldades-de-aprendizagem-usando-avaliacoes'],
  ['usar os resultados das provas', 'como-usar-os-resultados-das-provas-para-melhorar-o-ensino'],
  ['burnout docente', 'burnout-docente-como-reduzir-a-sobrecarga-com-tecnologia'],
  ['professor em burnout', 'professor-em-burnout-como-identificar-os-sinais'],
  ['síndrome de burnout', 'burnout-em-professores-como-identificar-e-prevenir'],
  ['inteligência artificial está transformando', 'como-a-inteligencia-artificial-esta-transformando-o-trabalho-do-professor'],
  ['inteligência artificial', 'como-a-inteligencia-artificial-pode-ajudar-os-professores'],
  ['carga de trabalho do professor', 'como-reduzir-a-carga-de-trabalho-do-professor'],
  ['diminuir a carga de trabalho', 'como-diminuir-a-carga-de-trabalho-do-professor'],
  ['carga de trabalho com avaliações', 'como-reduzir-a-carga-de-trabalho-com-avaliacoes-sem-perder-qualidade'],
  ['trabalho para casa', 'professor-leva-trabalho-para-casa'],
  ['perder o fim de semana', 'como-corrigir-provas-sem-perder-o-fim-de-semana'],
  ['tempo para planejar aulas', 'como-ter-mais-tempo-para-planejar-aulas'],
  ['aplicativo para corrigir provas', 'vale-a-pena-usar-aplicativo-para-corrigir-provas'],
  ['tecnologia para corrigir provas', 'vale-a-pena-usar-tecnologia-para-corrigir-provas'],
  ['correção automática de provas?', 'vale-a-pena-utilizar-correcao-automatica-de-provas'],
  ['quanto tempo um professor perde corrigindo provas', 'quanto-tempo-um-professor-perde-corrigindo-provas'],
  ['rotina de correção de provas', 'como-organizar-a-rotina-de-correcao-de-provas'],
  ['economizar tempo na correção', 'como-economizar-tempo-na-correcao-de-provas'],
  ['economizar horas', 'como-economizar-horas-na-correcao-de-provas'],
  ['reduzir o estresse na profissão docente', 'como-reduzir-o-estresse-na-profissao-docente'],
  ['professor sobrecarregado', 'professor-sobrecarregado-7-tarefas-que-podem-ser-automatizadas'],
  ['avaliações mais justas', 'como-construir-avaliacoes-mais-justas-e-confiaveis'],
  ['realmente medem a aprendizagem', 'como-elaborar-avaliacoes-que-realmente-medem-a-aprendizagem'],
  ['tecnologia na avaliação escolar', 'tecnologia-na-avaliacao-escolar-ferramentas-que-podem-economizar-horas-de-trabalho'],
  ['automatizar tarefas', 'tecnologia-na-educacao-automatizar-tarefas-docente'],
  ['planejar, aplicar, corrigir e analisar provas objetivas', 'guia-completo-planejar-aplicar-corrigir-analisar-provas-objetivas'],
  ['correção de provas mais consistente', '5-praticas-para-tornar-a-correcao-de-provas-mais-consistente'],
  ['corrigir provas objetivas mais rapidamente', 'como-corrigir-provas-objetivas-mais-rapidamente-sem-perder-a-qualidade'],
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const MAX_LINKS = 4;

export default function remarkAutoLink() {
  return (tree, file) => {
    const sourcePath = (file.history && file.history[0]) || file.path || '';
    const currentSlug = path.basename(sourcePath, '.md');
    const usedSlugs = new Set([currentSlug]);
    let linksInserted = 0;

    function tryLinkify(text) {
      for (const [phrase, targetSlug] of PHRASE_MAP) {
        if (usedSlugs.has(targetSlug)) continue;
        const re = new RegExp(escapeRegExp(phrase), 'i');
        const match = re.exec(text);
        if (match) {
          usedSlugs.add(targetSlug);
          const before = text.slice(0, match.index);
          const matchText = match[0];
          const after = text.slice(match.index + matchText.length);
          const nodes = [];
          if (before) nodes.push({ type: 'text', value: before });
          nodes.push({
            type: 'link',
            url: `/blog/${targetSlug}`,
            children: [{ type: 'text', value: matchText }],
          });
          if (after) nodes.push({ type: 'text', value: after });
          return nodes;
        }
      }
      return null;
    }

    function walk(node) {
      if (linksInserted >= MAX_LINKS || !node.children) return;
      for (let i = 0; i < node.children.length; i++) {
        if (linksInserted >= MAX_LINKS) return;
        const child = node.children[i];
        if (child.type === 'link') continue;
        if (child.type === 'text') {
          const replacement = tryLinkify(child.value);
          if (replacement) {
            node.children.splice(i, 1, ...replacement);
            i += replacement.length - 1;
            linksInserted++;
          }
        } else if (child.children) {
          walk(child);
        }
      }
    }

    visit(tree, (node) => node.type === 'paragraph' || node.type === 'listItem', (node) => {
      if (linksInserted < MAX_LINKS) walk(node);
    });
  };
}
