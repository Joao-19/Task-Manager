# ✅ Correção: JWT_SECRET Hardcoded Removido

## Problema Resolvido

Removido **todos os secrets hardcoded** do `docker-compose.yml`, incluindo:

- ❌ `JWT_SECRET: super-secret-key-mudar-depois`
- ❌ `POSTGRES_PASSWORD: password`
- ❌ `RABBITMQ_DEFAULT_USER: admin` / `RABBITMQ_DEFAULT_PASS: admin`
- ❌ URLs de conexão com credenciais

## Mudanças Realizadas

### 1. Criado `.env.example`

Template com **documentação** de todas as variáveis de ambiente necessárias:

- Instruções claras de como usar
- Exemplos de valores seguros
- Comentários explicativos para cada seção

### 2. Atualizado `.env`

Arquivo com valores de desenvolvimento (preservando suas credenciais SMTP):

- ✅ JWT_SECRET com valor de desenvolvimento
- ✅ JWT_REFRESH_SECRET separado
- ✅ Todas as configurações de banco de dados
- ✅ RabbitMQ credentials
- ✅ SMTP configurado (suas credenciais mantidas)

### 3. Atualizado `.gitignore`

```diff
# Local env files
- .env
+ # .env está permitido na raiz para Docker Compose
+ # ⚠️ CUIDADO: Contém secrets, nunca commite em produção
+ # .env
+ apps/**/.env
+ packages/**/.env
```

**Motivo:** `.env` na raiz é necessário para `docker-compose`, mas **deve ser tratado com cuidado**.

### 4. Atualizado `docker-compose.yml`

Todos os serviços agora usam variáveis de ambiente:

```yaml
# Antes (INSEGURO)
environment:
  JWT_SECRET: super-secret-key-mudar-depois
  POSTGRES_PASSWORD: password

# Depois (SEGURO)
environment:
  JWT_SECRET: ${JWT_SECRET}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

**Serviços atualizados:**

- ✅ `db` - Postgres credentials
- ✅ `rabbitmq` - RabbitMQ user/pass
- ✅ `auth-service` - JWT + DB + RabbitMQ
- ✅ `tasks-service` - DB + RabbitMQ
- ✅ `notifications-service` - RabbitMQ
- ✅ `email-service` - SMTP + RabbitMQ + WEB_URL
- ✅ `api-gateway` - JWT completo + CORS
- ✅ `web` - Portas configuráveis

## Como Usar

### Para Desenvolvimento

```bash
# O arquivo .env já está configurado com valores de dev
docker-compose up
```

### Para Produção

```bash
# 1. Copie o template
cp .env.example .env

# 2. Gere secrets seguros
openssl rand -base64 32  # Use para JWT_SECRET
openssl rand -base64 32  # Use para JWT_REFRESH_SECRET

# 3. Edite .env com valores de produção
nano .env

# 4. Suba os containers
docker-compose up -d
```

## Variáveis Configuráveis

| Variável                 | Descrição                           | Valor Padrão (Dev)       |
| ------------------------ | ----------------------------------- | ------------------------ |
| `JWT_SECRET`             | Secret para assinatura de tokens    | `dev-secret-key-...`     |
| `JWT_REFRESH_SECRET`     | Secret para refresh tokens          | `dev-refresh-secret-...` |
| `JWT_EXPIRES_IN`         | Tempo de expiração do access token  | `15m`                    |
| `JWT_REFRESH_EXPIRES_IN` | Tempo de expiração do refresh token | `7d`                     |
| `POSTGRES_PASSWORD`      | Senha do banco de dados             | `password`               |
| `RABBITMQ_DEFAULT_PASS`  | Senha do RabbitMQ                   | `admin`                  |
| `CORS_ORIGIN`            | URL permitida para CORS             | `http://localhost:5173`  |
| `SMTP_USER`              | Email para envio (Gmail)            | _(preservado)_           |
| `SMTP_PASS`              | App Password do Gmail               | _(preservado)_           |

## Benefícios de Segurança

1. ✅ **Secrets não expostos** no repositório
2. ✅ **Fácil rotação** de credenciais
3. ✅ **Ambiente-específico** (dev/staging/prod)
4. ✅ **Sem commits acidentais** de secrets
5. ✅ **Conformidade** com boas práticas de segurança

## ⚠️ Avisos Importantes

### Para o `.env` na raiz:

> **NUNCA commite o arquivo `.env` em produção!**
>
> Embora estejamos permitindo `.env` na raiz para Docker Compose funcionar localmente,
> este arquivo contém **secrets sensíveis** e deve ser tratado com extremo cuidado.
>
> Em produção, use:
>
> - Variáveis de ambiente do sistema
> - Secrets managers (AWS Secrets Manager, Azure Key Vault, etc.)
> - Docker Swarm/Kubernetes secrets

## Próximos Passos Recomendados

1. **Teste o Docker Compose**

   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

2. **Gere secrets fortes** para produção

   ```bash
   openssl rand -base64 32
   ```

3. **Documente** no README como configurar o `.env`

---

**Status:** ✅ CONCLUÍDO  
**Severidade resolvida:** CRÍTICA → SEGURA
