-- Inicialização do banco de dados PostgreSQL para produção
-- Este arquivo é executado apenas na primeira inicialização do container

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Configurações de performance
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Recarregar configurações
SELECT pg_reload_conf();

-- Criar usuário para aplicação (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'gwan_app') THEN
        CREATE ROLE gwan_app WITH LOGIN PASSWORD 'gwan_app_password';
    END IF;
END
$$;

-- Conceder permissões
GRANT CONNECT ON DATABASE gwan_events TO gwan_app;
GRANT USAGE ON SCHEMA public TO gwan_app;
GRANT CREATE ON SCHEMA public TO gwan_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gwan_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO gwan_app;

-- Configurar permissões padrão para objetos futuros
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO gwan_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO gwan_app;

-- Log de inicialização
INSERT INTO pg_stat_statements_info VALUES (now(), 'Database initialized successfully');
