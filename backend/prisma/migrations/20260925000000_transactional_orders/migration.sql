-- DropForeignKey
ALTER TABLE "pedido_itens" DROP CONSTRAINT "pedido_itens_produto_id_fkey";

-- AlterTable
ALTER TABLE "pedido_itens" ADD COLUMN     "nome_produto" TEXT;

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "entrega" JSONB,
ADD COLUMN     "idempotency_key" VARCHAR(128),
ADD COLUMN     "pagamento" TEXT NOT NULL DEFAULT 'pix-simulado';

-- CreateIndex
CREATE UNIQUE INDEX "carrinhos_usuario_id_produto_id_key" ON "carrinhos"("usuario_id", "produto_id");

-- CreateIndex
CREATE INDEX "pedido_itens_produto_id_idx" ON "pedido_itens"("produto_id");

-- CreateIndex
CREATE INDEX "pedidos_usuario_id_created_at_idx" ON "pedidos"("usuario_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_usuario_id_idempotency_key" ON "pedidos"("usuario_id", "idempotency_key");

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "produtos" ADD CONSTRAINT "produtos_stock_nonnegative" CHECK ("stock" >= 0);
ALTER TABLE "carrinhos" ADD CONSTRAINT "carrinhos_quantidade_positive" CHECK ("quantidade" > 0);
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_quantidade_positive" CHECK ("quantidade" > 0);
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_preco_nonnegative" CHECK ("preco" >= 0);
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_total_nonnegative" CHECK ("total" >= 0);
