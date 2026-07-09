import type { PagamentoCamiseta, PagamentoCrianca, PagamentoInscricao } from "@/lib/types";
import { PAGAMENTO_CAMISETA_LABELS, PAGAMENTO_INSCRICAO_LABELS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

function getPagamentoVariant(
  pagamento: PagamentoInscricao | PagamentoCamiseta | PagamentoCrianca
): "destructive" | "cash" | "venmo" | "free" {
  switch (pagamento) {
    case "NAO":
      return "destructive";
    case "CASH":
      return "cash";
    case "VENMO":
      return "venmo";
    case "FREE":
      return "free";
    default:
      return "destructive";
  }
}

export function PagamentoBadge({
  pagamento,
  type = "inscricao",
}: {
  pagamento: PagamentoInscricao | PagamentoCamiseta | PagamentoCrianca;
  type?: "inscricao" | "camiseta" | "crianca";
}) {
  const label =
    type === "inscricao"
      ? PAGAMENTO_INSCRICAO_LABELS[pagamento as PagamentoInscricao]
      : PAGAMENTO_CAMISETA_LABELS[pagamento as PagamentoCamiseta];

  return <Badge variant={getPagamentoVariant(pagamento)}>{label}</Badge>;
}
