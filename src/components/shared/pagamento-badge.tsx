import type { PagamentoCamiseta, PagamentoInscricao } from "@/lib/types";
import { PAGAMENTO_CAMISETA_LABELS, PAGAMENTO_INSCRICAO_LABELS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

function getPagamentoVariant(
  pagamento: PagamentoInscricao | PagamentoCamiseta
): "destructive" | "cash" | "venmo" | "doacao" {
  switch (pagamento) {
    case "NAO":
      return "destructive";
    case "CASH":
      return "cash";
    case "VENMO":
      return "venmo";
    case "DOACAO":
      return "doacao";
    default:
      return "destructive";
  }
}

export function PagamentoBadge({
  pagamento,
  type = "inscricao",
}: {
  pagamento: PagamentoInscricao | PagamentoCamiseta;
  type?: "inscricao" | "camiseta";
}) {
  const label =
    type === "inscricao"
      ? PAGAMENTO_INSCRICAO_LABELS[pagamento as PagamentoInscricao]
      : PAGAMENTO_CAMISETA_LABELS[pagamento as PagamentoCamiseta];

  return <Badge variant={getPagamentoVariant(pagamento)}>{label}</Badge>;
}
